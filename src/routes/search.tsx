import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { AlbumGrid } from "@/components/coverflow";
import { OchrePortrait } from "@/components/ochre-portrait";
import { TrackList } from "@/components/track-list";
import { searchAll } from "@/lib/server/catalog";
import type { Album, Lyricist, Movie, Singer, Track } from "@/lib/types";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [value, setValue] = useState(q);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [singers, setSingers] = useState<Singer[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [lyricists, setLyricists] = useState<Lyricist[]>([]);

  useEffect(() => {
    setValue(q);
    const t = window.setTimeout(() => {
      void searchAll({ data: q }).then((r) => {
        setAlbums(r.albums);
        setTracks(r.tracks);
        setSingers(r.singers);
        setMovies(r.movies);
        setLyricists(r.lyricists);
      });
    }, 220);
    return () => window.clearTimeout(t);
  }, [q]);

  return (
    <div className="px-5 pb-8 pt-6 fade-up">
      <h1 className="font-display text-3xl italic text-ink">Search the archive</h1>
      <p className="mt-1 text-sm text-muted">
        Tamil, English, Ilaiyaraaja, Ilayaraja, Ilayaraaja — the shelf knows.
      </p>
      <label className="mt-4 flex min-h-11 items-center gap-2 rounded-[14px] border border-border bg-cream px-3">
        <SearchIcon className="size-4 text-muted" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            void navigate({ search: { q: e.target.value } });
          }}
          placeholder="Songs, films, singers, lyricists"
          className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          aria-label="Search"
        />
      </label>

      {!q ? (
        <p className="mt-10 text-sm text-muted">Try “How to Name It”, “Janaki”, or “Ilayaraja”.</p>
      ) : null}

      {singers.length ? (
        <section className="mt-8">
          <h2 className="font-display text-xl text-ink">Singers</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {singers.map((s) => (
              <Link key={s.id} to="/singer/$singerId" params={{ singerId: s.id }} className="w-24 shrink-0 text-center">
                <OchrePortrait name={s.name} src={s.photoUrl} className="mx-auto size-20 rounded-full" />
                <p className="mt-2 truncate text-xs text-ink">{s.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {lyricists.length ? (
        <section className="mt-8">
          <h2 className="font-display text-xl text-ink">Lyricists</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {lyricists.map((l) => (
              <Link key={l.id} to="/lyricist/$lyricistId" params={{ lyricistId: l.id }} className="rounded-full bg-paper-3 px-3 py-2 text-sm">
                {l.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {movies.length ? (
        <section className="mt-8">
          <h2 className="font-display text-xl text-ink">Movies</h2>
          <div className="mt-2 grid gap-2">
            {movies.map((m) => (
              <Link key={m.id} to="/movie/$movieId" params={{ movieId: m.id }} className="rounded-[14px] border border-border bg-cream px-4 py-3">
                <p className="font-medium text-ink">{m.name}</p>
                <p className="text-xs text-muted">{[m.language, m.releaseYear].filter(Boolean).join(" · ")}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {albums.length ? (
        <section className="mt-8 -mx-5">
          <h2 className="px-5 font-display text-xl text-ink">Albums</h2>
          <AlbumGrid albums={albums} />
        </section>
      ) : null}

      {tracks.length ? (
        <section className="mt-4">
          <h2 className="font-display text-xl text-ink">Songs</h2>
          <TrackList tracks={tracks} />
        </section>
      ) : q ? (
        <p className="mt-8 text-sm text-muted">Nothing matched. Try another spelling.</p>
      ) : null}
    </div>
  );
}
