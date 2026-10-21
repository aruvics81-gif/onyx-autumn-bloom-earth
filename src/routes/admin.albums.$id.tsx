import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { adminArchiveAlbum, adminSaveAlbum } from "@/lib/server/admin";
import { getAlbumWithTracks } from "@/lib/server/catalog";
import type { Album, Track } from "@/lib/types";

export const Route = createFileRoute("/admin/albums/$id")({ component: Page });

function Page() {
  return <AdminGuard><AlbumEdit /></AdminGuard>;
}

function AlbumEdit() {
  const { id } = Route.useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(1980);
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState("");
  const [type, setType] = useState("film_soundtrack");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void getAlbumWithTracks({ data: id }).then((p) => {
      if (!p) return;
      setAlbum(p.album);
      setTracks(p.tracks);
      setTitle(p.album.title);
      setYear(p.album.releaseYear);
      setDesc(p.album.description);
      setCover(p.album.coverUrl);
      setType(p.album.albumType);
    });
  }, [id]);

  if (!album) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/albums" className="text-xs text-muted">Albums</Link>
      <h1 className="font-display text-3xl italic">{album.title}</h1>
      {cover ? <img src={cover} alt="" className="mt-4 size-40 rounded-[16px] object-cover" /> : <div className="mt-4 grid size-40 place-items-center rounded-[16px] bg-ochre font-display text-cream">OCHRE</div>}
      <div className="mt-4 grid gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-[12px] border border-border bg-cream px-3" />
        <input value={year} onChange={(e) => setYear(Number(e.target.value))} className="h-11 rounded-[12px] border border-border bg-cream px-3" />
        <input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Artwork URL" className="h-11 rounded-[12px] border border-border bg-cream px-3" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-11 rounded-[12px] border border-border bg-cream px-3">
          <option value="film_soundtrack">Film soundtrack</option>
          <option value="instrumental">Instrumental</option>
          <option value="bgm">BGM / score</option>
          <option value="compilation">Compilation</option>
        </select>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="min-h-24 rounded-[12px] border border-border bg-cream p-3" />
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => void adminSaveAlbum({
          data: { id, title, releaseYear: year, description: desc, coverUrl: cover, albumType: type, trackIds: tracks.map((t) => t.id) },
        }).then(() => setMsg("Saved"))}>Save</Button>
        <Button variant="outline" onClick={() => void adminArchiveAlbum({ data: { id } }).then(() => setMsg("Archived"))}>Archive</Button>
      </div>
      {msg ? <p className="mt-2 text-sm text-ochre-dark">{msg}</p> : null}
      <h2 className="mt-8 font-display text-xl">Track list</h2>
      <ol className="divide-y divide-border">
        {tracks.map((t, i) => (
          <li key={t.id} className="flex items-center gap-3 py-2">
            <span className="w-6 text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
            <Link to="/admin/songs/$id/edit" params={{ id: t.id }} className="flex-1 text-ochre-dark">{t.title}</Link>
            <button type="button" className="text-xs" onClick={() => {
              if (i === 0) return;
              const next = [...tracks];
              [next[i - 1], next[i]] = [next[i], next[i - 1]];
              setTracks(next);
            }}>up</button>
          </li>
        ))}
      </ol>
    </div>
  );
}
