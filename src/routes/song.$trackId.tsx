import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { OchrePortrait } from "@/components/ochre-portrait";
import { TrackList } from "@/components/track-list";
import { Button } from "@/components/ui/button";
import { previewLabel } from "@/lib/normalize";
import { getTrackDetail, relatedTracks } from "@/lib/server/catalog";
import { usePlayer } from "@/lib/player-store";
import { formatTime } from "@/lib/utils";
import type { Album, Track } from "@/lib/types";

export const Route = createFileRoute("/song/$trackId")({ component: SongPage });

function SongPage() {
  const { trackId } = Route.useParams();
  const [track, setTrack] = useState<Track | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [related, setRelated] = useState<Track[]>([]);
  const [openCredits, setOpenCredits] = useState(false);
  const playTrack = usePlayer((s) => s.playTrack);

  useEffect(() => {
    void getTrackDetail({ data: trackId }).then((r) => {
      setTrack(r?.track ?? null);
      setAlbum(r?.album ?? null);
    });
    void relatedTracks({ data: { trackId } }).then(setRelated);
  }, [trackId]);

  if (!track) {
    return <div className="px-5 py-16 text-center text-muted">This song is not in the archive.</div>;
  }
  const label = previewLabel(track.sourceType);

  return (
    <div className="px-5 pb-10 pt-5 fade-up">
      <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
        <div className="poster-frame aspect-square overflow-hidden rounded-[22px] bg-paper-3">
          {track.albumArtUrl ? (
            <img src={track.albumArtUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center bg-ochre font-display text-4xl text-cream">OCHRE</div>
          )}
        </div>
        <div>
          {label ? <p className="preview-pill">{label}</p> : null}
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{track.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {album ? (
              <Link to="/album/$albumId" params={{ albumId: album.id }} className="text-ochre-dark">
                {album.title}
              </Link>
            ) : track.movieName}{" "}
            · {track.releaseYear} · {track.language}
          </p>
          <dl className="mt-4 grid gap-2 text-sm">
            <Row label="Singer(s)">
              {track.singers.length
                ? track.singers.map((s, i) => (
                    <span key={s.id}>
                      {i ? ", " : ""}
                      <Link to="/singer/$singerId" params={{ singerId: s.id }} className="text-ochre-dark">
                        {s.name}
                      </Link>
                    </span>
                  ))
                : track.artist}
            </Row>
            <Row label="Music">Ilaiyaraaja</Row>
            <Row label="Lyrics">
              {track.lyricists.length
                ? track.lyricists.map((l, i) => (
                    <span key={l.id}>
                      {i ? ", " : ""}
                      <Link to="/lyricist/$lyricistId" params={{ lyricistId: l.id }} className="text-ochre-dark">
                        {l.name}
                      </Link>
                    </span>
                  ))
                : "—"}
            </Row>
            <Row label="Duration">{track.catalogDuration ? formatTime(track.catalogDuration) : "—"}</Row>
            <Row label="Genre">{track.genre || "—"}</Row>
            <Row label="Mood">{track.moods.join(", ") || "—"}</Row>
            {track.trackNumber ? <Row label="Track">{String(track.trackNumber).padStart(2, "0")}</Row> : null}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" onClick={() => playTrack(track)}>
              <Play className="size-4 fill-current" /> Play
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const url = `${window.location.origin}/song/${track.id}`;
                if (navigator.share) void navigator.share({ title: track.title, url });
                else void navigator.clipboard.writeText(url);
              }}
            >
              <Share2 className="size-4" /> Share
            </Button>
          </div>
          {track.description ? <p className="mt-4 text-sm leading-relaxed text-muted">{track.description}</p> : null}
          <button type="button" className="mt-4 text-sm text-ochre-dark" onClick={() => setOpenCredits((v) => !v)}>
            {openCredits ? "Hide credits" : "More credits"}
          </button>
          {openCredits ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{track.credits || "Credits pending verification."}</p>
          ) : null}
        </div>
      </div>
      {track.singers.length ? (
        <section className="mt-8">
          <h2 className="font-display text-xl">Singers</h2>
          <div className="mt-3 flex gap-4">
            {track.singers.map((s) => (
              <Link key={s.id} to="/singer/$singerId" params={{ singerId: s.id }} className="w-24 text-center">
                <OchrePortrait name={s.name} src={s.photoUrl} className="mx-auto size-20 rounded-full" />
                <p className="mt-2 truncate text-xs">{s.name}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mt-8">
        <h2 className="font-display text-xl">More like this</h2>
        <p className="text-xs text-muted">Matched by mood, language, film, and decade — not an AI model.</p>
        <TrackList tracks={related} />
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
