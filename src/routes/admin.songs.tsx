import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { adminArchiveSong, adminBulkSongs, adminListSongs } from "@/lib/server/admin";
import { LANGUAGES } from "@/lib/moods";
import type { Track } from "@/lib/types";

export const Route = createFileRoute("/admin/songs")({ component: Page });

function Page() {
  return (
    <AdminGuard>
      <Songs />
    </AdminGuard>
  );
}

function Songs() {
  const [q, setQ] = useState("");
  const [language, setLanguage] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [genre, setGenre] = useState("");
  const [movie, setMovie] = useState("");
  const [singer, setSinger] = useState("");
  const [lyricist, setLyricist] = useState("");
  const [sort, setSort] = useState("year");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  function load() {
    void adminListSongs({
      data: {
        q: q || undefined,
        language: language || undefined,
        year: year ? Number(year) : undefined,
        status: status || undefined,
        genre: genre || undefined,
        movie: movie || undefined,
        singer: singer || undefined,
        lyricist: lyricist || undefined,
        sort,
        page,
        limit: 25,
      },
    }).then((r) => {
      setTracks(r.tracks);
      setTotal(r.total);
    });
  }

  useEffect(() => {
    load();
  }, [page, sort]);

  const pages = Math.max(1, Math.ceil(total / 25));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl italic">Songs</h1>
          <p className="text-sm text-muted">{total} in the catalog</p>
        </div>
        <Link to="/admin/songs/$id/edit" params={{ id: "new" }} className="inline-flex min-h-11 items-center rounded-[12px] bg-ochre px-4 text-sm text-cream">
          Create song
        </Link>
      </div>
      <form
        className="mt-4 grid gap-2 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title" className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm" />
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm">
          <option value="">All languages</option>
          {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm" />
        <input value={movie} onChange={(e) => setMovie(e.target.value)} placeholder="Movie" className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm" />
        <input value={singer} onChange={(e) => setSinger(e.target.value)} placeholder="Singer" className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm" />
        <input value={lyricist} onChange={(e) => setLyricist(e.target.value)} placeholder="Lyricist" className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm" />
        <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm">
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="metadata_only">metadata_only</option>
          <option value="archived">archived</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-[12px] border border-border bg-cream px-3 text-sm">
          <option value="year">Year</option>
          <option value="title">Title</option>
          <option value="updated">Updated</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>

      {selected.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void adminBulkSongs({ data: { ids: selected, action: "archive" } }).then(load)}>Archive selected</Button>
          <Button variant="ghost" onClick={() => setSelected([])}>Clear</Button>
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-[16px] border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="p-3"><input type="checkbox" aria-label="Select all" onChange={(e) => setSelected(e.target.checked ? tracks.map((t) => t.id) : [])} /></th>
              <th className="p-3">Title</th>
              <th className="p-3">Movie</th>
              <th className="p-3">Year</th>
              <th className="p-3">Language</th>
              <th className="p-3">Singers</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => (
              <tr key={t.id} className="border-t border-border/70">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={(e) => setSelected(e.target.checked ? [...selected, t.id] : selected.filter((id) => id !== t.id))}
                    aria-label={`Select ${t.title}`}
                  />
                </td>
                <td className="p-3">
                  <Link to="/admin/songs/$id/edit" params={{ id: t.id }} className="font-medium text-ochre-dark">{t.title}</Link>
                </td>
                <td className="p-3">{t.movieName}</td>
                <td className="p-3">{t.releaseYear}</td>
                <td className="p-3">{t.language}</td>
                <td className="p-3">{t.singers.map((s) => s.name).join(", ") || t.artist}</td>
                <td className="p-3">
                  <span className="rounded-full bg-paper-3 px-2 py-0.5 text-[11px]">{t.status}</span>
                  {t.status === "archived" ? (
                    <button type="button" className="ml-2 text-xs text-ochre-dark" onClick={() => void adminArchiveSong({ data: { id: t.id, restore: true } }).then(load)}>restore</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span>Page {page} / {pages}</span>
        <Button variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
