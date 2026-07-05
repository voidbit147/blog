import { cn } from "@/lib/utils";

interface TagListProps {
  tags: string[];
  className?: string;
}

export function TagList({ tags, className }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <a
          key={tag}
          href={`/blog/tag/${tag}`}
          className="rounded-full bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
        >
          #{tag}
        </a>
      ))}
    </div>
  );
}
