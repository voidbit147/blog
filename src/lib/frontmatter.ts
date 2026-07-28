/**
 * @file Frontmatter 解析与序列化（前后台共用）
 *
 * 用 gray-matter 统一处理，替代旧 github.ts 里手写正则的 parseFrontmatter，
 * 保证编辑器读取、文章列表、API 内部三者行为一致。
 *
 * 序列化交给 gray-matter（底层 js-yaml），正确处理引号、反斜杠、特殊字符，
 * 避免手拼字符串导致的 YAML 注入。
 *
 * 序列化约定：编辑已有文章时保留原 date；新建文章时由调用方传入今天的日期。
 */

import matter from "gray-matter";
import type { Frontmatter } from "@/types";

export interface ParsedPost {
  frontmatter: Frontmatter;
  body: string;
}

/** 解析 frontmatter，缺失字段给默认值，与 posts.ts 的 parsePost 对齐。 */
export function parseFrontmatter(raw: string): ParsedPost {
  const { data, content } = matter(raw);
  return {
    frontmatter: {
      title: (data.title as string) || "Untitled",
      description: (data.description as string) || "",
      date: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      updated: data.updated ? new Date(data.updated).toISOString() : undefined,
      category: (data.category as string) || "uncategorized",
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      draft: data.draft === true,
      image: (data.image as string) || undefined,
      author: (data.author as string) || undefined,
    },
    body: content,
  };
}

export interface SerializeOptions {
  /** 是否保留原 date。编辑时传 true，新建时传 false（会用 today）。 */
  preserveDate: boolean;
  /** 已有日期（编辑场景下从原文解析得到）。 */
  originalDate?: string;
}

/**
 * 将 frontmatter + body 序列化为 mdx 文件字符串。
 * date：编辑保留原值，新建用今天；以 YYYY-MM-DD 写入。
 * 其余字段由 gray-matter 负责转义。
 */
export function serializePost(
  fm: Partial<Frontmatter> & { title: string },
  body: string,
  options: SerializeOptions,
): string {
  const today = new Date().toISOString().split("T")[0];
  const date = options.preserveDate
    ? (options.originalDate?.split("T")[0] ?? today)
    : today;

  const data: Record<string, unknown> = {
    title: fm.title,
    description: fm.description ?? "",
    date,
    category: fm.category || "tech",
    tags: (fm.tags ?? []).filter(Boolean),
  };

  // gray-matter.stringify 会在 body 前拼接正确转义的 YAML frontmatter。
  return matter.stringify(body, data);
}
