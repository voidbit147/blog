/**
 * @file 服务端认证工具
 * - 密码用 scrypt 哈希存环境变量 ADMIN_PASSWORD_HASH
 * - 登录成功后签发 HMAC 签名的 session token，存 httpOnly cookie
 * - 零第三方依赖，纯 node:crypto
 *
 * 哈希格式: scrypt:N:r:p:saltHex:hashHex
 * （用 ':' 分隔而非 '$'，避免 shell / dotenv 把 '$N' 当变量展开）
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET 未设置。请生成一个随机字符串并写入环境变量。",
    );
  }
  return secret;
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf.toString("base64url");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, "base64url");
}

/**
 * 验证明文密码是否匹配环境变量中的 scrypt 哈希。
 */
export function verifyPassword(plain: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) {
    throw new Error("ADMIN_PASSWORD_HASH 未设置。请用 gen-password-hash 脚本生成。");
  }
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4], "hex");
  const expected = Buffer.from(parts[5], "hex");
  if (!N || !r || !p || !salt.length || !expected.length) return false;

  const keyLen = expected.length;
  const actual = scryptSync(plain, salt, keyLen, { N, r, p });

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/**
 * 签发 HMAC 签名的 session token: base64url(payload).base64url(sig)
 * payload 仅含过期时间戳（签名防伪造；不需要加密内容）。
 */
export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = b64url(JSON.stringify({ exp }));
  const sig = b64url(createHmac("sha256", getSessionSecret()).update(payload).digest());
  return `${payload}.${sig}`;
}

/**
 * 验证 session token 的签名与过期时间。恒定时间比较签名。
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1 || dot === token.length - 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expectedSig = b64url(
    createHmac("sha256", getSessionSecret()).update(payload).digest(),
  );
  const sigBuf = fromB64url(sig);
  const expBuf = fromB64url(expectedSig);
  if (sigBuf.length !== expBuf.length || sigBuf.length === 0) return false;
  if (!timingSafeEqual(sigBuf, expBuf)) return false;

  try {
    const { exp } = JSON.parse(fromB64url(payload).toString("utf-8")) as {
      exp: number;
    };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
};

/** 生成 scrypt 哈希字符串（供 gen-password-hash 脚本调用）。 */
export function hashPassword(plain: string): string {
  const N = 16384;
  const r = 8;
  const p = 1;
  const keyLen = 32;
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, keyLen, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${salt.toString("hex")}:${hash.toString("hex")}`;
}
