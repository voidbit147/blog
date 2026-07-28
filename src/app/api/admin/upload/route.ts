import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { verifySessionToken } from "@/lib/server/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public/images");
const PUBLIC_PREFIX = "/images";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
// 注意：不接纳 svg——SVG 可内嵌 <script>，经 /images/xxx.svg 同源加载即存储型 XSS。
const ALLOWED_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif"]);

export async function POST(request: Request) {
  // defense in depth：proxy 已保护，这里再校验一次 session。
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match || !verifySessionToken(match[1])) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少 file 字段" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "文件过大（上限 10MB）" },
      { status: 413 },
    );
  }

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: `不支持的图片格式: .${ext}` },
      { status: 415 },
    );
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  // 文件名：时间戳 + 随机后缀，避免覆盖与路径注入。
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const safeName = `${stamp}-${rand}.${ext}`;
  const full = path.join(UPLOAD_DIR, safeName);

  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(full, buf);

  return NextResponse.json({ url: `${PUBLIC_PREFIX}/${safeName}` });
}
