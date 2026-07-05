import { Metadata } from "next";
import { getAllPosts, getAllCategories, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "博客",
  description: "全部文章",
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">全部文章</h1>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* 侧边筛选 */}
        <aside className="space-y-6">
          {/* 分类 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">分类</h3>
            <div className="flex flex-col gap-1">
              {categories.map(({ name, count }) => (
                <a
                  key={name}
                  href={`/blog/category/${name}`}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-primary"
                >
                  <span className="capitalize">{name}</span>
                  <span className="text-xs tabular-nums opacity-50">
                    {count}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-text">标签</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(({ name, count }) => (
                <a
                  key={name}
                  href={`/blog/tag/${name}`}
                  className="rounded-md bg-bg-secondary px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {name}
                  <span className="ml-1 opacity-50">{count}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* 文章列表 */}
        <div className="min-w-0">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-text-secondary">还没有文章，敬请期待。</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
