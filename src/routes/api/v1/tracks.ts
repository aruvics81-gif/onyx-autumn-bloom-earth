import { createFileRoute } from "@tanstack/react-router";
import { filterTracks, getAlbum, tracksForAlbum } from "@/lib/catalog";

export const Route = createFileRoute("/api/v1/tracks")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const albumId = url.searchParams.get("albumId") ?? undefined;
        if (albumId) {
          const album = getAlbum(albumId);
          if (!album) {
            return Response.json({ error: "Album not found" }, { status: 404 });
          }
          return Response.json({
            album,
            tracks: tracksForAlbum(albumId),
            total: tracksForAlbum(albumId).length,
          });
        }
        const result = filterTracks({
          q: url.searchParams.get("q") ?? undefined,
          language: url.searchParams.get("language") ?? undefined,
          era: url.searchParams.get("era") ?? undefined,
          category: url.searchParams.get("category") ?? undefined,
          mood: url.searchParams.get("mood") ?? undefined,
          page: Number(url.searchParams.get("page") ?? 1),
          limit: Number(url.searchParams.get("limit") ?? 40),
        });
        return Response.json(result);
      },
    },
  },
});
