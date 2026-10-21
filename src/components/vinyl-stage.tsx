import { Pause, Play } from "lucide-react";
import type { Album, Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tonearm, VinylDisc } from "./vinyl-disc";

export function VinylStage({
  album,
  track,
  playing,
  onToggle,
  compact = false,
}: {
  album: Album;
  track?: Track | null;
  playing: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const art = track?.albumArtUrl || album.coverUrl;
  const label = track?.vinylCenterLabelUrl || art;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] bg-cream",
        compact ? "p-4" : "p-5 md:p-8",
      )}
    >
      <div
        className={cn(
          "grid items-center gap-4",
          compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 md:gap-8",
        )}
      >
        <div className="relative mx-auto w-full max-w-sm">
          <div className="poster-frame aspect-square overflow-hidden rounded-[18px] bg-paper-3">
            {art ? (
              <img
                src={art}
                alt={album.title}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <span className="grid h-full place-items-center bg-ochre font-display text-3xl text-cream">
                {album.title.slice(0, 1)}
              </span>
            )}
          </div>
          <p className="mt-3 font-display text-xl leading-tight text-ink md:text-2xl">
            {track?.title ?? album.title}
          </p>
          <p className="text-sm text-muted">
            {album.movieName}
            {album.releaseYear ? ` · ${album.releaseYear}` : ""} · Ilaiyaraaja
          </p>
        </div>

        <div className="relative mx-auto grid place-items-center py-4">
          <VinylDisc artUrl={label} spinning={playing} onClick={onToggle} />
          <Tonearm playing={playing} />
          <button
            type="button"
            onClick={onToggle}
            className="absolute bottom-2 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-ochre text-cream shadow-lg"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  );
}
