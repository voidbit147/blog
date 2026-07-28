import { Metadata } from "next";
import { getPostsByCategory } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { getCategoriesSync } from "@/lib/server/categories";

// 后台可随时新增文章，分类页每次请求读取文件系统。
export const dynamic = "force-dynamic";

interface Params {
  category: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const catInfo = getCategoriesSync().find((c) => c.slug === category);
  return {
    title: catInfo?.name || category,
    description: catInfo?.description || `${category} 分类下的文章`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  const catInfo = getCategoriesSync().find((c) => c.slug === category);

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {catInfo?.name || category}
          </h1>
          {catInfo?.description && (
            <p className="mt-2 text-text-secondary">{catInfo.description}</p>
          )}
          <p className="mt-1 text-sm text-text-secondary/60">暂无文章</p>
        </div>
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-text-secondary">
            这个分类下还没有文章，敬请期待。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {catInfo?.name || category}
        </h1>
        {catInfo?.description && (
          <p className="mt-2 text-text-secondary">{catInfo.description}</p>
        )}
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
