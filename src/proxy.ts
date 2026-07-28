/**
 * @file 路由保护（Next.js 16 用 proxy.ts 替代已废弃的 middleware.ts）
 *
 * 保护 /admin 页面与 /api/admin/* 写操作端点。
 * login/logout 端点不在此 matcher 内，保持公开。
 *
 * Proxy 强制 Node.js runtime，可直接 import node:crypto（见 auth.ts）。
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/server/auth";

export const config = {
  matcher: [
    "/admin", // 管理首页
    "/admin/((?!login).*)", // /admin 下除 login 外的子页面
    "/api/admin/posts/:path*",
    "/api/admin/upload",
    "/api/admin/categories/:path*",
  ],
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;

  if (verifySessionToken(token)) {
    return NextResponse.next();
  }

  // API 请求返回 401 JSON；页面请求重定向到登录页。
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}
