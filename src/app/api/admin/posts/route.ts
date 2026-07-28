import { NextResponse } from "next/server";
import { listPostFiles } from "@/lib/server/files";

export async function GET() {
  try {
    const posts = listPostFiles();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("list posts error:", err);
    return NextResponse.json({ error: "读取文章列表失败" }, { status: 500 });
  }
}
