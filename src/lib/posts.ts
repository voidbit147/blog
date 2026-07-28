/**
 * @file Post loading and querying utilities.
 * Uses fs + gray-matter to read .mdx files from content/blog/.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post, CategoryInfo, TagInfo } from "@/types";
import { getCategoriesSync } from "@/lib/server/categories";

const CONTENT_ROOT = path.join(process.cwd(), "content/blog");

/**
 * Recursively find all .mdx files under a directory.
 */
function findMdxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return findMdxFiles(full);
    if (entry.name.endsWith(".mdx")) return [full];
    return [];
  });
}

/**
 * Derive a URL-safe slug from a file path, preserving folder hierarchy.
 * e.g. content/blog/tech/my-post.mdx -> "tech/my-post"
 */
function slugFromPath(filePath: string): string {
  const rel = path.relative(CONTENT_ROOT, filePath);
  return rel.replace(/\.mdx?$/, "").replace(/\\/g, "/");
}

/**
 * Rough reading time in minutes (average 200 words/min).
 */
function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Parse a single post file.
 */
function parsePost(filePath: string): Post {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const wordCount = content.trim().split(/\s+/).length;

  return {
    slug: slugFromPath(filePath),
    frontmatter: {
      title: data.title || "Untitled",
      description: data.description || "",
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      updated: data.updated ? new Date(data.updated).toISOString() : undefined,
      category: data.category || "uncategorized",
      tags: data.tags || [],
      draft: data.draft === true,
      image: data.image || undefined,
      author: data.author || undefined,
    },
    content,
    raw,
    readingTime: readingTime(content),
    wordCount,
  };
}

/**
 * Get all published posts, sorted by date descending.
 */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  const files = findMdxFiles(CONTENT_ROOT);
  return files
    .map(parsePost)
    .filter((p) => !p.frontmatter.draft)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

/**
 * Get a single post by slug (with optional draft inclusion for admin).
 */
export function getPostBySlug(
  slug: string,
  includeDrafts = false,
): Post | null {
  // 防 path traversal：slug 不允许含 .. 或绝对路径段，否则可跳出 content 目录。
  if (!slug || slug.includes("..") || slug.startsWith("/")) return null;
  const filePath = path.join(CONTENT_ROOT, `${slug}.mdx`);
  // 解析后必须仍在 CONTENT_ROOT 内，防御 join 后的穿越（如符号链接）。
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(CONTENT_ROOT + path.sep) && resolved !== CONTENT_ROOT) {
    return null;
  }
  if (!fs.existsSync(filePath)) return null;
  const post = parsePost(filePath);
  if (post.frontmatter.draft && !includeDrafts) return null;
  return post;
}

/**
 * Get all posts for a given category.
 */
export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter(
    (p) => p.frontmatter.category.toLowerCase() === category.toLowerCase(),
  );
}

/**
 * Get all posts for a given tag.
 */
export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) =>
    p.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

/**
 * Get all categories with post counts.
 * 持久化分类（见 content/categories.json）始终列出，即使尚无文章使用，
 * 以便前端导航与空状态页正常工作。文章中出现的未知分类也会被收录。
 */
export function getAllCategories(): CategoryInfo[] {
  const posts = getAllPosts();
  const map = new Map<string, { slug: string; name: string; count: number }>();
  // 先放入持久化分类，保留中文名，计数为 0。
  for (const c of getCategoriesSync()) {
    map.set(c.slug.toLowerCase(), { slug: c.slug, name: c.name, count: 0 });
  }
  for (const p of posts) {
    const raw = p.frontmatter.category;
    const key = raw.toLowerCase();
    const prev = map.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      // 文章用了未预定义的分类：slug 与显示名都用原始值。
      map.set(key, { slug: raw, name: raw, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/**
 * Get all unique tags with post counts.
 */
export function getAllTags(): TagInfo[] {
  const posts = getAllPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const tag of p.frontmatter.tags) {
      const key = tag.toLowerCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get all slugs for static param generation.
 */
export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/**
 * Get recent posts.
 */
export function getRecentPosts(count = 5): Post[] {
  return getAllPosts().slice(0, count);
}
