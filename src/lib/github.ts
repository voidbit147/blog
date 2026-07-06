/**
 * @file GitHub API utilities for admin content management.
 * Shared between editor and posts management pages.
 */

export const REPO = "voidbit147/blog";

/** Get GitHub Token from localStorage */
export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("github_token") || "";
}

/** Save GitHub Token to localStorage */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("github_token", token);
}

/** Parse frontmatter from raw MDX content */
export function parseFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const fm: Record<string, unknown> = {};
  const lines = match[1].split("\n");
  let currentKey = "";
  let currentArray: string[] = [];

  for (const line of lines) {
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      // save previous array
      if (currentKey && currentArray.length > 0) {
        fm[currentKey] = currentArray;
        currentArray = [];
      }
      const [, key, value] = kvMatch;
      if (value === "") {
        currentKey = key;
        currentArray = [];
      } else {
        fm[key] = value.replace(/^"|"$/g, "");
        currentKey = "";
      }
    } else if (line.match(/^\s+-\s+(.*)$/) && currentKey) {
      const val = line.match(/^\s+-\s+(.*)$/)?.[1] || "";
      currentArray.push(val);
    }
  }
  if (currentKey && currentArray.length > 0) {
    fm[currentKey] = currentArray;
  }

  return { frontmatter: fm, body: match[2] };
}

/** Fetch a file from GitHub Contents API */
export async function fetchFileFromGitHub(
  path: string,
  token: string
): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      { headers: { Authorization: `token ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const decoded = decodeURIComponent(escape(atob(data.content)));
    return { content: decoded, sha: data.sha };
  } catch {
    return null;
  }
}

/** List directory contents from GitHub */
export async function listGitHubDir(
  path: string,
  token: string
): Promise<{ name: string; path: string; type: string; sha: string }[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      { headers: { Authorization: `token ${token}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/** Delete a file from GitHub */
export async function deleteFileFromGitHub(
  path: string,
  sha: string,
  token: string,
  message: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${path}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, sha }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Trigger GitHub Actions deploy workflow */
export async function triggerDeploy(token: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/deploy.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
