"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchTrigger() {
  const router = useRouter();
  const [meta, setMeta] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    setMeta(
      typeof navigator !== "undefined" && navigator.platform.includes("Mac"),
    );
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <button
      onClick={() => router.push("/search")}
      className="hidden sm:flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="9" r="5" />
        <path d="M13 13l4 4" />
      </svg>
      <span>搜索</span>
      <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-xs text-text-secondary/60">
        {meta ? "⌘K" : "Ctrl+K"}
      </kbd>
    </button>
  );
}
