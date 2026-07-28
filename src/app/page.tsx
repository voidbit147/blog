import Link from "next/link";
import { getAllPosts, getRecentPosts } from "@/lib/posts";
import { SITE } from "@/lib/constants";
import { getCategoriesSync } from "@/lib/server/categories";
import { PostCard } from "@/components/blog/PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { TypewriterTitle } from "@/components/effects/TypewriterTitle";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { LiveClock } from "@/components/widgets/LiveClock";
import { DailyQuote } from "@/components/widgets/DailyQuote";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { SiteStats } from "@/components/widgets/SiteStats";
import { MiniCalendar } from "@/components/widgets/MiniCalendar";

// 文章随时可能通过后台新增/修改，首页每次请求都重新读取文件系统。
export const dynamic = "force-dynamic";

export default function HomePage() {
  const recentPosts = getRecentPosts(3);
  const allPosts = getAllPosts();
  const categories = getCategoriesSync();

  const tagCount: Record<string, number> = {};
  for (const post of allPosts) {
    for (const tag of post.frontmatter.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }
  const tags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  // Collect post dates for calendar
  const postDates = new Set(
    allPosts.map((p) => p.frontmatter.date.split("T")[0])
  );

  // Stats
  const uniqueTags = Object.keys(tagCount).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* ── Hero ── */}
      <section className="relative pb-12 pt-6 text-center sm:pt-12">
        <ParticleBackground />
        <div className="relative z-10">
          <div className="mx-auto mb-6 flex justify-center">
            <Avatar size={96} />
          </div>
          <TypewriterTitle />
          <p className="mb-1 text-lg font-medium text-text-secondary">
            网络安全 / AI For CyberSecurity
          </p>
          <p className="mx-auto max-w-lg whitespace-nowrap text-text-secondary">
            {SITE.description}
          </p>

          {/* 日期 / 时间 / 天气 纵向三行 */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <LiveClock />
            <WeatherWidget />
          </div>

          {/* Daily Quote */}
          <div className="mt-6">
            <DailyQuote />
          </div>

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
        </div>
      </section>

      {/* ── 站点统计 ── */}
      <ScrollReveal>
        <section className="py-8">
          <SiteStats
            postCount={allPosts.length}
            categoryCount={categories.length}
            tagCount={uniqueTags}
          />
        </section>
      </ScrollReveal>

      {/* ── 最新文章 ── */}
      {recentPosts.length > 0 && (
        <ScrollReveal delay={0.1}>
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
        </ScrollReveal>
      )}

      {/* ── 分类 ── */}
      <ScrollReveal delay={0.15}>
        <section className="py-8">
          <h2 className="mb-6 text-2xl font-bold">分类</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {categories.map((cat) => {
              const count = allPosts.filter(
                (p) => p.frontmatter.category === cat.slug
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
      </ScrollReveal>

      {/* ── 日历 & 标签云 ── */}
      <ScrollReveal delay={0.2}>
        <section className="py-8">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Calendar */}
            <MiniCalendar postDates={postDates} />

            {/* Tags */}
            {tags.length > 0 && (
              <div>
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
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
