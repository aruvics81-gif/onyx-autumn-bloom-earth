import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInGate } from "@/lib/auth/gates";
import { TrackList } from "@/components/track-list";
import { Button } from "@/components/ui/button";
import { getHistory, listFavorites } from "@/lib/server/analytics";
import { createPlaylist, listPlaylists } from "@/lib/server/library";
import type { Playlist, Track } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({ component: Library });

function Library() {
  const [tab, setTab] = useState<"favorites" | "playlists" | "history">("favorites");
  return (
    <div className="px-5 pb-8 pt-6 fade-up">
      <h1 className="font-display text-3xl italic text-ink">Library</h1>
      <p className="mt-1 text-sm text-muted">Favorites, playlists, and the hours you have already given.</p>
      <SignInGate fallback={<p className="mt-6 text-sm text-muted">Sign in to keep favorites and playlists across devices.</p>}>
        <div className="mt-4 flex gap-2">
          {(["favorites", "playlists", "history"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs capitalize",
                tab === t ? "border-ochre-dark bg-ochre text-cream" : "border-border bg-cream",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "favorites" ? <Favorites /> : tab === "playlists" ? <Playlists /> : <History />}
      </SignInGate>
    </div>
  );
}

function Favorites() {
  const [tracks, setTracks] = useState<Track[]>([]);
  useEffect(() => {
    void listFavorites().then(setTracks).catch(() => setTracks([]));
  }, []);
  return <TrackList tracks={tracks} />;
}

function History() {
  const [rows, setRows] = useState<Track[]>([]);
  useEffect(() => {
    void getHistory()
      .then((r) => setRows(r.map((x) => x.track)))
      .catch(() => setRows([]));
  }, []);
  return <TrackList tracks={rows} />;
}

function Playlists() {
  const [lists, setLists] = useState<Playlist[]>([]);
  const [title, setTitle] = useState("");
  async function refresh() {
    setLists(await listPlaylists());
  }
  useEffect(() => {
    void refresh().catch(() => undefined);
  }, []);
  return (
    <div className="mt-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void createPlaylist({ data: { title } }).then(() => {
            setTitle("");
            return refresh();
          });
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New playlist"
          className="h-11 flex-1 rounded-[12px] border border-border bg-cream px-3 text-sm"
        />
        <Button type="submit">Create</Button>
      </form>
      <ul className="mt-4 divide-y divide-border">
        {lists.map((p) => (
          <li key={p.id} className="py-3">
            <p className="font-medium text-ink">{p.title}</p>
            <p className="text-xs text-muted">{p.trackCount ?? 0} tracks</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
