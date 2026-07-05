/**
 * @file 像素风程序员头像组件
 * 纯 CSS box-shadow 像素画——一个戴眼镜、穿卫衣的黑客风格头像。
 * 无需任何图片文件，可随主题色自适应。
 */

export function PixelAvatar({ size = 80 }: { size?: number }) {
  // 像素格大小（20×20 网格）
  const pixelSize = Math.round(size / 20);

  const wrapperStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    imageRendering: "pixelated",
    flexShrink: 0,
    display: "grid",
    gridTemplateColumns: `repeat(20, ${pixelSize}px)`,
    gridTemplateRows: `repeat(20, ${pixelSize}px)`,
  };

  // 全像素人像：从头顶到衣领的完整头像，暗色调背景让人物更突出
  // 0=背景/透明, 1=深色头发/轮廓, 2=肤色, 3=卫衣主色, 4=卫衣暗部, 5=镜片, 6=镜片高光, 7=皮肤阴影, 8=嘴唇
  const grid: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0],
    [0, 0, 1, 2, 2, 2, 5, 5, 2, 2, 2, 2, 5, 5, 2, 2, 2, 1, 0, 0],
    [0, 0, 1, 2, 1, 5, 6, 6, 5, 2, 2, 5, 6, 6, 5, 1, 2, 1, 0, 0],
    [0, 1, 1, 2, 1, 5, 6, 1, 5, 2, 2, 5, 1, 6, 5, 1, 2, 1, 1, 0],
    [0, 1, 1, 2, 2, 2, 5, 5, 2, 7, 7, 2, 5, 5, 2, 2, 2, 1, 1, 0],
    [0, 1, 1, 7, 2, 2, 2, 2, 2, 7, 7, 2, 2, 2, 2, 7, 2, 1, 1, 0],
    [0, 1, 1, 7, 7, 2, 2, 2, 7, 2, 2, 7, 2, 2, 2, 7, 7, 1, 1, 0],
    [0, 1, 1, 2, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 7, 7, 2, 1, 1, 0],
    [0, 1, 1, 2, 2, 7, 2, 2, 3, 3, 3, 3, 2, 2, 7, 2, 2, 1, 1, 0],
    [0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0],
    [0, 1, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 1, 0],
    [0, 1, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 1, 0],
    [0, 0, 1, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 1, 0, 0],
    [0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0],
  ];

  // 使用 oklch CSS 变量引用，通过 style 实现主题色联动
  const colorMap: Record<number, string> = {
    0: "transparent",
    1: "oklch(0.15 0.01 260)",          // 深发色
    2: "oklch(0.88 0.04 72)",           // 肤色
    3: "var(--color-primary)",           // 卫衣主色
    4: "var(--color-primary-hover)",     // 卫衣暗部
    5: "oklch(0.92 0.01 260)",          // 镜片
    6: "var(--color-accent)",            // 镜片高光
    7: "oklch(0.82 0.04 72)",           // 皮肤阴影
    8: "oklch(0.55 0.15 20)",           // 嘴唇
  };

  return (
    <div
      className="overflow-hidden rounded-2xl border-2 border-border shadow-lg"
      style={{
        width: `${size + 4}px`,
        height: `${size + 4}px`,
        background: "var(--color-bg-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={wrapperStyle} aria-label="V0idbit 像素头像">
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            style={{
              width: `${pixelSize}px`,
              height: `${pixelSize}px`,
              backgroundColor: colorMap[cell] || "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}
