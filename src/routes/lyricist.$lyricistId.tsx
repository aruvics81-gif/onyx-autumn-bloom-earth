import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OchrePortrait } from "@/components/ochre-portrait";
import { TrackList } from "@/components/track-list";
import { getLyricistDetail } from "@/lib/server/catalog";
import type { Lyricist, Track } from "@/lib/types";

export const Route = createFileRoute("/lyricist/$lyricistId")({ component: LyricistPage });

function LyricistPage() {
  const { lyricistId } = Route.useParams();
  const [lyricist, setLyricist] = useState<Lyricist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    void getLyricistDetail({ data: lyricistId }).then((r) => {
      setLyricist(r?.lyricist ?? null);
      setTracks(r?.tracks ?? []);
    });
  }, [lyricistId]);

  if (!lyricist) return <div className="px-5 py-16 text-muted">Lyricist not in the archive.</div>;

  return (
    <div className="px-5 pb-8 pt-6 fade-up">
      <div className="flex gap-4">
        <OchrePortrait name={lyricist.name} src={lyricist.photoUrl} className="size-28 rounded-full" />
        <div>
          <h1 className="font-display text-3xl text-ink">{lyricist.name}</h1>
          <p className="mt-2 max-w-lg text-sm text-muted">{lyricist.biography || "Biography pending verification."}</p>
          {lyricist.knownWorks ? <p className="mt-2 text-sm">{lyricist.knownWorks}</p> : null}
        </div>
      </div>
      <h2 className="mt-8 font-display text-xl">Associated songs</h2>
      <TrackList tracks={tracks} />
    </div>
  );
}
