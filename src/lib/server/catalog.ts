import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import type { Album, CreditPerson, Track } from "@/lib/types";
import { TRACK_FROM, TRACK_SELECT, mapAlbum, mapLyricist, mapMovie, mapSinger, mapTrack, type AlbumRow, type TrackRow } from "./map";
import { ensureCatalogSeeded } from "./seed";

async function attachCredits(sql: Awaited<ReturnType<typeof getSql>>, tracks: Track[]): Promise<Track[]> {
  if (!tracks.length) return tracks;
  const ids = tracks.map((t) => t.id);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  const singers = await sql.query<{ track_id: string; id: string; name: string; photo_url: string | null }>(
    `select ts.track_id, s.id, s.name, s.photo_url
     from track_singers ts join singers s on s.id = ts.singer_id
     where ts.track_id in (${placeholders})
     order by ts.position`,
    ids,
  );
  const lyricists = await sql.query<{ track_id: string; id: string; name: string; photo_url: string | null }>(
    `select tl.track_id, l.id, l.name, l.photo_url
     from track_lyricists tl join lyricists l on l.id = tl.lyricist_id
     where tl.track_id in (${placeholders})
     order by tl.position`,
    ids,
  );
  const sMap = new Map<string, CreditPerson[]>();
  for (const r of singers) {
    const list = sMap.get(r.track_id) ?? [];
    list.push({ id: r.id, name: r.name, photoUrl: r.photo_url });
    sMap.set(r.track_id, list);
  }
  const lMap = new Map<string, CreditPerson[]>();
  for (const r of lyricists) {
    const list = lMap.get(r.track_id) ?? [];
    list.push({ id: r.id, name: r.name, photoUrl: r.photo_url });
    lMap.set(r.track_id, list);
  }
  return tracks.map((t) => ({
    ...t,
    singers: sMap.get(t.id) ?? t.singers,
    lyricists: lMap.get(t.id) ?? t.lyricists,
  }));
}

export const seedCatalog = createServerFn({ method: "POST" }).handler(async () => {
  await ensureCatalogSeeded();
  const sql = await getSql();
  const albums = await sql<{ c: number }>`select count(*)::int as c from albums`;
  const tracks = await sql<{ c: number }>`select count(*)::int as c from tracks`;
  return { albums: albums[0]?.c ?? 0, tracks: tracks[0]?.c ?? 0 };
});

type TrackQuery = {
  q?: string;
  language?: string;
  era?: string;
  category?: string;
  mood?: string;
  albumId?: string;
  movieId?: string;
  singerId?: string;
  lyricistId?: string;
  genre?: string;
  year?: number;
  status?: string;
  page?: number;
  limit?: number;
};

function like(q: string) {
  return `%${q.toLowerCase().replace(/[%_]/g, "")}%`;
}

export const listTracks = createServerFn({ method: "GET" })
  .validator((input: TrackQuery) => input ?? {})
  .handler(async ({ data }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const opts = data ?? {};
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(80, Math.max(1, opts.limit ?? 40));
    const offset = (page - 1) * limit;
    const clauses: string[] = [`t.status <> 'archived'`];
    const params: unknown[] = [];
    const add = (sqlPart: string, ...values: unknown[]) => {
      let part = sqlPart;
      for (const value of values) {
        params.push(value);
        part = part.replace("?", `$${params.length}`);
      }
      clauses.push(part);
    };
    if (opts.albumId) add(`t.album_id = ?`, opts.albumId);
    if (opts.movieId) add(`(t.movie_id = ? or a.movie_id = ?)`, opts.movieId, opts.movieId);
    if (opts.language) add(`t.language = ?`, opts.language);
    if (opts.category) add(`t.category = ?`, opts.category);
    if (opts.genre) add(`t.genre = ?`, opts.genre);
    if (opts.year) add(`t.release_year = ?`, opts.year);
    if (opts.status) add(`t.status = ?`, opts.status);
    if (opts.mood) add(`? = any(t.mood_tags)`, opts.mood);
    if (opts.era) add(`a.era = ?`, opts.era);
    if (opts.q) add(`t.search_text like ?`, like(opts.q));
    if (opts.singerId) add(`exists (select 1 from track_singers ts where ts.track_id = t.id and ts.singer_id = ?)`, opts.singerId);
    if (opts.lyricistId) add(`exists (select 1 from track_lyricists tl where tl.track_id = t.id and tl.lyricist_id = ?)`, opts.lyricistId);

    const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
    const countRows = await sql.query<{ c: number }>(
      `select count(*)::int as c ${TRACK_FROM} ${where}`,
      params,
    );
    params.push(limit, offset);
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM} ${where}
       order by t.release_year desc, a.title, t.track_number
       limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    const tracks = await attachCredits(
      sql,
      rows.map((r) => mapTrack(r)),
    );
    return { tracks, total: countRows[0]?.c ?? 0, page, limit };
  });

