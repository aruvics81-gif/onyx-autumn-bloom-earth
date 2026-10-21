import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { adminArchiveSong, adminDeleteSong, adminGetSong, adminSaveSong } from "@/lib/server/admin";
import { adminListEntities } from "@/lib/server/admin";
import { LANGUAGES } from "@/lib/moods";
import type { Album, Track } from "@/lib/types";

export const Route = createFileRoute("/admin/songs/$id/edit")({ component: Page });

function Page() {
  return (
    <AdminGuard>
      <Editor />
    </AdminGuard>
  );
}

function Editor() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const isNew = id === "new";
  const [track, setTrack] = useState<Partial<Track>>({
    title: "",
    movieName: "",
    language: "Tamil",
    releaseYear: 1980,
    composer: "Ilaiyaraaja",
    trackNumber: 1,
    status: "active",
    sourceType: "PREVIEW",
  });
  const [singerNames, setSingerNames] = useState("");
  const [lyricistNames, setLyricistNames] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void adminListEntities({ data: { kind: "albums" } }).then((r) => setAlbums(r.albums ?? []));
    if (isNew) return;
    void adminGetSong({ data: id }).then((r) => {
      if (!r) return;
      setTrack(r.track);
      setSingerNames(r.track.singers.map((s) => s.name).join(", "));
      setLyricistNames(r.track.lyricists.map((l) => l.name).join(", "));
    });
  }, [id, isNew]);

  function set<K extends keyof Track>(key: K, value: Track[K]) {
    setTrack((t) => ({ ...t, [key]: value }));
  }

  async function save() {
    const res = await adminSaveSong({
      data: {
        id: isNew ? undefined : id,
        title: track.title,
        movieName: track.movieName,
        albumId: track.albumId,
        releaseYear: Number(track.releaseYear),
        language: String(track.language),
        singerNames,
        lyricistNames,
        composer: track.composer,
        genre: track.genre || undefined,
        moods: track.moods,
        description: track.description || undefined,
        trackNumber: Number(track.trackNumber || 1),
        artworkUrl: track.albumArtUrl,
        audioUrl: track.audioUrl,
        sourceType: track.sourceType,
        credits: track.credits || undefined,
        status: track.status,
        catalogDuration: Number(track.catalogDuration || 0),
      },
    });
    setMsg("Saved. The listener app will use this value immediately.");
    if (isNew) void nav({ to: "/admin/songs/$id/edit", params: { id: res.id } });
  }

  return (
    <div className="max-w-3xl">
      <p className="text-xs text-muted"><Link to="/admin/songs">Songs</Link> / edit</p>
      <h1 className="font-display text-3xl italic">{isNew ? "Create song" : "Edit song"}</h1>
      <p className="text-sm text-muted">Corrections persist in the database and appear in the museum without a rebuild.</p>
      <div className="mt-6 grid gap-3">
        <Field label="Song name" value={track.title || ""} onChange={(v) => set("title", v)} />
        <Field label="Movie name" value={track.movieName || ""} onChange={(v) => set("movieName", v)} />
        <label className="block text-sm">
          <span className="text-xs text-muted">Album</span>
          <select
            value={track.albumId || ""}
            onChange={(e) => set("albumId", e.target.value)}
            className="mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3"
          >
            <option value="">—</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Release year" value={String(track.releaseYear || "")} onChange={(v) => set("releaseYear", Number(v))} />
          <label className="block text-sm">
            <span className="text-xs text-muted">Language</span>
            <select value={String(track.language)} onChange={(e) => set("language", e.target.value)} className="mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3">
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <Field label="Track number" value={String(track.trackNumber || 1)} onChange={(v) => set("trackNumber", Number(v))} />
        </div>
        <Field label="Singer names (comma separated)" value={singerNames} onChange={setSingerNames} />
        <Field label="Lyricist" value={lyricistNames} onChange={setLyricistNames} />
        <Field label="Composer" value={track.composer || "Ilaiyaraaja"} onChange={(v) => set("composer", v)} />
        <Field label="Genre" value={track.genre || ""} onChange={(v) => set("genre", v)} />
        <Field label="Moods (comma)" value={(track.moods || []).join(", ")} onChange={(v) => set("moods", v.split(",").map((s) => s.trim()).filter(Boolean))} />
        <label className="block text-sm">
          <span className="text-xs text-muted">Description</span>
          <textarea value={track.description || ""} onChange={(e) => set("description", e.target.value)} className="mt-1 min-h-24 w-full rounded-[12px] border border-border bg-cream p-3" />
        </label>
        <Field label="Credits" value={track.credits || ""} onChange={(v) => set("credits", v)} />
        <Field label="Artwork URL" value={track.albumArtUrl || ""} onChange={(v) => set("albumArtUrl", v)} />
        {track.albumArtUrl ? <img src={track.albumArtUrl} alt="" className="size-32 rounded-[14px] object-cover" /> : (
          <div className="grid size-32 place-items-center rounded-[14px] bg-ochre font-display text-cream">OCHRE</div>
        )}
        <Field label="Audio source URL (authorized only)" value={track.audioUrl || ""} onChange={(v) => set("audioUrl", v)} />
        <label className="block text-sm">
          <span className="text-xs text-muted">Source type</span>
          <select value={track.sourceType || "PREVIEW"} onChange={(e) => set("sourceType", e.target.value as Track["sourceType"])} className="mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3">
            <option>FULL_TRACK</option>
            <option>PREVIEW</option>
            <option>EXTERNAL_ONLY</option>
            <option>UNAVAILABLE</option>
          </select>
        </label>
        <Field label="Catalog duration (seconds)" value={String(track.catalogDuration || 0)} onChange={(v) => set("catalogDuration", Number(v))} />
        <label className="block text-sm">
          <span className="text-xs text-muted">Status</span>
          <select value={track.status || "active"} onChange={(e) => set("status", e.target.value)} className="mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3">
            <option>active</option>
            <option>metadata_only</option>
            <option>archived</option>
          </select>
        </label>
      </div>
      {msg ? <p className="mt-3 text-sm text-ochre-dark">{msg}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save()}>Save</Button>
        {!isNew ? (
          <>
            <Button variant="outline" type="button" onClick={() => void adminArchiveSong({ data: { id } }).then(() => setMsg("Archived"))}>Archive</Button>
            <Button variant="ghost" type="button" onClick={() => {
              if (confirm("Delete this song permanently?")) void adminDeleteSong({ data: id }).then(() => nav({ to: "/admin/songs" }));
            }}>Delete</Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3" />
    </label>
  );
}
