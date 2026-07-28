import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">管理后台</h1>
        <LogoutButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/editor"
          className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="mb-2 text-2xl">✍️</div>
          <h3 className="mb-1 font-semibold">新建文章</h3>
          <p className="text-sm text-text-secondary">
            编写并发布一篇新博客文章
          </p>
        </Link>
        <Link
          href="/admin/posts"
          className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="mb-2 text-2xl">📋</div>
          <h3 className="mb-1 font-semibold">管理文章</h3>
          <p className="text-sm text-text-secondary">
            查看、编辑或删除已有文章
          </p>
        </Link>
      </div>
    </div>
  );
}
