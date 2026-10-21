import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import type { Album } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Coverflow({
  albums,
  onOpen,
}: {
  albums: Album[];
  onOpen?: (album: Album) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {albums.map((album, i) => (
          <Link
            key={album.id}
            to="/album/$albumId"
            params={{ albumId: album.id }}
            onClick={() => onOpen?.(album)}
            className="coverflow-card w-[46vw] max-w-[220px] min-w-[148px] shrink-0 snap-center md:w-[200px]"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <div className="poster-frame relative aspect-square overflow-hidden rounded-[18px] bg-paper-3">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="grid h-full place-items-center bg-ochre font-display text-2xl text-cream">
                  {album.title.slice(0, 1)}
                </span>
              )}
              <span className="absolute bottom-2 left-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cream">
                {album.releaseYear} · {album.trackCount} tracks
              </span>
            </div>
            <p className="mt-2 truncate font-display text-base leading-tight text-ink">
              {album.title}
            </p>
            <p className="truncate text-xs text-muted">
              {album.language} · {album.era}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AlbumGrid({ albums }: { albums: Album[] }) {
  if (!albums.length) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted">
        No records on this shelf. Try another filter.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 px-5 pb-6 sm:grid-cols-3 md:grid-cols-4">
      {albums.map((album) => (
        <Link
          key={album.id}
          to="/album/$albumId"
          params={{ albumId: album.id }}
          className="group"
        >
          <div className="poster-frame aspect-square overflow-hidden rounded-[16px] bg-paper-3">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-active:scale-[0.98] md:group-hover:scale-[1.03]"
              />
            ) : (
              <span className="grid h-full place-items-center bg-ochre font-display text-2xl text-cream">
                {album.title.slice(0, 1)}
              </span>
            )}
          </div>
          <p className="mt-2 truncate font-display text-sm text-ink">{album.title}</p>
          <p className={cn("truncate text-xs text-muted")}>
            {album.releaseYear} · {album.trackCount} songs
          </p>
        </Link>
      ))}
    </div>
  );
}
