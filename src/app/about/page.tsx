import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "关于",
  description: `关于 ${SITE.author.name}`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">关于</h1>

      <div className="prose max-w-none">
        <div className="mb-10 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white shadow-lg shadow-primary/25">
            V
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                V0idbit
              </span>
            </h2>
            <p className="text-text-secondary">全栈开发者 / 造物爱好者</p>
          </div>
        </div>

        <p>
          你好，我是 V0idbit。我热爱构建——从 Web 应用到开发工具，从系统架构到创意编程。
          这个博客是我记录学习、分享思考和沉淀经验的地方。
        </p>

        <h3>我写些什么</h3>
        <ul>
          <li>React、Next.js、TypeScript 等 Web 开发技术</li>
          <li>开发工具与效率提升</li>
          <li>软件架构与设计模式</li>
          <li>实战教程与踩坑记录</li>
        </ul>

        <h3>本站技术栈</h3>
        <ul>
          <li>
            <strong>框架：</strong>Next.js 16（App Router + 静态导出）
          </li>
          <li>
            <strong>样式：</strong>Tailwind CSS v4 + 自定义主题 Tokens
          </li>
          <li>
            <strong>内容：</strong>MDX + 自定义组件
          </li>
          <li>
            <strong>搜索：</strong>Fuse.js（客户端模糊搜索）
          </li>
          <li>
            <strong>评论：</strong>Giscus（基于 GitHub Discussions）
          </li>
          <li>
            <strong>字体：</strong>Geist Sans + Geist Mono
          </li>
          <li>
            <strong>托管：</strong>GitHub Pages（免费）
          </li>
        </ul>

        <h3>联系方式</h3>
        <p>
          欢迎在{" "}
          <a
            href={SITE.author.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>{" "}
          上找到我，或通过{" "}
          <a href={`mailto:${SITE.author.email}`}>邮件</a>{" "}
          与我联系。
        </p>
      </div>
    </div>
  );
}
