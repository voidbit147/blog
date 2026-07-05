/**
 * @file 头像组件
 * 支持本地图片或外部 URL。将图片放入 public/images/avatar.png 即可生效。
 * 也可传入 src 属性使用外部图片，或通过 alt 自定义替代文本。
 *
 * 用法：
 *   <Avatar size={96} />
 *   <Avatar size={80} src="/images/my-avatar.jpg" alt="我的头像" />
 */

interface AvatarProps {
  size?: number;
  src?: string;
  alt?: string;
}

export function Avatar({ size = 80, src = "/images/avatar.png", alt = "V0idbit 头像" }: AvatarProps) {
  const borderWidth = Math.max(2, Math.round(size / 48));

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border-${borderWidth} border-border shadow-lg`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
