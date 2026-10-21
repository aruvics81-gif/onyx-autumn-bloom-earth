import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { TRACK_FROM, TRACK_SELECT, mapTrack, type TrackRow } from "./map";

export const logListeningTime = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { trackId: string; seconds: number; completed?: boolean }) => ({
    trackId: String(input.trackId),
    seconds: Math.max(0, Math.min(3600, Math.floor(Number(input.seconds) || 0))),
    completed: Boolean(input.completed),
  }))
  .handler(async ({ context, data }) => {
    if (data.seconds <= 0 && !data.completed) return { ok: true };
    const sql = await getSql();
    const extraPlays = data.completed ? 1 : 0;
    await sql.query(
      `insert into user_listening_analytics (user_id, track_id, total_seconds_listened, completed_plays, last_listened_at)
       values ($1, $2, $3, $4, now())
       on conflict (user_id, track_id) do update set
         total_seconds_listened = user_listening_analytics.total_seconds_listened + excluded.total_seconds_listened,
         completed_plays = user_listening_analytics.completed_plays + excluded.completed_plays,
         last_listened_at = now()`,
      [context.userId, data.trackId, data.seconds, extraPlays],
    );
    if (data.seconds > 0 || data.completed) {
      await sql.query(
        `insert into listening_history (user_id, track_id, listened_seconds, completed, played_at)
         values ($1,$2,$3,$4,now())`,
        [context.userId, data.trackId, data.seconds, data.completed],
      );
    }
    await sql.query(
      `insert into user_profiles (user_id, last_active_at) values ($1, now())
       on conflict (user_id) do update set last_active_at = now()`,
      [context.userId],
    );
    return { ok: true };
  });

export const getListeningStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      track_id: string;
      total_seconds_listened: number;
      completed_plays: number;
      last_listened_at: string;
    }>`
      select track_id, total_seconds_listened, completed_plays, last_listened_at
      from user_listening_analytics
      where user_id = ${context.userId}
      order by last_listened_at desc
      limit 200
    `;
    const totals = await sql<{ seconds: number; plays: number; tracks: number }>`
      select coalesce(sum(total_seconds_listened),0)::int as seconds,
             coalesce(sum(completed_plays),0)::int as plays,
             count(*)::int as tracks
      from user_listening_analytics
      where user_id = ${context.userId}
    `;
    const favSong = await sql.query<{ title: string; movie_name: string; seconds: number }>(
      `select t.title, t.movie_name, a.total_seconds_listened as seconds
       from user_listening_analytics a join tracks t on t.id = a.track_id
       where a.user_id = $1
       order by a.total_seconds_listened desc limit 1`,
      [context.userId],
    );
    const favSinger = await sql.query<{ name: string; seconds: number }>(
      `select s.name, sum(a.total_seconds_listened)::int as seconds
       from user_listening_analytics a
       join track_singers ts on ts.track_id = a.track_id
       join singers s on s.id = ts.singer_id
       where a.user_id = $1
       group by s.name order by seconds desc limit 1`,
      [context.userId],
    );
    const favMovie = await sql.query<{ movie_name: string; seconds: number }>(
      `select t.movie_name, sum(a.total_seconds_listened)::int as seconds
       from user_listening_analytics a join tracks t on t.id = a.track_id
       where a.user_id = $1
       group by t.movie_name order by seconds desc limit 1`,
      [context.userId],
    );
    const favDecade = await sql.query<{ era: string; seconds: number }>(
      `select alb.era, sum(a.total_seconds_listened)::int as seconds
       from user_listening_analytics a
       join tracks t on t.id = a.track_id
       join albums alb on alb.id = t.album_id
       where a.user_id = $1
       group by alb.era order by seconds desc limit 1`,
      [context.userId],
    );
    const favMood = await sql.query<{ mood: string; seconds: number }>(
      `select unnest(t.mood_tags) as mood, sum(a.total_seconds_listened)::int as seconds
       from user_listening_analytics a join tracks t on t.id = a.track_id
       where a.user_id = $1
       group by 1 order by seconds desc limit 1`,
      [context.userId],
    );
    const historyIds = await sql.query<{ track_id: string }>(
      `select distinct on (track_id) track_id from listening_history
       where user_id = $1 order by track_id, played_at desc`,
      [context.userId],
    );
    const continueRows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       where t.id in (select track_id from listening_history where user_id = $1 order by played_at desc limit 1)`,
      [context.userId],
    );
    return {
      rows: rows.map((r) => ({
        trackId: r.track_id,
        totalSecondsListened: r.total_seconds_listened,
        completedPlays: r.completed_plays,
        lastListenedAt: r.last_listened_at,
      })),
      totals: totals[0] ?? { seconds: 0, plays: 0, tracks: 0 },
      favorites: {
        song: favSong[0] ?? null,
        singer: favSinger[0] ?? null,
        movie: favMovie[0] ?? null,
        decade: favDecade[0] ?? null,
        mood: favMood[0] ?? null,
      },
      continueTrack: continueRows[0] ? mapTrack(continueRows[0]) : null,
      historyCount: historyIds.length,
    };
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((trackId: string) => String(trackId))
  .handler(async ({ context, data: trackId }) => {
    const sql = await getSql();
    const existing = await sql<{ track_id: string }>`
      select track_id from user_favorites
      where user_id = ${context.userId} and track_id = ${trackId}
    `;
    if (existing.length) {
      await sql`delete from user_favorites where user_id = ${context.userId} and track_id = ${trackId}`;
      return { favorited: false };
    }
    await sql`insert into user_favorites (user_id, track_id) values (${context.userId}, ${trackId})`;
    return { favorited: true };
  });

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       join user_favorites f on f.track_id = t.id
       where f.user_id = $1
       order by f.created_at desc`,
      [context.userId],
    );
    return rows.map((r) => mapTrack(r));
  });

export const getHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<TrackRow & { played_at: string; listened_seconds: number }>(
      `select distinct on (h.track_id) ${TRACK_SELECT}, h.played_at, h.listened_seconds
       ${TRACK_FROM}
       join listening_history h on h.track_id = t.id
       where h.user_id = $1
       order by h.track_id, h.played_at desc`,
      [context.userId],
    );
    const sorted = [...rows].sort((a, b) => String(b.played_at).localeCompare(String(a.played_at)));
    return sorted.slice(0, 40).map((r) => ({ track: mapTrack(r), playedAt: r.played_at, seconds: r.listened_seconds }));
  });
