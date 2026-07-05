import Link from "next/link";
import { getAllPosts, getRecentPosts } from "@/lib/posts";
import { CATEGORIES, SITE } from "@/lib/constants";
import { PostCard } from "@/components/blog/PostCard";
import { PixelAvatar } from "@/components/ui/PixelAvatar";

export default function HomePage() {
  const recentPosts = getRecentPosts(3);
  const allPosts = getAllPosts();

  const tagCount: Record<string, number> = {};
  for (const post of allPosts) {
    for (const tag of post.frontmatter.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }
  const tags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* ── Hero ── */}
      <section className="pb-12 pt-6 text-center sm:pt-12">
        <div className="mx-auto mb-6 flex justify-center">
          <PixelAvatar size={96} />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            V0idbit
          </span>
        </h1>
        <p className="mb-1 text-lg font-medium text-text-secondary">
          网络安全 / AI For CyberSecurity
        </p>
        <p className="mx-auto max-w-lg text-text-secondary">
          {SITE.description}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/blog"
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25"
          >
            阅读博客
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-secondary transition-all hover:border-primary hover:text-primary"
          >
            关于我
          </Link>
        </div>
      </section>

      {/* ── 最新文章 ── */}
      {recentPosts.length > 0 && (
        <section className="py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">最新文章</h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              查看全部 &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ── 分类 ── */}
      <section className="py-8">
        <h2 className="mb-6 text-2xl font-bold">分类</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const count = allPosts.filter(
              (p) => p.frontmatter.category === cat.slug,
            ).length;
            return (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
              >
                <h3 className="mb-1 font-semibold text-text transition-colors group-hover:text-primary">
                  {cat.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {cat.description}
                </p>
                <span className="mt-3 inline-block rounded-full bg-bg-secondary px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                  {count} 篇
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 标签云 ── */}
      {tags.length > 0 && (
        <section className="py-8">
          <h2 className="mb-6 text-2xl font-bold">话题</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="rounded-lg bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary transition-all hover:bg-primary/10 hover:text-primary"
              >
                {tag}
                <span className="ml-1 text-xs opacity-50">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
