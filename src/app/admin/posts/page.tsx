"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import type { SearchDocument } from "@/types";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<SearchDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${SITE.basePath}/search-index.json`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-text-secondary">
        加载中...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">管理文章</h1>
        <Link
          href="/admin/editor"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
        >
          新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
          还没有文章，快去写第一篇吧！
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-all hover:border-primary/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                    {post.category}
                  </span>
                  <span className="text-xs text-text-secondary/50">
                    {new Date(post.date).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <h3 className="truncate font-semibold text-text">
                  {post.title}
                </h3>
                <p className="truncate text-sm text-text-secondary">
                  {post.description}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 gap-2">
                <Link
                  href={`/admin/editor?slug=${encodeURIComponent(post.slug)}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  编辑
                </Link>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  查看
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
