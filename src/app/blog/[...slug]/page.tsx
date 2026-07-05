import { Metadata } from "next";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PostContent } from "@/components/blog/PostContent";
import { TableOfContents } from "@/components/mdx/TableOfContents";
import { GiscusComments } from "@/components/comments/GiscusComments";
import { TagList } from "@/components/blog/TagList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const post = getPostBySlug(slugStr);

  if (!post) {
    return { title: "未找到" };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export function generateStaticParams(): { slug: string[] }[] {
  return getAllPosts().map((post) => ({
    slug: post.slug.split("/"),
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const post = getPostBySlug(slugStr);

  if (!post) {
    notFound();
  }

  const date = new Date(post.frontmatter.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        {/* 正文 */}
        <article className="min-w-0">
          {/* 面包屑 */}
          <div className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
            <Link
              href="/blog"
              className="transition-colors hover:text-primary"
            >
              博客
            </Link>
            <span>/</span>
            <Link
              href={`/blog/category/${post.frontmatter.category}`}
              className="capitalize transition-colors hover:text-primary"
            >
              {post.frontmatter.category}
            </Link>
            <span>/</span>
            <span className="truncate text-text">{post.frontmatter.title}</span>
          </div>

          {/* 文章头部 */}
          <header className="mb-10">
            <span className="mb-4 inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {post.frontmatter.category}
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">
              {post.frontmatter.title}
            </h1>
            <p className="mb-4 text-lg text-text-secondary">
              {post.frontmatter.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary/70">
              <time dateTime={post.frontmatter.date}>
                {date}
              </time>
              <span>&middot;</span>
              <span>阅读 {post.readingTime} 分钟</span>
              <span>&middot;</span>
              <span>{post.wordCount.toLocaleString()} 字</span>
            </div>
            <TagList tags={post.frontmatter.tags} className="mt-4" />
          </header>

          {/* 文章内容 */}
          <PostContent post={post} />

          {/* 评论区 */}
          <div className="mt-16 border-t border-border pt-10">
            <GiscusComments />
          </div>
        </article>

        {/* 侧边目录 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents content={post.content} />
          </div>
        </aside>
      </div>
    </div>
  );
}
