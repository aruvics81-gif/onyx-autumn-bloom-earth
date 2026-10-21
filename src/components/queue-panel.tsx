import { GripVertical, X } from "lucide-react";
import { usePlayer } from "@/lib/player-store";
import { cn } from "@/lib/utils";

export function QueuePanel() {
  const { queue, queueIndex, current, playTrack, removeFromQueue, clearQueue, moveInQueue } = usePlayer();

  return (
    <div className="rounded-[18px] border border-border bg-cream/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Queue</p>
        <button type="button" className="text-xs text-ochre-dark" onClick={clearQueue} aria-label="Clear queue">
          Clear
        </button>
      </div>
      <ol className="max-h-[52vh] space-y-1 overflow-y-auto">
        {queue.map((track, i) => (
          <li
            key={`${track.id}-${i}`}
            className={cn(
              "flex items-center gap-2 rounded-[12px] px-2 py-2",
              i === queueIndex && "bg-ochre/15",
            )}
          >
            <button
              type="button"
              className="text-muted"
              aria-label="Reorder"
              onClick={() => {
                if (i > 0) moveInQueue(i, i - 1);
              }}
            >
              <GripVertical className="size-4" />
            </button>
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => playTrack(track, queue)}
            >
              <p className="truncate text-sm text-ink">{track.title}</p>
              <p className="truncate text-[11px] text-muted">{track.movieName}</p>
            </button>
            {current?.id === track.id ? null : (
              <button
                type="button"
                className="grid size-8 place-items-center text-muted"
                aria-label={`Remove ${track.title}`}
                onClick={() => removeFromQueue(i)}
              >
                <X className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
