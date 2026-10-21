import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlbumGrid } from "@/components/coverflow";
import { TrackList } from "@/components/track-list";
import { getMovieDetail } from "@/lib/server/catalog";
import type { Album, Movie, Track } from "@/lib/types";

export const Route = createFileRoute("/movie/$movieId")({ component: MoviePage });

function MoviePage() {
  const { movieId } = Route.useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    void getMovieDetail({ data: movieId }).then((r) => {
      setMovie(r?.movie ?? null);
      setAlbums(r?.albums ?? []);
      setTracks(r?.tracks ?? []);
    });
  }, [movieId]);

  if (!movie) return <div className="px-5 py-16 text-muted">Film not in the archive.</div>;

  return (
    <div className="pb-8 pt-5 fade-up">
      <div className="flex gap-4 px-5">
        <div className="poster-frame size-36 overflow-hidden rounded-[18px] bg-paper-3">
          {movie.posterUrl ? <img src={movie.posterUrl} alt="" className="h-full w-full object-cover" /> : (
            <div className="grid h-full place-items-center bg-ochre font-display text-cream">OCHRE</div>
          )}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-ochre-dark">{movie.language} · {movie.releaseYear}</p>
          <h1 className="font-display text-3xl text-ink">{movie.name}</h1>
          {movie.director ? <p className="text-sm text-muted">Director: {movie.director}</p> : null}
          <p className="mt-2 text-sm text-muted">{movie.description}</p>
        </div>
      </div>
      <AlbumGrid albums={albums} />
      <section className="px-5">
        <h2 className="font-display text-xl">Every associated track</h2>
        <TrackList tracks={tracks} />
      </section>
    </div>
  );
}
