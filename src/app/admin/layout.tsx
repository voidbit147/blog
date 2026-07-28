import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 路由保护由 src/proxy.ts 负责：未登录访问 /admin/* 会重定向到 /admin/login。
  return children;
}
