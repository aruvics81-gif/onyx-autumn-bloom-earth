import {
  ChevronDown,
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Timer,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { previewLabel } from "@/lib/normalize";
import { listFavorites, toggleFavorite } from "@/lib/server/analytics";
import { usePlayer } from "@/lib/player-store";
import { formatTime } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tonearm, VinylDisc } from "./vinyl-disc";
import { WaveformSeeker } from "./waveform-seeker";
import { QueuePanel } from "./queue-panel";

export function FullPlayer() {
  const {
    current,
    isPlaying,
    progress,
    duration,
    expanded,
    error,
    shuffle,
    repeat,
    queue,
    queueOpen,
    sleepMode,
    sleepEndsAt,
    toggle,
    next,
    prev,
    seek,
    setExpanded,
    toggleShuffle,
    cycleRepeat,
    retry,
    setQueueOpen,
    setSleep,
  } = usePlayer();
  const [fav, setFav] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sleepEndsAt) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [sleepEndsAt]);

  useEffect(() => {
    if (!current) return;
    void listFavorites()
      .then((rows) => setFav(rows.some((t) => t.id === current.id)))
      .catch(() => undefined);
  }, [current?.id]);

  if (!expanded || !current) return null;
  const label = previewLabel(current.sourceType, duration || null);
  const remain = sleepEndsAt ? Math.max(0, Math.round((sleepEndsAt - now) / 1000)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper paper-grain">
      <header className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="grid size-11 place-items-center rounded-full bg-cream text-ink"
          aria-label="Close player"
        >
          <ChevronDown className="size-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Now spinning</p>
          <p className="font-display text-sm text-ink">{current.albumTitle ?? current.movieName}</p>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center text-ochre"
          aria-label={fav ? "Remove favorite" : "Favorite"}
          onClick={() => {
            void toggleFavorite({ data: current.id })
              .then((r) => setFav(r.favorited))
              .catch(() => undefined);
          }}
        >
          <Heart className="size-5" fill={fav ? "currentColor" : "none"} />
        </button>
      </header>

      <div className="mx-auto mt-4 grid w-full max-w-6xl flex-1 gap-6 overflow-y-auto px-5 pb-6 lg:grid-cols-[1fr_1fr_minmax(240px,320px)]">
        <div className="poster-frame mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[22px] bg-paper-3">
          {current.albumArtUrl ? (
            <img src={current.albumArtUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center bg-ochre font-display text-4xl text-cream">OCHRE</div>
          )}
        </div>
        <div className="relative mx-auto grid place-items-center py-6">
          <VinylDisc
            artUrl={current.vinylCenterLabelUrl || current.albumArtUrl}
            spinning={isPlaying}
            onClick={toggle}
          />
          <Tonearm playing={isPlaying} />
        </div>
        <div className="hidden lg:block">
          <QueuePanel />
        </div>

        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl leading-tight text-ink">{current.title}</h1>
          <p className="mt-1 text-sm text-muted">
            Music: Ilaiyaraaja
            {current.lyricists[0] ? ` · Lyrics: ${current.lyricists.map((l) => l.name).join(", ")}` : ""}
            {` · ${current.movieName} · ${current.releaseYear}`}
          </p>
          {label ? <p className="preview-pill mt-2">{label}</p> : null}

          <div className="mt-5">
            <WaveformSeeker seed={current.id} progress={progress} duration={duration} onSeek={seek} />
            <div className="mt-1 flex justify-between text-xs tabular-nums text-muted">
              <span>{formatTime(progress)}</span>
              <span>{duration ? formatTime(duration) : "—"}</span>
            </div>
          </div>

          {error ? (
            <div className="mt-3 rounded-[14px] border border-border bg-cream p-3 text-sm">
              <p className="font-medium text-ink">Unable to play this track.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" onClick={retry}>Retry</Button>
                {current.officialUrl ? (
                  <a href={current.officialUrl} target="_blank" rel="noreferrer">
                    <Button type="button" variant="outline">
                      <ExternalLink className="size-4" /> Open official source
                    </Button>
                  </a>
                ) : null}
                <Button type="button" variant="ghost" onClick={next}>Skip</Button>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={toggleShuffle}
              className="grid size-11 place-items-center text-ink"
              aria-label={shuffle ? "Shuffle on" : "Shuffle off"}
              aria-pressed={shuffle}
            >
              <Shuffle className="size-4" strokeWidth={shuffle ? 2.6 : 1.8} />
            </button>
            <button
              type="button"
              onClick={prev}
              className="grid size-12 place-items-center rounded-full bg-cream text-ink"
              aria-label="Previous"
            >
              <SkipBack className="size-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={toggle}
              className="grid size-16 place-items-center rounded-full bg-ochre text-cream shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="size-7 fill-current" /> : <Play className="size-7 fill-current" />}
            </button>
            <button
              type="button"
              onClick={next}
              className="grid size-12 place-items-center rounded-full bg-cream text-ink"
              aria-label="Next"
            >
              <SkipForward className="size-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              className="grid size-11 place-items-center text-ink"
              aria-label={`Repeat ${repeat}`}
            >
              {repeat === "one" ? (
                <Repeat1 className="size-4" strokeWidth={2.6} />
              ) : (
                <Repeat className="size-4" strokeWidth={repeat === "off" ? 1.8 : 2.6} />
              )}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-cream px-3 text-xs"
              onClick={() => setQueueOpen(!queueOpen)}
              aria-label="Queue"
            >
              <ListMusic className="size-4" /> Queue · {queue.length}
            </button>
            <SleepMenu mode={sleepMode} remain={remain} onPick={setSleep} />
            <Link
              to="/song/$trackId"
              params={{ trackId: current.id }}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-xs"
              onClick={() => setExpanded(false)}
            >
              Song details
            </Link>
          </div>

          {queueOpen ? (
            <div className="mt-4 lg:hidden">
              <QueuePanel />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SleepMenu({
  mode,
  remain,
  onPick,
}: {
  mode: string | null;
  remain: number;
  onPick: (m: "15" | "30" | "45" | "60" | "end" | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-cream px-3 text-xs"
        aria-label="Sleep timer"
        onClick={() => setOpen((v) => !v)}
      >
        <Timer className="size-4" />
        {mode === "end" ? "End of song" : mode ? formatTime(remain) : "Sleep"}
      </button>
      {open ? (
        <div className="absolute bottom-12 left-0 z-10 min-w-40 rounded-[14px] border border-border bg-cream p-2 shadow-lg">
          {(["15", "30", "45", "60"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className="block w-full rounded-[10px] px-3 py-2 text-left text-sm hover:bg-paper-3"
              onClick={() => {
                onPick(m);
                setOpen(false);
              }}
            >
              {m} minutes
            </button>
          ))}
          <button
            type="button"
            className="block w-full rounded-[10px] px-3 py-2 text-left text-sm hover:bg-paper-3"
            onClick={() => {
              onPick("end");
              setOpen(false);
            }}
          >
            End of current song
          </button>
          <button
            type="button"
            className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-muted"
            onClick={() => {
              onPick(null);
              setOpen(false);
            }}
          >
            Off
          </button>
        </div>
      ) : null}
    </div>
  );
}
