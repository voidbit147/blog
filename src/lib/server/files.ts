/**
 * @file 本地文章文件读写（后端 API 用）
 *
 * 直接操作文件系统，替代旧 github.ts 通过 GitHub Contents API 的方式。
 * 与 src/lib/posts.ts 共用 content/blog 目录与 slug 规则。
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getCategoriesSync } from "@/lib/server/categories";

const CONTENT_ROOT = path.join(process.cwd(), "content/blog");

export interface AdminPostInfo {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  /** 相对 content/blog 的文件路径，如 life/hello-world.mdx */
  relPath: string;
  /** 文件最后修改时间戳，用作乐观锁 */
  mtime: number;
}

/** 校验 slug 合法（只允许字母数字/连字符，防路径穿越与子目录写入）。 */
function assertSafeSlug(slug: string): void {
  if (!slug || /[\\/]/.test(slug) || slug.includes("..")) {
    throw new Error("非法 slug");
  }
  if (!/^[a-z0-9-]+$/i.test(slug)) {
    throw new Error("slug 仅允许字母、数字与连字符");
  }
}

/** 校验分类名（必须是已注册分类，防任意目录写入）。 */
function assertSafeCategory(category: string): void {
  if (!getCategoriesSync().some((c) => c.slug === category)) {
    throw new Error(`未知分类: ${category}`);
  }
}

/** 列出所有文章（仅 frontmatter 摘要）。 */
export function listPostFiles(): AdminPostInfo[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  const results: AdminPostInfo[] = [];
  for (const cat of getCategoriesSync()) {
    const catDir = path.join(CONTENT_ROOT, cat.slug);
    if (!fs.existsSync(catDir)) continue;
    for (const name of fs.readdirSync(catDir)) {
      if (!name.endsWith(".mdx")) continue;
      const full = path.join(catDir, name);
      const raw = fs.readFileSync(full, "utf-8");
      const { data } = matter(raw);
      const slug = name.replace(/\.mdx$/, "");
      const stat = fs.statSync(full);
      results.push({
        slug,
        title: (data.title as string) || slug,
        description: (data.description as string) || "",
        date: data.date ? new Date(data.date).toISOString() : "",
        category: (data.category as string) || cat.slug,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
        relPath: `${cat.slug}/${slug}.mdx`,
        mtime: stat.mtimeMs,
      });
    }
  }
  return results.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return (tb || 0) - (ta || 0);
  });
}

/** 读取单篇文章原文。category 可选，缺省时在所有分类下查找。 */
export function readPostFile(
  slug: string,
  category?: string,
): { raw: string; category: string; mtime: number } | null {
  assertSafeSlug(slug);
  const cats = category ? [category] : getCategoriesSync().map((c) => c.slug);
  for (const c of cats) {
    assertSafeCategory(c);
    const full = path.join(CONTENT_ROOT, c, `${slug}.mdx`);
    if (fs.existsSync(full)) {
      const raw = fs.readFileSync(full, "utf-8");
      const mtime = fs.statSync(full).mtimeMs;
      return { raw, category: c, mtime };
    }
  }
  return null;
}

/** 写入文章（覆盖或新建）。返回最终 category。 */
export function writePostFile(
  slug: string,
  category: string,
  raw: string,
): string {
  assertSafeSlug(slug);
  assertSafeCategory(category);
  const dir = path.join(CONTENT_ROOT, category);
  fs.mkdirSync(dir, { recursive: true });
  const full = path.join(dir, `${slug}.mdx`);
  fs.writeFileSync(full, raw, "utf-8");
  return category;
}

/** 删除文章。 */
export function deletePostFile(slug: string, category: string): boolean {
  assertSafeSlug(slug);
  assertSafeCategory(category);
  const full = path.join(CONTENT_ROOT, category, `${slug}.mdx`);
  if (!fs.existsSync(full)) return false;
  fs.unlinkSync(full);
  return true;
}
