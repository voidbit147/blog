"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/**
 * 极简主题系统（替代 next-themes，消除 React 19 下 "script tag in component" 警告）。
 *
 * - 主题存 localStorage('theme')，值为 'light' | 'dark' | 'system'
 * - 通过 <html class="dark"> 切换暗色（与 globals.css 的 .dark 选择器一致）
 * - 防闪烁脚本在 layout.tsx 的 <head> 用 dangerouslySetInnerHTML 注入为原始 HTML，
 *   不在组件树里创建 React <script> 元素，避免 React 19 警告。
 */

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  systemTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  systemTheme: "light",
  setTheme: () => {},
});

export const THEME_STORAGE_KEY = "theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = resolved;
}

/** 防闪烁脚本字符串，供 layout 在 <head> 注入。 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var r=document.documentElement;if(d==='dark'){r.classList.add('dark');r.style.colorScheme='dark';}else{r.classList.remove('dark');r.style.colorScheme='light';}}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // 初始读取 localStorage（客户端首次挂载）。
  // setState 是 SSR→client 必需的初始化，属于该规则的合理例外。
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored =
      (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) || "system";
    setThemeState(stored);
    setSystemTheme(getSystemTheme());
    setMounted(true);
    applyTheme(stored);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 监听系统主题变化
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setSystemTheme(getSystemTheme());
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // ignore
    }
    applyTheme(t);
  }, []);

  // mounted 后主题变化时重新应用
  useEffect(() => {
    if (mounted) applyTheme(theme);
  }, [theme, mounted]);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? systemTheme : theme;

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
