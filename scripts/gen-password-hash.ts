/**
 * 生成管理员密码的 scrypt 哈希，写入环境变量 ADMIN_PASSWORD_HASH。
 *
 * 用法:
 *   npx tsx scripts/gen-password-hash.ts
 *   npx tsx scripts/gen-password-hash.ts "你的密码"
 *
 * 也附带生成一个推荐的 SESSION_SECRET 随机串。
 */

import { hashPassword } from "../src/lib/server/auth";
import { randomBytes } from "node:crypto";

async function main() {
  const argPassword = process.argv[2];
  const password =
    argPassword ||
    (await readFromTty("请输入管理员密码: "));

  if (!password) {
    console.error("密码不能为空。");
    process.exit(1);
  }

  const hash = hashPassword(password);
  const secret = randomBytes(32).toString("base64url");

  console.log("\n将以下内容写入服务器 .env 文件（不要提交到仓库）：\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`SESSION_SECRET=${secret}`);
}

// 简单的 stdin 读取（无第三方依赖）。若传了参数则跳过。
function readFromTty(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.resume();
    process.stdin.setEncoding("utf-8");
    process.stdin.once("data", (data) => {
      const line = String(data).trim();
      process.stdin.pause();
      resolve(line);
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
