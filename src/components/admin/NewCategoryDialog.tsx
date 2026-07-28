"use client";

import { useState } from "react";

/** 新建分类对话框。成功后调用 onCreated(newSlug) 让父级选中并刷新列表。 */
export function NewCategoryDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (newSlug: string) => void;
}) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "新建失败");
      onCreated(data.category.slug);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-bold">新建分类</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Slug（URL 标识，小写英文/数字/连字符）
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="如：security、ai-agent"
              className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              分类名称（显示名）
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：安全、AI Agent"
              className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              描述（可选）
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="一句话描述这个分类"
              className="w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving || !slug || !name}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? "创建中..." : "创建"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
