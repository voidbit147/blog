# 部署说明（Ubuntu 服务器）

本项目已从「Next.js 静态导出 + GitHub API」改为「**Next.js Node 服务器 + 本地文件 API + 密码保护**」。后台通过 `/api/admin/*` 直接读写服务器上的 `content/blog/*.mdx` 文件，前台每次请求动态渲染，新文章即时可见。

## 1. 环境准备

- Node.js ≥ 20（推荐 22 LTS）
- 服务器上 clone 本仓库

```bash
git clone <repo> /opt/blog
cd /opt/blog
npm ci   # 或 npm install
```

## 2. 生成密码与密钥

```bash
npx tsx scripts/gen-password-hash.ts "你的管理员密码"
```

输出两行：`ADMIN_PASSWORD_HASH=...` 和 `SESSION_SECRET=...`。

## 3. 配置 .env

在项目根目录创建 `.env`（**不要提交到仓库**，已在 `.gitignore`）：

```env
ADMIN_PASSWORD_HASH=scrypt:16384:8:1:xxxx:yyyy
SESSION_SECRET=随机字符串
NEXT_PUBLIC_SITE_URL=https://你的域名
```

> ⚠️ **重要**：哈希值用 `:` 分隔（格式 `scrypt:N:r:p:saltHex:hashHex`）。
> **不要**用 `$` 分隔——shell / dotenv 会把 `$N` 当变量展开，导致值损坏、登录永远失败。
> 直接复制脚本输出即可，脚本已用 `:` 格式。

## 4. 构建

```bash
npm run build
```

> 构建时 `prebuild` 会自动生成 `public/search-index.json`（搜索索引）。
> 注意：搜索索引在 **build 时**生成，运行时新增的文章不会进入搜索索引，直到下次 build。
> 文章列表/详情页是动态渲染的，新文章立即可见——只有「搜索」是降级体验。

## 5. 用 pm2 守护进程

```bash
npm i -g pm2
pm2 start "npm run start" --name blog
pm2 save
pm2 startup   # 按提示执行返回的命令，实现开机自启
```

默认监听 `http://localhost:3000`。

## 6. Nginx 反代（推荐）

```nginx
server {
    listen 80;
    server_name 你的域名;

    # 上传图片体积，按需调大
    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

配好后 `certbot --nginx` 申请 HTTPS 证书。`SESSION_COOKIE_OPTIONS.secure` 在 `NODE_ENV=production` 下自动启用，要求 HTTPS。

生产运行建议 `NODE_ENV=production`（pm2 启动时 `NODE_ENV=production pm2 start "npm run start" --name blog`）。

## 7. 文件权限

Next 进程需要对以下目录有**读写权限**：

- `content/blog/`（读写文章）
- `public/images/`（上传图片，首次会自动创建）

```bash
chown -R <运行用户>:<运行用户> content public
```

## 8. 更新代码

```bash
cd /opt/blog
git pull
npm ci
npm run build
pm2 restart blog
```

## 9. 安全要点

- 密码以 **scrypt 哈希**存环境变量，明文密码不落盘。
- session token 用 **HMAC 签名** + httpOnly cookie，7 天过期。
- `/admin/*` 与 `/api/admin/*`（除 login/logout）由 `src/proxy.ts` 强制鉴权，未登录返回 401 或重定向登录页。
- 上传图片做**扩展名白名单**（png/jpg/jpeg/gif/webp/svg/avif）+ **10MB 上限**。
- slug/category 做路径穿越校验，只能写到预定义分类目录下。

## 10. 已知限制

- 搜索索引仅 build 时生成，新文章需重新 build 才能被搜索到。
- Milkdown 编辑器为客户端组件，首次加载较重（按需动态导入，已禁用 SSR）。
- 单用户单密码，无多用户/RBAC。如需多用户需引入数据库与认证库。
