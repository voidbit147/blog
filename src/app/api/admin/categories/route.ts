import { NextResponse } from "next/server";
import {
  getCategoriesSync,
  addCategory,
  deleteCategory,
} from "@/lib/server/categories";

/** GET /api/admin/categories — 列出所有分类。 */
export async function GET() {
  return NextResponse.json({ categories: getCategoriesSync() });
}

/** POST /api/admin/categories — 新建分类。body: { slug, name, description? } */
export async function POST(request: Request) {
  let body: { slug?: string; name?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  try {
    const cat = addCategory({
      slug: body.slug || "",
      name: body.name || "",
      description: body.description,
    });
    return NextResponse.json({ ok: true, category: cat });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "新建分类失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/** DELETE /api/admin/categories?slug=xxx — 删除分类（仅当其下无文章时）。 */
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  }

  // 若该分类下还有文章，拒绝删除。
  const { listPostFiles } = await import("@/lib/server/files");
  const hasPosts = listPostFiles().some((p) => p.category === slug);
  if (hasPosts) {
    return NextResponse.json(
      { error: "该分类下仍有文章，请先移除或转移文章后再删除分类" },
      { status: 409 },
    );
  }

  try {
    deleteCategory(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "删除分类失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
