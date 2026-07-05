import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import { PixelAvatar } from "@/components/ui/PixelAvatar";

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
          <PixelAvatar size={80} />
          <div>
            <h2 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                V0idbit
              </span>
            </h2>
            <p className="text-text-secondary">网络安全 / AI For CyberSecurity</p>
          </div>
        </div>

        <p>
          我是V0idbit，一名热爱网络安全和AI技术的开发者。
          这个博客是我记录学习、分享思考和沉淀经验的地方。
        </p>

        <h3>主要内容</h3>
        <ul>
          <li>安全攻防技术</li>
          <li>智能体 Agent 研发</li>
          <li>大模型应用</li>
          <li>技术随笔与思辨</li>
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
