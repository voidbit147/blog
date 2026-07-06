"use client";

import { useEffect, useState, useCallback } from "react";

const REPO = "voidbit147/blog";

interface DeployStatus {
  status: "idle" | "pending" | "running" | "success" | "failure";
  message: string;
}

/**
 * GitHub Actions 部署状态组件
 * 轮询最新 workflow run 状态并显示
 */
export function GitHubStatus({ token }: { token: string }) {
  const [status, setStatus] = useState<DeployStatus>({
    status: "idle",
    message: "",
  });
  const [polling, setPolling] = useState(false);

  const checkDeployStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/actions/runs?per_page=1`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      const run = data.workflow_runs?.[0];
      if (!run) return;

      if (run.status === "completed") {
        if (run.conclusion === "success") {
          setStatus({ status: "success", message: "部署完成！文章已上线 ✓" });
          setPolling(false);
        } else {
          setStatus({ status: "failure", message: `部署失败：${run.conclusion}` });
          setPolling(false);
        }
      } else {
        setStatus({
          status: run.status as "pending" | "running",
          message: run.status === "queued" ? "部署排队中..." : "部署中...",
        });
      }
    } catch {
      // 静默失败
    }
  }, [token]);

  // 轮询
  useEffect(() => {
    if (!polling) return;
    const id = setInterval(checkDeployStatus, 8000);
    return () => clearInterval(id);
  }, [polling, checkDeployStatus]);

  // 开始轮询
  const startPolling = () => {
    setPolling(true);
    setStatus({ status: "pending", message: "部署触发中..." });
    checkDeployStatus();
  };

  // 暴露 startPolling 给父组件
  useEffect(() => {
    window.__githubStatusStartPolling = startPolling;
  }, [startPolling]);

  if (status.status === "idle") return null;

  const colorMap = {
    pending: "text-yellow-600 dark:text-yellow-400",
    running: "text-yellow-600 dark:text-yellow-400",
    success: "text-green-600 dark:text-green-400",
    failure: "text-red-600 dark:text-red-400",
    idle: "",
  };

  const iconMap = {
    idle: "",
    pending: "⏳",
    running: "🔄",
    success: "✅",
    failure: "❌",
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm ${
        status.status === "success"
          ? "bg-green-500/10"
          : status.status === "failure"
            ? "bg-red-500/10"
            : "bg-yellow-500/10"
      } ${colorMap[status.status]}`}
    >
      <span>{iconMap[status.status]}</span>
      <span>{status.message}</span>
      {polling && (
        <span className="animate-spin inline-block">⟳</span>
      )}
    </div>
  );
}

// 全局类型扩展，让父组件可以触发轮询
declare global {
  interface Window {
    __githubStatusStartPolling?: () => void;
  }
}
