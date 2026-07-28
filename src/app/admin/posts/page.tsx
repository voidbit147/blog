"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface PostInfo {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  relPath: string;
  mtime: number;
}

function DeleteConfirmDialog({
  title,
  onConfirm,
  onCancel,
  deleting,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            🗑️
          </div>
          <h3 className="text-lg font-bold">确认删除</h3>
          <p className="mt-2 text-sm text-text-secondary">
            确定要删除文章「{title}」吗？此操作将从服务器删除文件，不可撤销。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? "删除中..." : "确认删除"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostInfo | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/posts");
      if (!res.ok) throw new Error("加载失败");
      const data = (await res.json()) as { posts: PostInfo[] };
      setPosts(data.posts);
    } catch (err) {
      setError(`加载失败：${(err as Error).message}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // 首次挂载拉取文章列表；setState 在 async 函数内，非 effect 同步调用。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (post: PostInfo) => {
    setDeleting(post.slug);
    setDeleteError("");

    try {
      const res = await fetch(
        `/api/admin/posts/${encodeURIComponent(post.slug)}?category=${encodeURIComponent(post.category)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "删除失败");
      }
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(`删除「${post.title}」失败：${(err as Error).message}`);
    }

    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-text-secondary">
        <span className="mr-2 inline-block animate-spin">⟳</span>
        正在加载文章列表...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:text-text"
          >
            &larr; 返回
          </Link>
          <h1 className="text-3xl font-bold">管理文章</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPosts}
            className="rounded-xl border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
            title="刷新列表"
          >
            🔄 刷新
          </button>
          <Link
            href="/admin/editor"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
          >
            新建文章
          </Link>
        </div>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </div>
      )}

      <p className="mb-4 text-sm text-text-secondary">共 {posts.length} 篇文章</p>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
          还没有文章，快去写第一篇吧！
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={`${post.category}/${post.slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-all hover:border-primary/30"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    {post.category}
                  </span>
                  {post.date && (
                    <span className="text-xs text-text-secondary/50">
                      {new Date(post.date).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                </div>
                <h3 className="truncate font-semibold text-text">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="truncate text-sm text-text-secondary">
                    {post.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex shrink-0 gap-2">
                <Link
                  href={`/admin/editor?slug=${encodeURIComponent(post.slug)}&category=${encodeURIComponent(post.category)}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  编辑
                </Link>
                <Link
                  href={`/blog/${post.category}/${post.slug}`}
                  target="_blank"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  查看
                </Link>
                <button
                  onClick={() => setDeleteTarget(post)}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-500 hover:bg-red-500/10"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          title={deleteTarget.title}
          deleting={deleting === deleteTarget.slug}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError("");
          }}
        />
      )}
    </div>
  );
}
