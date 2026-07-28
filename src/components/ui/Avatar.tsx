export function Avatar({ size = 80, src, alt = "voidbit 头像" }: { size?: number; src?: string; alt?: string }) {
  const borderWidth = Math.max(2, Math.round(size / 48));
  const finalSrc = src || "/images/avator.jpg";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border-${borderWidth} border-border shadow-lg`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalSrc}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
