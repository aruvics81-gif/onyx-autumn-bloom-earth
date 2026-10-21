import { useMemo } from "react";
import { cn } from "@/lib/utils";

function barsFor(seed: string, count = 48): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    const n = (h >>> 0) / 4294967295;
    const envelope = Math.sin((i / count) * Math.PI);
    out.push(0.18 + envelope * (0.35 + n * 0.47));
  }
  return out;
}

export function WaveformSeeker({
  seed,
  progress,
  duration,
  onSeek,
  className,
}: {
  seed: string;
  progress: number;
  duration: number;
  onSeek: (seconds: number) => void;
  className?: string;
}) {
  const bars = useMemo(() => barsFor(seed), [seed]);
  const ratio = duration > 0 ? Math.min(1, progress / duration) : 0;

  return (
    <div
      className={cn("flex h-12 cursor-pointer items-end gap-px", className)}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(progress)}
      aria-label="Seek"
      tabIndex={0}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        onSeek(x * duration);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(duration, progress + 2));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 2));
      }}
    >
      {bars.map((h, i) => {
        const filled = i / bars.length <= ratio;
        return (
          <span
            key={i}
            className="wave-bar w-full rounded-full"
            style={{
              height: `${Math.round(h * 100)}%`,
              backgroundColor: filled ? "var(--color-ochre)" : "rgb(28 19 14 / 0.18)",
            }}
          />
        );
      })}
    </div>
  );
}