export const getAlbumWithTracks = createServerFn({ method: "GET" })
  .validator((albumId: string) => String(albumId))
  .handler(async ({ data: albumId }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const albums = await sql.query<AlbumRow>(`select * from albums where id = $1`, [albumId]);
    if (!albums[0] || albums[0].status === "archived") return null;
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       where t.album_id = $1 and t.status <> 'archived'
       order by t.track_number, t.title`,
      [albumId],
    );
    const tracks = await attachCredits(
      sql,
      rows.map((r) => mapTrack(r)),
    );
    return { album: mapAlbum(albums[0]), tracks };
  });

export const getTrackDetail = createServerFn({ method: "GET" })
  .validator((trackId: string) => String(trackId))
  .handler(async ({ data: trackId }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM} where t.id = $1 limit 1`,
      [trackId],
    );
    if (!rows[0]) return null;
    const [track] = await attachCredits(sql, [mapTrack(rows[0])]);
    const albumRows = await sql.query<AlbumRow>(`select * from albums where id = $1`, [track.albumId]);
    return { track, album: albumRows[0] ? mapAlbum(albumRows[0]) : null };
  });

export const listAlbums = createServerFn({ method: "GET" })
  .validator((input: { q?: string; language?: string; era?: string; mood?: string; category?: string; featured?: boolean; limit?: number }) => input ?? {})
  .handler(async ({ data }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const opts = data ?? {};
    const clauses = [`status <> 'archived'`];
    const params: unknown[] = [];
    const add = (part: string, v: unknown) => {
      params.push(v);
      clauses.push(part.replace("?", `$${params.length}`));
    };
    if (opts.language) add(`language = ?`, opts.language);
    if (opts.era) add(`era = ?`, opts.era);
    if (opts.category) add(`category = ?`, opts.category);
    if (opts.mood) add(`? = any(moods)`, opts.mood);
    if (opts.featured) clauses.push(`featured = true`);
    if (opts.q) add(`search_text like ?`, like(opts.q));
    const limit = Math.min(200, opts.limit ?? 80);
    params.push(limit);
    const rows = await sql.query<AlbumRow>(
      `select * from albums where ${clauses.join(" and ")}
       order by featured desc, release_year desc, title
       limit $${params.length}`,
      params,
    );
    return rows.map(mapAlbum);
  });

export const homeShelf = createServerFn({ method: "GET" }).handler(async () => {
  await ensureCatalogSeeded();
  const sql = await getSql();
  const featured = (await sql.query<AlbumRow>(
    `select * from albums where featured = true and status <> 'archived' order by release_year, title`,
  )).map(mapAlbum);
  const instrumental = (await sql.query<AlbumRow>(
    `select * from albums where album_type = 'instrumental' and status <> 'archived' order by release_year`,
  )).map(mapAlbum);
  const recent = (await sql.query<AlbumRow>(
    `select * from albums where status <> 'archived' order by release_year desc, title limit 12`,
  )).map(mapAlbum);
  return { featured, instrumental, recent };
});

