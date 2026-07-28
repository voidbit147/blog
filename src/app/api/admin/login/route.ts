import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/server/auth";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "请输入密码" }, { status: 400 });
  }

  let ok = false;
  try {
    ok = verifyPassword(password);
  } catch (err) {
    console.error("login verify error:", err);
    return NextResponse.json(
      { error: "服务器认证未配置（ADMIN_PASSWORD_HASH 缺失）" },
      { status: 500 },
    );
  }

  if (!ok) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const token = createSessionToken();
  const c = await cookies();
  c.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
