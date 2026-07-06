"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getToken, setToken } from "@/lib/github";

export default function AdminPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [tokenSet, setTokenSet] = useState(false);
  const [tokenSaved, setTokenSaved] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (t) {
      setTokenInput(t);
      setTokenSet(true);
    }
  }, []);

  const handleSaveToken = () => {
    const trimmed = tokenInput.trim();
    setToken(trimmed);
    setTokenSet(!!trimmed);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 3000);
    window.__githubStatusStartPolling?.();
  };

  const handleSavePassword = () => {
    if (newPassword.trim()) {
      localStorage.setItem("admin_password", newPassword.trim());
      setPasswordSaved(true);
      setNewPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">管理后台</h1>

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
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

      {/* GitHub Token */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">🔑 GitHub Token</h3>
            <p className="mt-1 text-sm text-text-secondary">
              用于通过 GitHub API 管理文章内容，需要 repo 权限
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              tokenSet
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {tokenSet ? "已设置" : "未设置"}
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="flex-1 rounded-lg border border-border bg-bg-secondary px-3 py-2 font-mono text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSaveToken}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            保存
          </button>
        </div>

        {tokenSaved && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ Token 已保存
          </p>
        )}
      </div>

      {/* Password change */}
      <div className="mt-4 rounded-xl border border-border bg-surface p-6">
        <div className="mb-4">
          <h3 className="font-semibold">🔐 管理密码</h3>
          <p className="mt-1 text-sm text-text-secondary">
            修改管理员登录密码
          </p>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            修改密码
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="输入新密码"
              className="flex-1 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text placeholder:text-text-secondary/30 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSavePassword}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
            >
              保存
            </button>
            <button
              onClick={() => {
                setShowPasswordForm(false);
                setNewPassword("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text"
            >
              取消
            </button>
          </div>
        )}

        {passwordSaved && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            ✓ 密码已更新，下次登录生效
          </p>
        )}
      </div>
    </div>
  );
}
