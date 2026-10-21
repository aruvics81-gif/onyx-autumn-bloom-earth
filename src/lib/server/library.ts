import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { TRACK_FROM, TRACK_SELECT, mapTrack, type TrackRow } from "./map";
import type { Playlist } from "@/lib/types";

function pid() {
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const listPlaylists = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Playlist[]> => {
    const sql = await getSql();
    const rows = await sql`
      select id, user_id, title, description, is_public, created_at,
        (select count(*)::int from playlist_tracks t where t.playlist_id = playlists.id) as track_count
      from playlists where user_id = ${context.userId}
      order by updated_at desc
    `;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      isPublic: r.is_public,
      trackCount: r.track_count,
      createdAt: r.created_at,
    }));
  });

export const createPlaylist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; description?: string }) => ({
    title: String(input.title).trim().slice(0, 80) || "Untitled",
    description: input.description?.trim().slice(0, 240),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = pid();
    await sql.query(
      `insert into playlists (id, user_id, title, description) values ($1,$2,$3,$4)`,
      [id, context.userId, data.title, data.description || null],
    );
    return { id };
  });

export const getPlaylist = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => String(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const pl = await sql.query(
      `select * from playlists where id = $1 and user_id = $2`,
      [id, context.userId],
    );
    if (!pl[0]) return null;
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       join playlist_tracks pt on pt.track_id = t.id
       where pt.playlist_id = $1
       order by pt.position`,
      [id],
    );
    return {
      playlist: {
        id: pl[0].id,
        userId: pl[0].user_id,
        title: pl[0].title,
        description: pl[0].description,
        isPublic: pl[0].is_public,
        createdAt: pl[0].created_at,
      } as Playlist,
      tracks: rows.map(mapTrack),
    };
  });

export const addToPlaylist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { playlistId: string; trackId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const owned = await sql.query(
      `select id from playlists where id = $1 and user_id = $2`,
      [data.playlistId, context.userId],
    );
    if (!owned[0]) throw new Error("Playlist not found");
    const pos = await sql.query<{ n: number }>(
      `select coalesce(max(position),0)::int + 1 as n from playlist_tracks where playlist_id = $1`,
      [data.playlistId],
    );
    await sql.query(
      `insert into playlist_tracks (playlist_id, track_id, position) values ($1,$2,$3)
       on conflict do nothing`,
      [data.playlistId, data.trackId, pos[0]?.n ?? 1],
    );
    await sql.query(`update playlists set updated_at=now() where id=$1`, [data.playlistId]);
    return { ok: true };
  });

export const removeFromPlaylist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { playlistId: string; trackId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(
      `delete from playlist_tracks using playlists
       where playlist_tracks.playlist_id = playlists.id
         and playlists.user_id = $1
         and playlist_tracks.playlist_id = $2
         and playlist_tracks.track_id = $3`,
      [context.userId, data.playlistId, data.trackId],
    );
    return { ok: true };
  });

export const deletePlaylist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => String(id))
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql.query(`delete from playlists where id = $1 and user_id = $2`, [id, context.userId]);
    return { ok: true };
  });
