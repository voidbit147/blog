import { Metadata } from "next";
import { getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { notFound } from "next/navigation";

interface Params {
  tag: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `标签 #${tag} 下的文章`,
  };
}

export function generateStaticParams(): Params[] {
  const { getAllTags } = require("@/lib/posts");
  return getAllTags().map((t: { name: string }) => ({ tag: t.name }));
}

export default async function TagPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          <span className="text-primary">#</span> {tag}
        </h1>
        <p className="mt-1 text-sm text-text-secondary/60">
          共 {posts.length} 篇
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
