"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getToken,
  listGitHubDir,
  fetchFileFromGitHub,
  parseFrontmatter,
  deleteFileFromGitHub,
  triggerDeploy,
  REPO,
} from "@/lib/github";
import { GitHubStatus } from "@/components/admin/GitHubStatus";
import { CATEGORIES } from "@/lib/constants";

interface PostInfo {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  path: string;
  sha: string;
}

/** Delete confirmation dialog */
function DeleteConfirmDialog({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
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
            确定要删除文章「{title}」吗？此操作将从 GitHub 仓库中删除文件并触发重新部署，不可撤销。
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
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600"
          >
            确认删除
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
  const [token, setToken] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostInfo | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Initialize token
  useEffect(() => {
    setToken(getToken());
  }, []);

  /** Fetch all posts from GitHub API */
  const fetchPosts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("未设置 GitHub Token，请在管理后台设置。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const allPosts: PostInfo[] = [];

      // List each category directory
      for (const cat of CATEGORIES) {
        const entries = await listGitHubDir(
          `content/blog/${cat.slug}`,
          token
        );
        if (!entries) continue;

        // Filter .mdx files
        const mdxFiles = entries.filter(
          (e) => e.type === "file" && e.name.endsWith(".mdx")
        );

        // Fetch each file's content to parse frontmatter
        for (const file of mdxFiles) {
          const result = await fetchFileFromGitHub(file.path, token);
          if (!result) continue;

          const { frontmatter } = parseFrontmatter(result.content);
          const slug = file.name.replace(/\.mdx$/, "");

          allPosts.push({
            slug,
            title: (frontmatter.title as string) || slug,
            description: (frontmatter.description as string) || "",
            date: (frontmatter.date as string) || "",
            category: (frontmatter.category as string) || cat.slug,
            tags: (frontmatter.tags as string[]) || [],
            path: file.path,
            sha: result.sha,
          });
        }
      }

      // Sort by date descending
      allPosts.sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPosts(allPosts);
    } catch (err) {
      setError(`加载失败：${(err as Error).message}`);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /** Handle delete */
  const handleDelete = async (post: PostInfo) => {
    setDeleting(post.slug);
    setDeleteError("");

    const success = await deleteFileFromGitHub(
      post.path,
      post.sha,
      token,
      `🗑️ 删除文章：${post.title}`
    );

    if (success) {
      // Trigger redeploy
      await triggerDeploy(token);
      window.__githubStatusStartPolling?.();

      // Remove from local list
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
      setDeleteTarget(null);
    } else {
      setDeleteError(`删除「${post.title}」失败，请检查 Token 权限。`);
    }

    setDeleting(null);
  };

  // No token state
  if (!token && !loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
          <p className="mb-3 text-yellow-600 dark:text-yellow-400">
            ⚠️ 未设置 GitHub Token，无法管理文章
          </p>
          <Link
            href="/admin.html"
            className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
          >
            前往设置
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-text-secondary">
        <span className="inline-block animate-spin mr-2">⟳</span>
        正在从 GitHub 加载文章列表...
      </div>
    );
  }

  // Error state
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
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin.html"
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
            href="/admin/editor.html"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
          >
            新建文章
          </Link>
        </div>
      </div>

      {/* Deploy status */}
      {token && (
        <div className="mb-4">
          <GitHubStatus token={token} />
        </div>
      )}

      {/* Delete error */}
      {deleteError && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </div>
      )}

      {/* Post count */}
      <p className="mb-4 text-sm text-text-secondary">
        共 {posts.length} 篇文章
      </p>

      {/* Empty state */}
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
                  href={`/admin/editor.html?slug=${encodeURIComponent(post.slug)}&category=${encodeURIComponent(post.category)}`}
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
                  disabled={deleting === post.slug}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:border-red-500 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deleting === post.slug ? "删除中..." : "删除"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          title={deleteTarget.title}
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
