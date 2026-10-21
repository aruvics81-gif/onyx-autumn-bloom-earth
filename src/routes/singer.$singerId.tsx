import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OchrePortrait } from "@/components/ochre-portrait";
import { TrackList } from "@/components/track-list";
import { getSingerDetail } from "@/lib/server/catalog";
import type { Singer, Track } from "@/lib/types";

export const Route = createFileRoute("/singer/$singerId")({ component: SingerPage });

function SingerPage() {
  const { singerId } = Route.useParams();
  const [singer, setSinger] = useState<Singer | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    void getSingerDetail({ data: singerId }).then((r) => {
      setSinger(r?.singer ?? null);
      setTracks(r?.tracks ?? []);
    });
  }, [singerId]);

  if (!singer) return <div className="px-5 py-16 text-muted">Singer not in the archive.</div>;

  return (
    <div className="px-5 pb-8 pt-6 fade-up">
      <div className="flex gap-4">
        <OchrePortrait name={singer.name} src={singer.photoUrl} className="size-28 rounded-full" />
        <div>
          <h1 className="font-display text-3xl text-ink">{singer.name}</h1>
          <p className="text-sm text-muted">{singer.languages.join(" · ")}</p>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
            {singer.biography || "Biography pending verification."}
          </p>
        </div>
      </div>
      <h2 className="mt-8 font-display text-xl">Songs</h2>
      <TrackList tracks={tracks} />
    </div>
  );
}
