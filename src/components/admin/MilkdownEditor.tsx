"use client";

import {
  Milkdown,
  MilkdownProvider,
  useEditor,
  useInstance,
} from "@milkdown/react";
import { Crepe, CrepeFeature } from "@milkdown/crepe";
// common/style.css 聚合了 toolbar / top-bar / link-tooltip 等所有组件布局样式；
// frame.css 提供亮色主题变量。暗色变量不在此无条件引入——它在 globals.css 的
// .dark 作用域下按站点主题叠加，避免编辑器永远是暗色。
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { useRef, useEffect, useCallback } from "react";

/**
 * 上传图片回调：调本地 /api/admin/upload，返回 /images/... URL。
 */
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "图片上传失败");
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}

interface InnerProps {
  initialMarkdown: string;
  crepeRef: React.MutableRefObject<Crepe | null>;
  editorRef: React.MutableRefObject<MilkdownEditorHandle | null>;
  onChange: (markdown: string) => void;
}

/** 渲染 Milkdown 编辑器并注册图片上传、内容同步。 */
function EditorInner({ initialMarkdown, crepeRef, onChange }: InnerProps) {
  useEditor((container) => {
    const crepe = new Crepe({
      root: container,
      defaultValue: initialMarkdown,
      featureConfigs: {
        [CrepeFeature.ImageBlock]: {
          onUpload: uploadImage,
          inlineOnUpload: uploadImage,
          blockOnUpload: uploadImage,
          maxWidth: 1200,
        },
      },
    });

    // 实时把编辑器内的 markdown 同步到父级，保证保存时拿到最新内容。
    crepe.on((api) => {
      api.markdownUpdated((_ctx, markdown) => {
        onChange(markdown);
      });
    });

    crepeRef.current = crepe;
    return crepe;
  }, [initialMarkdown]);

  return <Milkdown />;
}

/** 内层组件：在 MilkdownProvider 内消费 useInstance，把句柄回传父级。 */
function MilkdownInner({ initialMarkdown, crepeRef, editorRef, onChange }: InnerProps) {
  const [loading, getInstance] = useInstance();
  useEffect(() => {
    editorRef.current = {
      getMarkdown: () => crepeRef.current?.getMarkdown() ?? "",
      isReady: () => !loading && getInstance() != null,
    };
  }, [loading, getInstance, crepeRef, editorRef]);
  return (
    <EditorInner
      initialMarkdown={initialMarkdown}
      crepeRef={crepeRef}
      editorRef={editorRef}
      onChange={onChange}
    />
  );
}

export interface MilkdownEditorHandle {
  getMarkdown: () => string;
  isReady: () => boolean;
}

/**
 * Milkdown 所见即所得编辑器。
 * - initialMarkdown：初始 Markdown（从文章原文解析得到）
 * - onChange：编辑器内容变化时回调，父级据此同步 state
 * - editorRef：暴露 getMarkdown() / isReady() 供保存时取值
 */
export function MilkdownEditor({
  initialMarkdown,
  editorRef,
  onChange,
}: {
  initialMarkdown: string;
  editorRef: React.MutableRefObject<MilkdownEditorHandle | null>;
  onChange: (markdown: string) => void;
}) {
  const crepeRef = useRef<Crepe | null>(null);

  // 用 ref 持有最新 onChange，避免它变化导致 useEditor 重建编辑器。
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const stableOnChange = useCallback((md: string) => {
    onChangeRef.current(md);
  }, []);

  return (
    <MilkdownProvider>
      <MilkdownInner
        initialMarkdown={initialMarkdown}
        crepeRef={crepeRef}
        editorRef={editorRef}
        onChange={stableOnChange}
      />
    </MilkdownProvider>
  );
}
