import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coverflow } from "@/components/coverflow";
import { VinylStage } from "@/components/vinyl-stage";
import { homeShelf, listTracks } from "@/lib/server/catalog";
import { usePlayer } from "@/lib/player-store";
import { ERAS } from "@/lib/moods";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: () => homeShelf(),
  component: Home,
});

function Home() {
  const shelf = Route.useLoaderData();
  const featured = shelf.featured.length ? shelf.featured : shelf.recent;
  const instrumental = shelf.instrumental;
  const [continueTrack, setContinueTrack] = useState<Track | null>(null);
  const current = usePlayer((s) => s.current);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const playAlbum = usePlayer((s) => s.playAlbum);
  const playTrack = usePlayer((s) => s.playTrack);
  const toggle = usePlayer((s) => s.toggle);

  useEffect(() => {
    void listTracks({ data: { limit: 8 } }).then((r) => {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("ochre.player") : null;
      let lastId: string | undefined;
      try {
        lastId = saved ? (JSON.parse(saved) as { lastTrackId?: string }).lastTrackId : undefined;
      } catch {
        lastId = undefined;
      }
      const found = r.tracks.find((t) => t.id === lastId) ?? r.tracks[0];
      setContinueTrack(found ?? null);
    });
  }, []);

  const heroAlbum = (current && featured.find((a) => a.id === current.albumId)) || featured[0] || instrumental[0] || null;

  return (
    <div className="fade-up">
      <section className="px-5 pb-2 pt-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ochre-dark">
          Isaignani · a digital museum
        </p>
        <h1 className="mt-2 max-w-xl font-display text-[2.15rem] italic leading-[1.12] text-ink md:text-5xl">
          Designing my color vinyl
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          Warm analog Ilaiyaraaja — Tamil soil, Telugu ragas, Malayalam dusk,
          brass, and tape hiss. Drop the needle. The record is real.
        </p>
      </section>

      {heroAlbum ? (
        <section className="px-4 pt-2">
          <VinylStage
            album={heroAlbum}
            track={current && current.albumId === heroAlbum.id ? current : continueTrack}
            playing={Boolean(current && current.albumId === heroAlbum.id && isPlaying)}
            onToggle={() => {
              if (current && current.albumId === heroAlbum.id) toggle();
              else void playAlbum(heroAlbum.id);
            }}
          />
        </section>
      ) : (
        <div className="mx-4 mt-4 h-64 ochre-skeleton rounded-[22px]" />
      )}

      {continueTrack ? (
        <section className="mt-8 px-5">
          <h2 className="font-display text-2xl text-ink">Continue listening</h2>
          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 rounded-[16px] border border-border bg-cream p-3 text-left"
            onClick={() => playTrack(continueTrack)}
          >
            {continueTrack.albumArtUrl ? (
              <img src={continueTrack.albumArtUrl} alt="" className="size-14 rounded-[12px] object-cover" />
            ) : (
              <span className="grid size-14 place-items-center rounded-[12px] bg-ochre text-cream">IR</span>
            )}
            <span>
              <span className="block font-display text-lg text-ink">{continueTrack.title}</span>
              <span className="block text-sm text-muted">{continueTrack.movieName}</span>
            </span>
          </button>
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex items-end justify-between px-5">
          <div>
            <h2 className="font-display text-2xl text-ink">The shelf</h2>
            <p className="text-sm text-muted">Flick through the pressings</p>
          </div>
          <Link to="/discover" className="text-sm font-medium text-ochre-dark">
            Discover
          </Link>
        </div>
        <Coverflow albums={featured} />
      </section>

      {instrumental.length ? (
        <section className="mt-4">
          <div className="px-5">
            <h2 className="font-display text-2xl text-ink">Non-film suites</h2>
            <p className="text-sm text-muted">How to Name It? · Nothing But Wind</p>
          </div>
          <Coverflow albums={instrumental} />
        </section>
      ) : null}

      <section className="mt-4 px-5 pb-8">
        <h2 className="font-display text-2xl text-ink">By decade</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ERAS.map((era) => (
            <Link
              key={era.id}
              to="/discover"
              search={{ era: era.id }}
              className="rounded-[18px] border border-border bg-cream px-4 py-4"
            >
              <p className="font-display text-xl text-ink">{era.label}</p>
              <p className="text-xs text-muted">{era.range}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
