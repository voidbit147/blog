"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-red-500/50 hover:text-red-500 disabled:opacity-50"
    >
      {loading ? "退出中..." : "退出登录"}
    </button>
  );
}
