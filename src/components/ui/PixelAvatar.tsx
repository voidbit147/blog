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

  // 0=透明, 1=头发/深色, 2=皮肤, 3=卫衣主色(primary), 4=阴影色, 5=眼镜, 6=高光, 7=嘴唇
  const grid: number[][] = [
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0],
    [1, 1, 1, 2, 2, 2, 5, 5, 2, 2, 2, 2, 5, 5, 2, 2, 2, 1, 1, 1],
    [1, 1, 1, 2, 2, 5, 6, 6, 5, 2, 2, 5, 6, 6, 5, 2, 2, 1, 1, 1],
    [1, 1, 1, 2, 2, 5, 6, 1, 5, 2, 2, 5, 6, 1, 5, 2, 2, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 5, 5, 2, 2, 2, 2, 5, 5, 2, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 3, 2, 2, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 1, 1],
    [1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1],
    [1, 1, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 1, 1],
    [1, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1],
    [1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1],
    [0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0],
  ];

  // 使用 oklch CSS 变量引用，通过 style 实现主题色联动
  const colorMap: Record<number, string> = {
    0: "transparent",
    1: "var(--color-text)",           // 头发
    2: "oklch(0.92 0.04 72)",         // 肤色
    3: "var(--color-primary)",         // 卫衣
    4: "var(--color-primary-hover)",   // 卫衣暗部
    5: "var(--color-bg)",             // 眼镜片
    6: "var(--color-accent)",          // 眼镜高光
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