export const searchAll = createServerFn({ method: "GET" })
  .validator((q: string) => String(q ?? ""))
  .handler(async ({ data: q }) => {
    await ensureCatalogSeeded();
    const query = q.trim();
    if (!query) return { albums: [] as Album[], tracks: [] as Track[], singers: [], movies: [], lyricists: [] };
    const sql = await getSql();
    const p = like(query);
    const albums = (await sql.query<AlbumRow>(
      `select * from albums where status <> 'archived' and search_text like $1 order by release_year desc limit 20`,
      [p],
    )).map(mapAlbum);
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       where t.status <> 'archived' and t.search_text like $1
       order by t.release_year desc limit 30`,
      [p],
    );
    const tracks = await attachCredits(sql, rows.map(mapTrack));
    const singers = (await sql.query(
      `select s.*, (select count(*)::int from track_singers ts where ts.singer_id = s.id) as song_count
       from singers s where s.status <> 'archived' and s.search_text like $1 limit 12`,
      [p],
    )).map(mapSinger);
    const lyricists = (await sql.query(
      `select l.*, (select count(*)::int from track_lyricists tl where tl.lyricist_id = l.id) as song_count
       from lyricists l where l.status <> 'archived' and l.search_text like $1 limit 8`,
      [p],
    )).map(mapLyricist);
    const movies = (await sql.query(
      `select * from movies where status <> 'archived' and search_text like $1 limit 12`,
      [p],
    )).map(mapMovie);
    return { albums, tracks, singers, lyricists, movies };
  });

export const getSingerDetail = createServerFn({ method: "GET" })
  .validator((id: string) => String(id))
  .handler(async ({ data: id }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const rows = await sql.query(
      `select s.*, (select count(*)::int from track_singers ts where ts.singer_id = s.id) as song_count
       from singers s where s.id = $1`,
      [id],
    );
    if (!rows[0]) return null;
    const trackRows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       join track_singers ts on ts.track_id = t.id
       where ts.singer_id = $1 and t.status <> 'archived'
       order by t.release_year desc, t.title
       limit 80`,
      [id],
    );
    const tracks = await attachCredits(sql, trackRows.map(mapTrack));
    return { singer: mapSinger(rows[0]), tracks };
  });

export const getLyricistDetail = createServerFn({ method: "GET" })
  .validator((id: string) => String(id))
  .handler(async ({ data: id }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const rows = await sql.query(
      `select l.*, (select count(*)::int from track_lyricists tl where tl.lyricist_id = l.id) as song_count
       from lyricists l where l.id = $1`,
      [id],
    );
    if (!rows[0]) return null;
    const trackRows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       join track_lyricists tl on tl.track_id = t.id
       where tl.lyricist_id = $1 and t.status <> 'archived'
       order by t.release_year desc
       limit 80`,
      [id],
    );
    const tracks = await attachCredits(sql, trackRows.map(mapTrack));
    return { lyricist: mapLyricist(rows[0]), tracks };
  });

export const getMovieDetail = createServerFn({ method: "GET" })
  .validator((id: string) => String(id))
  .handler(async ({ data: id }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const rows = await sql.query(`select * from movies where id = $1`, [id]);
    if (!rows[0]) return null;
    const albums = (await sql.query<AlbumRow>(`select * from albums where movie_id = $1 and status <> 'archived'`, [id])).map(mapAlbum);
    const trackRows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       where (t.movie_id = $1 or a.movie_id = $1) and t.status <> 'archived'
       order by t.track_number, t.title`,
      [id],
    );
    const tracks = await attachCredits(sql, trackRows.map(mapTrack));
    return { movie: mapMovie(rows[0]), albums, tracks };
  });

export const relatedTracks = createServerFn({ method: "GET" })
  .validator((input: { trackId: string }) => input)
  .handler(async ({ data }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    const seed = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM} where t.id = $1`,
      [data.trackId],
    );
    if (!seed[0]) return [] as Track[];
    const t = seed[0];
    const mood = (t.mood_tags ?? [])[0];
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM}
       where t.id <> $1 and t.status <> 'archived'
         and (t.language = $2 or $3 = any(t.mood_tags) or t.movie_name = $4)
       order by case when t.movie_name = $4 then 0 when $3 = any(t.mood_tags) then 1 else 2 end, t.release_year desc
       limit 12`,
      [t.id, t.language, mood || "nostalgia", t.movie_name],
    );
    return attachCredits(sql, rows.map(mapTrack));
  });

export const listPeople = createServerFn({ method: "GET" })
  .validator((kind: "singers" | "lyricists") => kind)
  .handler(async ({ data: kind }) => {
    await ensureCatalogSeeded();
    const sql = await getSql();
    if (kind === "singers") {
      const rows = await sql`
        select s.*, (select count(*)::int from track_singers ts where ts.singer_id = s.id) as song_count
        from singers s where s.status <> 'archived'
        order by song_count desc, s.name
        limit 80
      `;
      return rows.map(mapSinger);
    }
    const rows = await sql`
      select l.*, (select count(*)::int from track_lyricists tl where tl.lyricist_id = l.id) as song_count
      from lyricists l where l.status <> 'archived'
      order by song_count desc, l.name
      limit 80
    `;
    return rows.map(mapLyricist);
  });
