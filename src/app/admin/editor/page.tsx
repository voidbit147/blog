"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  REPO,
  getToken,
  fetchFileFromGitHub,
  parseFrontmatter,
  triggerDeploy,
} from "@/lib/github";
import { GitHubStatus } from "@/components/admin/GitHubStatus";

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
  const [sha, setSha] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [token, setToken] = useState("");

  // Initialize token
  useEffect(() => {
    setToken(getToken());
  }, []);

  // Load existing post
  useEffect(() => {
    if (!slug || !token) return;
    const filePath = `content/blog/${category}/${slug}.mdx`;
    fetchFileFromGitHub(filePath, token).then((result) => {
      if (!result) {
        setError("加载文章失败，请检查 GitHub Token 和文件路径");
        return;
      }
      setSha(result.sha);
      const { frontmatter, body } = parseFrontmatter(result.content);
      setTitle((frontmatter.title as string) || "");
      setDescription((frontmatter.description as string) || "");
      setPostCategory((frontmatter.category as string) || category);
      const tagList = frontmatter.tags as string[] | undefined;
      setTags(tagList?.join(", ") || "");
      setContent(body);
    });
  }, [slug, category, token]);

  // Paste image
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            const textarea = e.target as HTMLTextAreaElement;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const imageMd = `\n![粘贴图片](${dataUrl})\n`;
            setContent(content.slice(0, start) + imageMd + content.slice(end));
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [content]
  );

  // Save to GitHub + trigger deploy
  const handleSave = async () => {
    if (!token) {
      setError("未设置 GitHub Token。请在管理后台设置。");
      return;
    }
    setSaving(true);
    setError("");

    const slugStr = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filePath = `content/blog/${postCategory}/${slugStr}.mdx`;

    const frontmatter = `---
title: "${title}"
description: "${description}"
date: ${new Date().toISOString().split("T")[0]}
category: ${postCategory}
tags:
${tags
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean)
  .map((t) => `  - ${t}`)
  .join("\n")}
---

${content}`;

    const contentBase64 = btoa(unescape(encodeURIComponent(frontmatter)));

    const body: Record<string, unknown> = {
      message: `📝 ${slug ? "更新" : "新建"}文章：${title}`,
      content: contentBase64,
    };
    // Update existing file requires sha
    if (sha) body.sha = sha;

    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/contents/${filePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          (errData as { message?: string }).message || res.statusText
        );
      }

      // Update sha
      const data = await res.json();
      if (data.content?.sha) setSha(data.content.sha);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // Trigger deploy
      const deployed = await triggerDeploy(token);
      if (deployed) {
        window.__githubStatusStartPolling?.();
      }
    } catch (err) {
      setError(`保存失败：${(err as Error).message}`);
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/posts.html")}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text"
          >
            &larr; 返回
          </button>
          <h1 className="text-xl font-bold">
            {slug ? "编辑文章" : "新建文章"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            {preview ? "编辑" : "预览"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !token}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存并部署"}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {saved && (
        <div className="mb-4 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600 dark:text-green-400">
          ✓ 文章已保存到 GitHub，正在自动部署...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Deploy status */}
      {token && <div className="mb-4"><GitHubStatus token={token} /></div>}

      <div className={`grid gap-8 ${preview ? "" : "lg:grid-cols-[2fr_1fr]"}`}>
        {/* Editor */}
        {!preview ? (
          <>
            <div className="space-y-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="文章标题"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xl font-bold text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="在这里写 Markdown / MDX... 支持粘贴图片！"
                className="min-h-[60vh] w-full rounded-xl border border-border bg-surface p-4 font-mono text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              />
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
                <label className="mb-1.5 block text-sm font-medium text-text">
                  分类
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="tech">技术</option>
                  <option value="tutorials">教程</option>
                  <option value="life">生活</option>
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

              {!token && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ 未设置 GitHub Token，无法保存。请在
                    <Link href="/admin.html" className="underline">管理后台</Link>
                    设置。
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-bg-secondary p-3">
                <p className="text-xs text-text-secondary">
                  💡 <strong>提示：</strong>保存后自动触发部署，约 2-3 分钟后生效。支持粘贴图片。
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Preview */
          <div className="rounded-xl border border-border bg-surface p-8">
            <div className="prose max-w-none">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-text-secondary">暂无内容可预览。</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
