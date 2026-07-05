/**
 * @file 站点全局常量
 */

export const SITE = {
  title: "V0idbit",
  description: "全栈开发者的技术博客 — Web 开发、系统架构、创意编程。记录思考，分享造物。",
  url: "https://doub1e-happy.github.io/blog",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  author: {
    name: "V0idbit",
    github: "https://github.com/Doub1e-Happy",
    email: "31293@users.noreply.github.com",
  },
  postsPerPage: 6,
} as const;

export const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/search", label: "搜索" },
  { href: "/about", label: "关于" },
] as const;

export const CATEGORIES = [
  { slug: "tech", name: "技术", description: "编程、架构与工具的深度探索。" },
  { slug: "tutorials", name: "教程", description: "手把手的实战指南与踩坑记录。" },
  { slug: "life", name: "生活", description: "随笔、感悟，以及代码之外的思考。" },
] as const;

export const GISCUS = {
  repo: "Doub1e-Happy/blog",
  repoId: "R_kgDOO-----------",
  category: "Announcements",
  categoryId: "DIC_kwDOO-----------",
  mapping: "pathname" as const,
  reactionsEnabled: "1" as const,
  theme: "preferred_color_scheme" as const,
};
