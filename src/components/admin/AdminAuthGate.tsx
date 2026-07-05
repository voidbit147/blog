"use client";

import { useState } from "react";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_password") || "admin123"
        : "admin123";

    if (password === adminPassword) {
      setAuthenticated(true);
      localStorage.setItem("admin_authed", "true");
    } else {
      setError(true);
    }
  };

  if (!authenticated) {
    const alreadyAuth =
      typeof window !== "undefined" &&
      localStorage.getItem("admin_authed") === "true";
    if (alreadyAuth) {
      return <>{children}</>;
    }
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex max-w-sm items-center justify-center px-4 py-32">
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
            🔐
          </div>
          <h2 className="text-xl font-bold">管理员登录</h2>
          <p className="mt-1 text-sm text-text-secondary">
            请输入管理员密码以继续
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="密码"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text placeholder:text-text-secondary/40 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500">密码错误</p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
