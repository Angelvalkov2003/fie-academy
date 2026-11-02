import Image from "next/image";

const SRC = "/fie-fencing-academy-logo.png";
const RATIO = 1720 / 520;

/** White logo for dark surfaces; pass `color` to tint it for light surfaces. */
export function Logo({
  height = 30,
  color,
  className,
}: {
  height?: number;
  color?: string;
  className?: string;
}) {
  const width = Math.round(height * RATIO);
  if (!color)
    return (
      <Image
        src={SRC}
        alt="FIE Fencing Academy"
        width={width}
        height={height}
        priority
        className={className}
      />
    );
  return (
    <span
      role="img"
      aria-label="FIE Fencing Academy"
      className={`logo-mask${className ? ` ${className}` : ""}`}
      style={{ width, height, background: color }}
    />
  );
}
