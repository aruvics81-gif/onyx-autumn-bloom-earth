import { Pause, Play } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Track } from "@/lib/types";
import { usePlayer } from "@/lib/player-store";
import { previewLabel } from "@/lib/normalize";
import { cn, formatTime } from "@/lib/utils";

export function TrackList({
  tracks,
  showAlbum = true,
}: {
  tracks: Track[];
  showAlbum?: boolean;
}) {
  const current = usePlayer((s) => s.current);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const playTrack = usePlayer((s) => s.playTrack);
  const toggle = usePlayer((s) => s.toggle);

  if (!tracks.length) {
    return <p className="px-1 py-8 text-sm text-muted">No songs on this pressing.</p>;
  }

  return (
    <ol className="divide-y divide-border/80">
      {tracks.map((track, i) => {
        const active = current?.id === track.id;
        const label = previewLabel(track.sourceType);
        return (
          <li key={track.id}>
            <div className={cn("flex w-full items-center gap-3 px-1 py-3", active && "bg-ochre/10")}>
              <button
                type="button"
                onClick={() => (active ? toggle() : playTrack(track, tracks))}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-cream text-ink"
                aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
              >
                {active && isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current" />
                )}
              </button>
              <Link
                to="/song/$trackId"
                params={{ trackId: track.id }}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {track.albumArtUrl ? (
                  <img src={track.albumArtUrl} alt="" className="size-12 shrink-0 rounded-[10px] object-cover" />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-ochre font-display text-cream">
                    {String(track.trackNumber || i + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{track.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {track.singers.map((s) => s.name).join(", ") || track.artist}
                    {showAlbum ? ` · ${track.movieName}` : ""}
                  </span>
                  {label ? <span className="preview-pill mt-1">{label}</span> : null}
                </span>
              </Link>
              <span className="shrink-0 text-xs tabular-nums text-muted">
                {track.catalogDuration ? formatTime(track.catalogDuration) : "—"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
