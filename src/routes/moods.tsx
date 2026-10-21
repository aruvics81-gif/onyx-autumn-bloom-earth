import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/moods")({
  validateSearch: (s: Record<string, unknown>) => ({ mood: typeof s.mood === "string" ? s.mood : undefined }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/discover", search: { tab: "mood", mood: search.mood } });
  },
});
