"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  parseFrontmatter,
  serializePost,
} from "@/lib/frontmatter";
import type { MilkdownEditorHandle } from "@/components/admin/MilkdownEditor";
import { NewCategoryDialog } from "@/components/admin/NewCategoryDialog";

// Milkdown 依赖 ProseMirror，禁用 SSR 避免在服务端访问 document。
const MilkdownEditor = dynamic(
  () => import("@/components/admin/MilkdownEditor").then((m) => m.MilkdownEditor),
  { ssr: false, loading: () => <div className="text-text-secondary">编辑器加载中…</div> },
);

export default function AdminEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");
  const category = searchParams.get("category") || "tech";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postCategory, setPostCategory] = useState(category);
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false); // 是否为编辑已有文章
  const [originalDate, setOriginalDate] = useState<string | undefined>();
  const [mtime, setMtime] = useState<number | undefined>();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // 分类列表（从 API 动态加载，支持后台新建）
  const [categories, setCategories] = useState<
    { slug: string; name: string; description: string }[]
  >([]);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const editorRef = useRef<MilkdownEditorHandle | null>(null);
  // 新建保存后 router.replace 会触发 slug 变化，跳过随之而来的重新加载，
  // 避免用服务器返回的旧 body 覆盖用户当前编辑内容。
  const skipNextFetch = useRef(false);
  // 控制 Milkdown 重建：null = 还在加载/未决定，"" = 新建空文档，其他 = 已加载文章正文。
  // 新建文章（无 slug）直接用空串初始化，避免在 effect 里 setState。
  const [markdownKey, setMarkdownKey] = useState<string | null>(
    slug ? null : "",
  );

  // 加载已有文章
  useEffect(() => {
    if (!slug) return;
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    setEditing(true);
    setError("");
    fetch(
      `/api/admin/posts/${encodeURIComponent(slug)}?category=${encodeURIComponent(category)}`,
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("加载文章失败");
        return (await res.json()) as {
          raw: string;
          category: string;
          mtime: number;
        };
      })
      .then((data) => {
        const { frontmatter, body } = parseFrontmatter(data.raw);
        setTitle(frontmatter.title);
        setDescription(frontmatter.description);
        setPostCategory(frontmatter.category || category);
        setTags(frontmatter.tags.join(", "));
        setContent(body);
        setOriginalDate(frontmatter.date);
        setMtime(data.mtime);
        setMarkdownKey(body);
      })
      .catch((err) => setError(err.message));
  }, [slug, category]);

  // 加载分类列表
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d: { categories: typeof categories }) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  const refreshCategories = useCallback(async () => {
    const r = await fetch("/api/admin/categories");
    if (r.ok) {
      const d = (await r.json()) as { categories: typeof categories };
      setCategories(d.categories);
    }
  }, []);

  const handleCategoryCreated = async (newSlug: string) => {
    await refreshCategories();
    setPostCategory(newSlug);
    setShowNewCategory(false);
  };

  // 编辑器内容变化时实时同步到 content state，保存时优先取编辑器实例，
  // 若编辑器未就绪则回退到 content（已实时同步）。
  const handleEditorChange = (md: string) => {
    setContent(md);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("请填写标题");
      return;
    }

    // 优先从编辑器实例取最新 markdown（编辑器内部状态才是权威）；
    // 若编辑器尚未就绪，回退到 content（已通过 onChange 实时同步）。
    const md = editorRef.current?.isReady()
      ? editorRef.current.getMarkdown()
      : content;

    setSaving(true);
    setError("");

    const slugStr =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slugStr) {
      setError("无法从标题生成 slug，请使用英文标题");
      setSaving(false);
      return;
    }

    const raw = serializePost(
      { title, description, category: postCategory, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) },
      md,
      { preserveDate: editing, originalDate },
    );

    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(slugStr)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: postCategory, raw, expectedMtime: mtime }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "保存失败");
      }

      const data = (await res.json()) as { mtime?: number };
      if (data.mtime) setMtime(data.mtime);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // 新建保存成功后：本地切到编辑态，并标记跳过随之而来的重新加载，
      // 避免用服务器返回的 body 覆盖用户当前编辑内容。
      if (!editing && slug === null) {
        setEditing(true);
        skipNextFetch.current = true;
        router.replace(
          `/admin/editor?slug=${encodeURIComponent(slugStr)}&category=${encodeURIComponent(postCategory)}`,
        );
      }
    } catch (err) {
      setError(`保存失败：${(err as Error).message}`);
    }
    setSaving(false);
  };

  // markdownKey 变化时重建编辑器，并把最新内容回调上来
  // 通过给 MilkdownEditor 传 onChange（用 key 重建 + ref 取值即可，这里用 editorRef）
  // 为拿到实时内容用于预览/未保存提示，我们额外用 onUnmount 不可行；
  // 保存时统一从 editorRef 取，足够。

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text"
          >
            &larr; 返回
          </Link>
          <h1 className="text-xl font-bold">
            {editing ? "编辑文章" : "新建文章"}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* Status messages */}
      {saved && (
        <div className="mb-4 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600 dark:text-green-400">
          ✓ 文章已保存
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Editor */}
        <div className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xl font-bold text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {/* Milkdown 编辑器容器 */}
          <div className="milkdown-host rounded-xl border border-border bg-surface p-4 min-h-[60vh]">
            {markdownKey !== null && (
              <MilkdownEditor
                key={markdownKey}
                initialMarkdown={markdownKey}
                editorRef={editorRef}
                onChange={handleEditorChange}
              />
            )}
          </div>
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="文章摘要..."
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-text">分类</label>
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="text-xs font-medium text-primary transition-colors hover:text-primary-hover" suppressHydrationWarning
              >
                + 新建分类
              </button>
            </div>
            <select
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              标签（逗号分隔）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="如：react, typescript, 教程"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="rounded-lg border border-border bg-bg-secondary p-3">
            <p className="text-xs text-text-secondary">
              💡 <strong>提示：</strong>编辑器支持所见即所得，粘贴/拖入图片会自动上传到服务器。保存即生效，前台即时可见。
            </p>
          </div>
        </div>
      </div>

      {showNewCategory && (
        <NewCategoryDialog
          onClose={() => setShowNewCategory(false)}
          onCreated={handleCategoryCreated}
        />
      )}
    </div>
  );
}
