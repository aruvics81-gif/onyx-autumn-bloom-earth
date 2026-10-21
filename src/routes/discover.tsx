import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlbumGrid } from "@/components/coverflow";
import { MoodWheel } from "@/components/mood-wheel";
import { TrackList } from "@/components/track-list";
import { ERAS, LANGUAGES, MOODS } from "@/lib/moods";
import { listAlbums, listTracks } from "@/lib/server/catalog";
import type { Album, Track } from "@/lib/types";
import { cn } from "@/lib/utils";

type Search = { mood?: string; era?: string; language?: string; tab?: string };

export const Route = createFileRoute("/discover")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mood: typeof s.mood === "string" ? s.mood : undefined,
    era: typeof s.era === "string" ? s.era : undefined,
    language: typeof s.language === "string" ? s.language : undefined,
    tab: typeof s.tab === "string" ? s.tab : undefined,
  }),
  component: Discover,
});

function Discover() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const tab = search.tab || (search.mood ? "mood" : search.era ? "era" : "albums");
  const mood = search.mood ?? "romance";
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [bgm, setBgm] = useState<Album[]>([]);

  useEffect(() => {
    void listAlbums({
      data: {
        mood: tab === "mood" ? mood : undefined,
        era: search.era,
        language: search.language,
        category: tab === "bgm" ? "bgm" : undefined,
        limit: 60,
      },
    }).then(setAlbums);
    void listTracks({
      data: {
        mood: tab === "mood" ? mood : undefined,
        era: search.era,
        language: search.language,
        category: tab === "bgm" ? "bgm" : undefined,
        limit: 16,
      },
    }).then((r) => setTracks(r.tracks));
    void listAlbums({ data: { category: "bgm", limit: 20 } }).then(setBgm);
  }, [tab, mood, search.era, search.language]);

  function patch(next: Search) {
    void navigate({ search: { ...search, ...next } });
  }

  return (
    <div className="pt-6 fade-up">
      <div className="px-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ochre-dark">Discover</p>
        <h1 className="mt-1 font-display text-3xl italic text-ink">Find a feeling</h1>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {["albums", "mood", "era", "language", "bgm"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => patch({ tab: t })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-xs font-medium capitalize",
                tab === t ? "border-ochre-dark bg-ochre text-cream" : "border-border bg-cream text-ink",
              )}
            >
              {t === "bgm" ? "BGM / Scores" : t}
            </button>
          ))}
        </div>
      </div>

      {tab === "mood" ? (
        <div className="mt-6">
          <MoodWheel selected={mood} onSelect={(id) => patch({ tab: "mood", mood: id })} />
          <p className="mt-3 px-5 text-center text-sm text-muted">
            {MOODS.find((m) => m.id === mood)?.line}
          </p>
        </div>
      ) : null}

      {tab === "era" ? (
        <div className="mt-4 flex gap-2 overflow-x-auto px-5">
          {ERAS.map((era) => (
            <button
              key={era.id}
              type="button"
              onClick={() => patch({ tab: "era", era: era.id })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-xs",
                search.era === era.id ? "border-ochre-dark bg-ochre text-cream" : "border-border bg-cream",
              )}
            >
              {era.label}
            </button>
          ))}
        </div>
      ) : null}

      {tab === "language" ? (
        <div className="mt-4 flex gap-2 overflow-x-auto px-5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => patch({ tab: "language", language: lang })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-xs",
                search.language === lang ? "border-ochre-dark bg-ochre text-cream" : "border-border bg-cream",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      ) : null}

      {tab === "bgm" ? (
        <section className="mt-6">
          <h2 className="px-5 font-display text-xl text-ink">Scores & suites</h2>
          <AlbumGrid albums={bgm.length ? bgm : albums} />
        </section>
      ) : (
        <section className="mt-6">
          <h2 className="px-5 font-display text-xl text-ink">Albums</h2>
          <AlbumGrid albums={albums} />
        </section>
      )}

      <section className="px-5 pb-8">
        <h2 className="font-display text-xl text-ink">Needles to drop</h2>
        <TrackList tracks={tracks} />
      </section>
    </div>
  );
}
