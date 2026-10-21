import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TrackList } from "@/components/track-list";
import { VinylDisc } from "@/components/vinyl-disc";
import { Button } from "@/components/ui/button";
import { getAlbumWithTracks } from "@/lib/server/catalog";
import { MOOD_BY_ID, type MoodDef } from "@/lib/moods";
import { usePlayer } from "@/lib/player-store";
import type { Album, Track } from "@/lib/types";

export const Route = createFileRoute("/album/$albumId")({ component: AlbumPage });

function AlbumPage() {
  const { albumId } = Route.useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [missing, setMissing] = useState(false);
  const playAlbum = usePlayer((s) => s.playAlbum);
  const current = usePlayer((s) => s.current);
  const isPlaying = usePlayer((s) => s.isPlaying);

  useEffect(() => {
    void getAlbumWithTracks({ data: albumId }).then((pack) => {
      if (!pack) {
        setMissing(true);
        return;
      }
      setAlbum(pack.album);
      setTracks(pack.tracks);
    });
  }, [albumId]);

  if (missing) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="font-display text-2xl">This pressing is missing.</p>
        <Link to="/discover" className="mt-3 inline-block text-ochre-dark">Back to discover</Link>
      </div>
    );
  }
  if (!album) return <div className="m-5 h-64 ochre-skeleton rounded-[22px]" />;

  return (
    <div className="px-5 pb-8 pt-5 fade-up">
      <div className="flex gap-4">
        <div className="poster-frame size-36 shrink-0 overflow-hidden rounded-[18px] bg-paper-3 sm:size-44">
          {album.coverUrl ? (
            <img src={album.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center bg-ochre font-display text-cream">OCHRE</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ochre-dark">
            {album.language} · {album.releaseYear} · {album.albumType.replace("_", " ")}
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight text-ink">{album.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{album.description}</p>
          <p className="mt-2 text-sm font-medium text-ink">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"} in the database
          </p>
          {album.movieId ? (
            <Link to="/movie/$movieId" params={{ movieId: album.movieId }} className="mt-1 inline-block text-sm text-ochre-dark">
              Open film
            </Link>
          ) : null}
        </div>
        <div className="hidden shrink-0 sm:block">
          <VinylDisc
            artUrl={album.coverUrl}
            spinning={Boolean(current && current.albumId === album.id && isPlaying)}
            sizeClass="!h-28 !w-28"
            onClick={() => void playAlbum(album.id)}
          />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <Button onClick={() => void playAlbum(album.id)}>
          <Play className="size-4 fill-current" /> Play album
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            const url = `${window.location.origin}/album/${album.id}`;
            if (navigator.share) void navigator.share({ title: album.title, url });
            else void navigator.clipboard.writeText(url);
          }}
        >
          <Share2 className="size-4" /> Share
        </Button>
      </div>
      <h2 className="mt-8 font-display text-xl text-ink">Complete track list</h2>
      <TrackList tracks={tracks} showAlbum={false} />
    </div>
  );
}
