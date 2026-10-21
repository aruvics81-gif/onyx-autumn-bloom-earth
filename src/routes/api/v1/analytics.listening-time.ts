import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { getSessionUser, UnauthorizedError } from "@/lib/auth/verify.server";

export const Route = createFileRoute("/api/v1/analytics/listening-time")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const user = await getSessionUser();
        if (!user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        let body: { trackId?: string; seconds?: number; completed?: boolean };
        try {
          body = (await request.json()) as {
            trackId?: string;
            seconds?: number;
            completed?: boolean;
          };
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const trackId = String(body.trackId ?? "");
        const seconds = Math.max(0, Math.min(3600, Math.floor(Number(body.seconds) || 0)));
        const extraPlays = body.completed ? 1 : 0;
        if (!trackId) {
          return Response.json({ error: "trackId required" }, { status: 400 });
        }
        try {
          const sql = await getSql();
          await sql.query(
            `insert into user_listening_analytics (user_id, track_id, total_seconds_listened, completed_plays, last_listened_at)
             values ($1, $2, $3, $4, now())
             on conflict (user_id, track_id) do update set
               total_seconds_listened = user_listening_analytics.total_seconds_listened + excluded.total_seconds_listened,
               completed_plays = user_listening_analytics.completed_plays + excluded.completed_plays,
               last_listened_at = now()`,
            [user.id, trackId, seconds, extraPlays],
          );
        } catch (err) {
          const message = err instanceof UnauthorizedError ? "Unauthorized" : "Could not record";
          return Response.json({ error: message }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
