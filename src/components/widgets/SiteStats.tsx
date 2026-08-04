"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [text, setText] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setText(String(v)));
    return unsub;
  }, [value, spring, display]);

  return <span ref={ref}>{text}</span>;
}

function StatItem({ label, value, suffix, icon }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-4">
      <span className="text-primary">{icon}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl font-bold text-text">
          <AnimatedNumber value={value} />
        </span>
        {suffix && <span className="text-sm text-text-secondary">{suffix}</span>}
      </div>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
}

interface SiteStatsProps {
  postCount: number;
  categoryCount: number;
  tagCount: number;
}

/**
 * 计算运营时间，精确到小时
 * 格式: X年X月X天X小时
 */
function formatUptime(): { display: string } {
  // 站点创建时间: 2025-01-01 00:00:00 (UTC+8)
  const start = new Date("2025-01-01T00:00:00+08:00").getTime();
  const now = Date.now();
  const diffMs = now - start;

  if (diffMs < 0) return { display: "0小时" };

  const startDate = new Date(start);
  const nowDate = new Date(now);

  let years = nowDate.getFullYear() - startDate.getFullYear();
  let months = nowDate.getMonth() - startDate.getMonth();
  let days = nowDate.getDate() - startDate.getDate();
  let hours = nowDate.getHours() - startDate.getHours();

  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}年`);
  if (months > 0) parts.push(`${months}月`);
  if (days > 0) parts.push(`${days}天`);
  parts.push(`${hours}小时`);

  return { display: parts.join("") };
}

export function SiteStats({ postCount, categoryCount, tagCount }: SiteStatsProps) {
  // 使用 mounted 避免 hydration mismatch：SSR 时渲染占位符，客户端再计算真实值
  const [mounted, setMounted] = useState(false);
  const [uptime, setUptime] = useState({ display: "..." });

  useEffect(() => {
    setMounted(true);
    setUptime(formatUptime());
    const id = setInterval(() => setUptime(formatUptime()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatItem
        label="篇文章"
        value={postCount}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        }
      />
      <StatItem
        label="个分类"
        value={categoryCount}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        }
      />
      <StatItem
        label="个标签"
        value={tagCount}
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        }
      />
      {/* 运营时间 - 使用文本展示而非数字动画 */}
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-4">
        <span className="text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <span className="text-base font-bold leading-tight text-text">
          {mounted ? uptime.display : "..."}
        </span>
        <span className="text-xs text-text-secondary" suppressHydrationWarning>运营时长</span>
      </div>
    </div>
  );
}
