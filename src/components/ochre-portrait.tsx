import { cn } from "@/lib/utils";

export function OchrePortrait({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "grid place-items-center bg-ochre font-display text-cream",
        className,
      )}
      aria-hidden="true"
    >
      {initials || "IR"}
    </div>
  );
}
