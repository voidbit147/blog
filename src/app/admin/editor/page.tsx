"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SITE } from "@/lib/constants";

type SaveMode = "filesystem" | "github";

export default function AdminEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tech");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  // 加载已有文章
  useEffect(() => {
    if (!slug) return;
    fetch(`${SITE.basePath}/search-index.json`)
      .then((r) => r.json())
      .then((docs: Record<string, unknown>[]) => {
        const doc = docs.find(
          (d) => (d as Record<string, string>).slug === slug,
        ) as Record<string, string> | undefined;
        if (doc) {
          setTitle(doc.title || "");
          setDescription(doc.description || "");
          setCategory(doc.category || "tech");
          setTags((doc.tags as unknown as string[])?.join(", ") || "");
          setContent(doc.content || "");
        }
      })
      .catch(() => {});
  }, [slug]);

  // 粘贴图片处理
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
            const newContent =
              content.slice(0, start) + imageMd + content.slice(end);
            setContent(newContent);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [content],
  );

  // 保存
  const handleSave = async (mode: SaveMode) => {
    setSaving(true);
    setError("");

    const frontmatter = `---
title: "${title}"
description: "${description}"
date: ${new Date().toISOString().split("T")[0]}
category: ${category}
tags:
${tags
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean)
  .map((t) => `  - ${t}`)
  .join("\n")}
---

${content}`;

    if (mode === "filesystem") {
      try {
        const res = await fetch("/api/save-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            category,
            content: frontmatter,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(`保存失败：${(err as Error).message}`);
      }
    } else if (mode === "github") {
      const token = localStorage.getItem("github_token");
      if (!token) {
        setError("未设置 GitHub Token。请在 localStorage 中设置 'github_token'。");
        setSaving(false);
        return;
      }
      try {
        const repo = "Doub1e-Happy/blog";
        const filePath = `content/blog/${category}/${slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mdx`;
        const contentBase64 = btoa(unescape(encodeURIComponent(frontmatter)));

        const res = await fetch(
          `https://api.github.com/repos/${repo}/contents/${filePath}`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `📝 更新文章：${title}`,
              content: contentBase64,
            }),
          },
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(
            (errData as { message?: string }).message || res.statusText,
          );
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(`GitHub 保存失败：${(err as Error).message}`);
      }
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 工具栏 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
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
            onClick={() => handleSave("filesystem")}
            disabled={saving}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存（本地）"}
          </button>
          <button
            onClick={() => handleSave("github")}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存到 GitHub"}
          </button>
        </div>
      </div>

      {/* 状态提示 */}
      {saved && (
        <div className="mb-4 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600 dark:text-green-400">
          ✓ 文章保存成功！
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className={`grid gap-8 ${preview ? "" : "lg:grid-cols-[2fr_1fr]"}`}>
        {/* 编辑器 */}
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
                placeholder="在这里写 Markdown... 支持粘贴图片！"
                className="min-h-[60vh] w-full rounded-xl border border-border bg-surface p-4 font-mono text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
              />
            </div>

            {/* 元信息侧栏 */}
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
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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

              <div className="rounded-lg border border-border bg-bg-secondary p-3">
                <p className="text-xs text-text-secondary">
                  💡 <strong>提示：</strong>直接在编辑器中粘贴图片即可嵌入。
                </p>
              </div>
            </div>
          </>
        ) : (
          /* 预览 */
          <div className="rounded-xl border border-border bg-surface p-8">
            <div className="prose max-w-none">
              {content ? (
                <MarkdownPreview content={content} />
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

function MarkdownPreview({ content }: { content: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const lines = content.split("\n");
    const parts: string[] = [];
    let inCode = false;
    let codeBuf: string[] = [];

    for (const line of lines) {
      if (line.startsWith("```")) {
        if (inCode) {
          parts.push(
            `<pre class="bg-code-bg border border-border rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">${codeBuf.join(
              "\n",
            )}</code></pre>`,
          );
          codeBuf = [];
          inCode = false;
        } else {
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        continue;
      }

      if (line.startsWith("### ")) {
        parts.push(
          `<h3 class="text-xl font-bold mt-6 mb-3">${line.slice(4)}</h3>`,
        );
      } else if (line.startsWith("## ")) {
        parts.push(
          `<h2 class="text-2xl font-bold mt-8 mb-4 border-b border-border pb-2">${line.slice(3)}</h2>`,
        );
      } else if (line.startsWith("# ")) {
        parts.push(
          `<h1 class="text-3xl font-bold mt-8 mb-4">${line.slice(2)}</h1>`,
        );
      } else if (line.startsWith("- ")) {
        parts.push(`<li class="ml-4 text-text-secondary">${line.slice(2)}</li>`);
      } else if (line.startsWith("> ")) {
        parts.push(
          `<blockquote class="border-l-2 border-primary pl-4 italic text-text-secondary my-4">${line.slice(2)}</blockquote>`,
        );
      } else if (line.trim() === "") {
        parts.push("<br/>");
      } else {
        let l = line;
        l = l.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        l = l.replace(/\*(.+?)\*/g, "<em>$1</em>");
        l = l.replace(/`(.+?)`/g, '<code class="bg-code-bg px-1 rounded text-sm font-mono">$1</code>');
        l = l.replace(
          /\[(.+?)\]\((.+?)\)/g,
          '<a href="$2" class="text-primary hover:underline">$1</a>',
        );
        parts.push(`<p class="mb-3 text-text-secondary">${l}</p>`);
      }
    }

    if (inCode && codeBuf.length > 0) {
      parts.push(
        `<pre class="bg-code-bg border border-border rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">${codeBuf.join(
          "\n",
        )}</code></pre>`,
      );
    }

    setHtml(parts.join("\n"));
  }, [content]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
