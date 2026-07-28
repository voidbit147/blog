import { NextResponse } from "next/server";
import {
  readPostFile,
  writePostFile,
  deletePostFile,
} from "@/lib/server/files";

interface Params {
  params: Promise<{ slug: string }>;
}

/** GET /api/admin/posts/[slug]?category=xxx — 读取单篇原文。 */
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;

  let result: { raw: string; category: string; mtime: number } | null;
  try {
    result = readPostFile(slug, category);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "非法请求";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (!result) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }
  return NextResponse.json({
    raw: result.raw,
    category: result.category,
    mtime: result.mtime,
  });
}

/** PUT /api/admin/posts/[slug] — 写入/覆盖。body: { category, raw, expectedMtime? } */
export async function PUT(request: Request, { params }: Params) {
  const { slug } = await params;
  let body: { category?: string; raw?: string; expectedMtime?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const { category, raw, expectedMtime } = body;
  if (!category || typeof raw !== "string") {
    return NextResponse.json(
      { error: "缺少 category 或 raw" },
      { status: 400 },
    );
  }

  // 先在所有分类下查找该 slug 的现有文件（用于乐观锁校验与跨分类移动）。
  let existing: { category: string; mtime: number; raw: string } | null;
  try {
    existing = readPostFile(slug);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "非法请求";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (
    expectedMtime !== undefined &&
    existing &&
    Math.abs(existing.mtime - expectedMtime) > 1000
  ) {
    return NextResponse.json(
      { error: "文件已被修改，请刷新后重试", conflict: true },
      { status: 409 },
    );
  }

  try {
    // 若文章原属其他分类，删除旧位置文件，避免一篇文章出现在两个分类。
    if (existing && existing.category !== category) {
      deletePostFile(slug, existing.category);
    }
    writePostFile(slug, category, raw);
    const after = readPostFile(slug, category);
    return NextResponse.json({
      ok: true,
      category,
      mtime: after?.mtime ?? Date.now(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "写入失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/** DELETE /api/admin/posts/[slug]?category=xxx */
export async function DELETE(request: Request, { params }: Params) {
  const { slug } = await params;
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  if (!category) {
    return NextResponse.json({ error: "缺少 category" }, { status: 400 });
  }

  try {
    const ok = deletePostFile(slug, category);
    if (!ok) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "删除失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
