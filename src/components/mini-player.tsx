import { Pause, Play, SkipForward } from "lucide-react";
import { usePlayer } from "@/lib/player-store";
import { previewLabel } from "@/lib/normalize";
import { VinylDisc } from "./vinyl-disc";

export function MiniPlayer() {
  const { current, isPlaying, progress, duration, toggle, next, setExpanded, expanded, error } =
    usePlayer();
  if (!current || expanded) return null;
  const ratio = duration > 0 ? Math.min(1, progress / duration) : 0;
  const label = previewLabel(current.sourceType, duration || null);

  return (
    <div className="pointer-events-auto mx-3 mb-2 overflow-hidden rounded-[18px] border border-border bg-cream shadow-[0_8px_30px_rgb(28_19_14_/_0.12)]">
      <div className="h-0.5 w-full bg-paper-3">
        <div className="h-full bg-ochre" style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="flex items-center gap-3 px-3 py-2">
        <button type="button" onClick={() => setExpanded(true)} className="shrink-0" aria-label="Open player">
          <VinylDisc
            artUrl={current.vinylCenterLabelUrl || current.albumArtUrl}
            spinning={isPlaying}
            sizeClass="vinyl-mini"
            interactive={false}
          />
        </button>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate font-display text-sm text-ink">{current.title}</p>
          <p className="truncate text-xs text-muted">
            {error ? error : label ? `${label} · ${current.movieName}` : current.movieName}
          </p>
        </button>
        <button
          type="button"
          onClick={toggle}
          className="grid size-11 place-items-center rounded-full bg-ochre text-cream"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>
        <button
          type="button"
          onClick={next}
          className="grid size-11 place-items-center text-ink"
          aria-label="Next"
        >
          <SkipForward className="size-4" />
        </button>
      </div>
    </div>
  );
}
