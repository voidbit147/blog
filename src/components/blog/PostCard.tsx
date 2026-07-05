import Link from "next/link";
import type { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const { slug, frontmatter, readingTime } = post;
  const date = new Date(frontmatter.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Category badge */}
      <span className="mb-3 inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
        {frontmatter.category}
      </span>

      <h3 className="mb-2 text-lg font-semibold leading-snug text-text transition-colors group-hover:text-primary">
        {frontmatter.title}
      </h3>

      <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
        {frontmatter.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-text-secondary/70">
        <time dateTime={frontmatter.date}>{date}</time>
        <span>&middot;</span>
        <span>{readingTime} min read</span>
        {frontmatter.tags.length > 0 && (
          <>
            <span>&middot;</span>
            <span className="truncate">{frontmatter.tags.slice(0, 2).join(", ")}</span>
          </>
        )}
      </div>
    </Link>
  );
}
