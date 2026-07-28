/**
 * @file 分类管理（持久化到 content/categories.json）
 *
 * 取代旧 constants.ts 里硬编码的 CATEGORIES。
 * 前台（posts.ts、页面）用 getCategoriesSync() 同步读取；
 * 后台 API 用 addCategory() 新增。
 *
 * 文件不存在时回退到 DEFAULT_CATEGORIES，保证首次运行可用。
 */

import fs from "node:fs";
import path from "node:path";

export interface Category {
  slug: string;
  name: string;
  description: string;
}

const CATEGORIES_FILE = path.join(process.cwd(), "content/categories.json");

/** 默认分类（categories.json 缺失时回退用）。 */
export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "tech", name: "技术", description: "编程、架构与工具的深度探索。" },
  { slug: "tutorials", name: "教程", description: "手把手的实战指南与踩坑记录。" },
  { slug: "life", name: "生活", description: "随笔、感悟，以及代码之外的思考。" },
  { slug: "algorithm", name: "算法", description: "数据结构、算法题解与思路总结。" },
  { slug: "interview", name: "面经", description: "面试题目、流程与复盘经验。" },
];

/** 同步读取所有分类（前台 SSR / posts.ts 用）。 */
export function getCategoriesSync(): Category[] {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) return DEFAULT_CATEGORIES;
    const raw = fs.readFileSync(CATEGORIES_FILE, "utf-8");
    const data = JSON.parse(raw) as Category[];
    if (!Array.isArray(data) || data.length === 0) return DEFAULT_CATEGORIES;
    return data;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

/** 校验 slug 合法：小写字母/数字/连字符，非空。 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * 新增分类。slug 由 name 生成（中文转拼音不支持，故用 slug 输入框）。
 * 调用方应传 slug 与 name。重复 slug 抛错。
 */
export function addCategory(input: {
  slug: string;
  name: string;
  description?: string;
}): Category {
  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  if (!isValidSlug(slug)) {
    throw new Error("slug 只能含小写字母、数字与连字符，且以字母开头");
  }
  if (!name) {
    throw new Error("分类名称不能为空");
  }

  const existing = getCategoriesSync();
  if (existing.some((c) => c.slug === slug)) {
    throw new Error(`分类 slug 已存在: ${slug}`);
  }

  const cat: Category = {
    slug,
    name,
    description: input.description?.trim() || "",
  };
  const next = [...existing, cat];
  fs.mkdirSync(path.dirname(CATEGORIES_FILE), { recursive: true });
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(next, null, 2) + "\n", "utf-8");
  return cat;
}

/** 删除分类（仅当该分类下无文章时允许）。 */
export function deleteCategory(slug: string): void {
  const existing = getCategoriesSync();
  const next = existing.filter((c) => c.slug !== slug);
  if (next.length === existing.length) {
    throw new Error(`分类不存在: ${slug}`);
  }
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(next, null, 2) + "\n", "utf-8");
}
