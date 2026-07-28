/**
 * @file 站点全局常量
 */

export const SITE = {
  title: "voidbit",
  description: "Agent与安全 — 渗透测试、Web安全、流量分析、Agent for Sec、记录思考。",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  basePath: "",
  author: {
    name: "voidbit",
    github: "https://github.com/voidbit147",
    email: "voidbit147@users.noreply.github.com",
  },
  postsPerPage: 6,
} as const;

export const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/search", label: "搜索" },
  { href: "/about", label: "关于" },
] as const;

// 分类已迁移到 content/categories.json，由 src/lib/server/categories.ts 管理。
// 原硬编码 CATEGORIES 已删除。

export const GISCUS = {
  repo: "voidbit147/blog",
  repoId: "R_kgDOO-----------",
  category: "Announcements",
  categoryId: "DIC_kwDOO-----------",
  mapping: "pathname" as const,
  reactionsEnabled: "1" as const,
  theme: "preferred_color_scheme" as const,
};
