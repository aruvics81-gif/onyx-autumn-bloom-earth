import { createFileRoute } from "@tanstack/react-router";
import { filterTracks } from "@/lib/catalog";

export const Route = createFileRoute("/api/v1/recommendations/mood")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const mood = new URL(request.url).searchParams.get("mood") || "romance";
        const { tracks, total } = filterTracks({ mood, limit: 24 });
        return Response.json({ mood, total, tracks });
      },
    },
  },
});
