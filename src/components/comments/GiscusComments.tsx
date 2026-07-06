"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Giscus = dynamic(() => import("@giscus/react"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-border bg-bg-secondary p-8 text-center text-sm text-text-secondary">
      Loading comments...
    </div>
  ),
});

export function GiscusComments() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-border bg-bg-secondary p-8 text-center text-sm text-text-secondary">
        Loading comments...
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <Giscus
      repo="voidbit147/blog"
      repoId="R_kgDOO-----------"
      category="Announcements"
      categoryId="DIC_kwDOO-----------"
      mapping="pathname"
      reactionsEnabled="1"
      theme={isDark ? "dark" : "light"}
    />
  );
}
