import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { adminListEntities, adminSaveAlbum, adminSavePerson, adminSaveTaxonomy, adminTaxonomy } from "@/lib/server/admin";
import { Button } from "./ui/button";
import { OchrePortrait } from "./ochre-portrait";

export function PersonAdmin({ kind }: { kind: "singer" | "lyricist" | "artist" | "movie" }) {
  const listKind = kind === "singer" ? "singers" : kind === "lyricist" ? "lyricists" : kind === "artist" ? "artists" : "movies";
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");

  function load() {
    void adminListEntities({ data: { kind: listKind, q: q || undefined } }).then((r) => {
      const key = listKind;
      setRows((r[key] as Array<Record<string, unknown>>) ?? []);
    });
  }
  useEffect(() => { load(); }, [kind]);

  return (
    <div>
      <h1 className="font-display text-3xl italic capitalize">{listKind}</h1>
      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-11 flex-1 rounded-[12px] border border-border bg-cream px-3" />
        <Button type="submit">Search</Button>
      </form>
      <form
        className="mt-4 grid gap-2 rounded-[16px] border border-border bg-cream p-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void adminSavePerson({ data: { kind, name, biography: bio, photoUrl: photo } }).then(() => {
            setName(""); setBio(""); setPhoto(""); load();
          });
        }}
      >
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-11 rounded-[12px] border border-border px-3" />
        <input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="Photo URL (licensed only)" className="h-11 rounded-[12px] border border-border px-3" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Biography / description" className="min-h-20 rounded-[12px] border border-border p-3 md:col-span-2" />
        <Button type="submit">Create / update</Button>
      </form>
      <ul className="mt-4 divide-y divide-border">
        {rows.map((r) => {
          const id = String(r.id);
          const nm = String(r.name || r.title || "");
          const photoUrl = (r.photoUrl || r.photo_url || r.posterUrl || r.poster_url) as string | undefined;
          const href =
            kind === "singer" ? `/admin/singers/${id}` :
            kind === "lyricist" ? `/admin/lyricists/${id}` :
            kind === "movie" ? `/admin/movies/${id}` : undefined;
          return (
            <li key={id} className="flex items-center gap-3 py-3">
              <OchrePortrait name={nm} src={photoUrl} className="size-12 rounded-full" />
              <div className="min-w-0 flex-1">
                {href ? <a href={href} className="font-medium text-ochre-dark">{nm}</a> : <p className="font-medium">{nm}</p>}
                <p className="text-xs text-muted">{String(r.songCount ?? r.song_count ?? r.releaseYear ?? r.release_year ?? "")}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TaxonomyAdmin({ kind }: { kind: "genre" | "mood" | "language" }) {
  const [rows, setRows] = useState<Array<{ id: string; name: string; description?: string | null }>>([]);
  const [name, setName] = useState("");
  function load() {
    void adminTaxonomy().then((r) => {
      setRows(kind === "genre" ? r.genres : kind === "mood" ? r.moods : r.languages);
    });
  }
  useEffect(() => { load(); }, [kind]);
  return (
    <div>
      <h1 className="font-display text-3xl italic capitalize">{kind}s</h1>
      <form className="mt-4 flex gap-2" onSubmit={(e) => {
        e.preventDefault();
        void adminSaveTaxonomy({ data: { kind, name } }).then(() => { setName(""); load(); });
      }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-11 flex-1 rounded-[12px] border border-border bg-cream px-3" />
        <Button type="submit">Add</Button>
      </form>
      <ul className="mt-4 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.id} className="py-3">
            <p className="font-medium">{r.name}</p>
            {r.description ? <p className="text-xs text-muted">{r.description}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AlbumAdminList() {
  const [rows, setRows] = useState<Array<{ id: string; title: string; releaseYear: number; trackCount: number; coverUrl: string }>>([]);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("1986");
  function load() {
    void adminListEntities({ data: { kind: "albums" } }).then((r) => setRows(r.albums ?? []));
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1 className="font-display text-3xl italic">Albums</h1>
      <form className="mt-4 flex flex-wrap gap-2" onSubmit={(e) => {
        e.preventDefault();
        void adminSaveAlbum({ data: { title, releaseYear: Number(year) } }).then(load);
      }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Album title" className="h-11 rounded-[12px] border border-border bg-cream px-3" />
        <input value={year} onChange={(e) => setYear(e.target.value)} className="h-11 w-24 rounded-[12px] border border-border bg-cream px-3" />
        <Button type="submit">Create</Button>
      </form>
      <ul className="mt-4 divide-y divide-border">
        {rows.map((a) => (
          <li key={a.id} className="flex items-center gap-3 py-3">
            {a.coverUrl ? <img src={a.coverUrl} alt="" className="size-12 rounded-[10px] object-cover" /> : <span className="grid size-12 place-items-center rounded-[10px] bg-ochre text-cream">O</span>}
            <Link to="/admin/albums/$id" params={{ id: a.id }} className="font-medium text-ochre-dark">{a.title}</Link>
            <span className="text-xs text-muted">{a.releaseYear} · {a.trackCount} tracks</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
