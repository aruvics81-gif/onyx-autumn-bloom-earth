import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { searchBlob, slugify, splitCredits, isLikelyLyricist } from "@/lib/normalize";
import type { AdminStats, AuditLog } from "@/lib/types";
import { TRACK_FROM, TRACK_SELECT, mapAlbum, mapLyricist, mapMovie, mapSinger, mapSource, mapTrack, type AlbumRow, type TrackRow } from "./map";
import { ensureCatalogSeeded, invalidateCatalogCache } from "./seed";
import { assertAdmin, writeAudit } from "./roles";

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function creditsFor(sql: Awaited<ReturnType<typeof getSql>>, trackId: string) {
  const singers = await sql.query<{ id: string; name: string; photo_url: string | null }>(
    `select s.id, s.name, s.photo_url from track_singers ts join singers s on s.id = ts.singer_id
     where ts.track_id = $1 order by ts.position`,
    [trackId],
  );
  const lyricists = await sql.query<{ id: string; name: string; photo_url: string | null }>(
    `select l.id, l.name, l.photo_url from track_lyricists tl join lyricists l on l.id = tl.lyricist_id
     where tl.track_id = $1 order by tl.position`,
    [trackId],
  );
  return {
    singers: singers.map((s) => ({ id: s.id, name: s.name, photoUrl: s.photo_url })),
    lyricists: lyricists.map((s) => ({ id: s.id, name: s.name, photoUrl: s.photo_url })),
  };
}

async function setPeople(
  sql: Awaited<ReturnType<typeof getSql>>,
  trackId: string,
  singerNames: string[],
  lyricistNames: string[],
) {
  await sql.query(`delete from track_singers where track_id = $1`, [trackId]);
  await sql.query(`delete from track_lyricists where track_id = $1`, [trackId]);
  let p = 1;
  for (const name of singerNames.map((n) => n.trim()).filter(Boolean)) {
    const id = `s-${slugify(name)}`;
    await sql.query(
      `insert into singers (id, name, status, search_text) values ($1,$2,'active',$3)
       on conflict (id) do update set name = excluded.name`,
      [id, name, searchBlob(name)],
    );
    await sql.query(
      `insert into track_singers (track_id, singer_id, position) values ($1,$2,$3) on conflict do nothing`,
      [trackId, id, p++],
    );
  }
  p = 1;
  for (const name of lyricistNames.map((n) => n.trim()).filter(Boolean)) {
    const id = `l-${slugify(name)}`;
    await sql.query(
      `insert into lyricists (id, name, status, search_text) values ($1,$2,'active',$3)
       on conflict (id) do update set name = excluded.name`,
      [id, name, searchBlob(name)],
    );
    await sql.query(
      `insert into track_lyricists (track_id, lyricist_id, position) values ($1,$2,$3) on conflict do nothing`,
      [trackId, id, p++],
    );
  }
}

export const adminStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AdminStats> => {
    await assertAdmin(context.userId);
    await ensureCatalogSeeded();
    const sql = await getSql();
    const q = async (text: string) => {
      const rows = await sql.query<{ c: number }>(text);
      return rows[0]?.c ?? 0;
    };
    const usersFromAuth = await sql.query<{ c: number }>`select count(*)::int as c from "user"`;
    return {
      users: usersFromAuth[0]?.c ?? (await q(`select count(*)::int as c from user_profiles`)),
      songs: await q(`select count(*)::int as c from tracks where status <> 'archived'`),
      albums: await q(`select count(*)::int as c from albums where status <> 'archived'`),
      movies: await q(`select count(*)::int as c from movies where status <> 'archived'`),
      singers: await q(`select count(*)::int as c from singers where status <> 'archived'`),
      lyricists: await q(`select count(*)::int as c from lyricists where status <> 'archived'`),
      playable: await q(
        `select count(*)::int as c from tracks t
         join audio_sources s on s.track_id = t.id
         where t.status <> 'archived' and s.source_type in ('FULL_TRACK','PREVIEW') and coalesce(s.source_url,'') <> ''`,
      ),
      metadataOnly: await q(`select count(*)::int as c from tracks where status = 'metadata_only'`),
      missingArtwork: await q(
        `select count(*)::int as c from tracks where status <> 'archived' and coalesce(album_art_url,'') = ''`,
      ),
      unverifiedSources: await q(`select count(*)::int as c from audio_sources where is_verified = false`),
      brokenSources: await q(
        `select count(*)::int as c from audio_sources where source_type = 'UNAVAILABLE' or coalesce(source_url,'') = '' and source_type in ('FULL_TRACK','PREVIEW')`,
      ),
    };
  });

export const adminListSongs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: {
    q?: string;
    language?: string;
    year?: number;
    movie?: string;
    singer?: string;
    lyricist?: string;
    genre?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => input ?? {})
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await ensureCatalogSeeded();
    const sql = await getSql();
    const opts = data ?? {};
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 25));
    const offset = (page - 1) * limit;
    const clauses: string[] = ["1=1"];
    const params: unknown[] = [];
    const add = (part: string, v: unknown) => {
      params.push(v);
      clauses.push(part.replace("?", `$${params.length}`));
    };
    if (opts.q) add(`t.search_text like ?`, `%${opts.q.toLowerCase()}%`);
    if (opts.language) add(`t.language = ?`, opts.language);
    if (opts.year) add(`t.release_year = ?`, opts.year);
    if (opts.genre) add(`t.genre = ?`, opts.genre);
    if (opts.status) add(`t.status = ?`, opts.status);
    if (opts.movie) add(`t.movie_name ilike ?`, `%${opts.movie}%`);
    if (opts.singer) add(
      `exists (select 1 from track_singers ts join singers s on s.id = ts.singer_id where ts.track_id = t.id and s.search_text like ?)`,
      `%${opts.singer.toLowerCase()}%`,
    );
    if (opts.lyricist) add(
      `exists (select 1 from track_lyricists tl join lyricists l on l.id = tl.lyricist_id where tl.track_id = t.id and l.search_text like ?)`,
      `%${opts.lyricist.toLowerCase()}%`,
    );
    const order =
      opts.sort === "title" ? "t.title" :
      opts.sort === "year" ? "t.release_year desc" :
      opts.sort === "updated" ? "t.updated_at desc nulls last" :
      "t.release_year desc, t.title";
    const where = `where ${clauses.join(" and ")}`;
    const total = await sql.query<{ c: number }>(`select count(*)::int as c ${TRACK_FROM} ${where}`, params);
    params.push(limit, offset);
    const rows = await sql.query<TrackRow>(
      `select ${TRACK_SELECT} ${TRACK_FROM} ${where} order by ${order} limit $${params.length - 1} offset $${params.length}`,
      params,
    );
    const tracks = [];
    for (const r of rows) {
      const c = await creditsFor(sql, r.id);
      tracks.push(mapTrack(r, c.singers, c.lyricists));
    }
    return { tracks, total: total[0]?.c ?? 0, page, limit };
  });

export const adminGetSong = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => String(id))
  .handler(async ({ context, data: id }) => {
    await assertAdmin(context.userId);
    await ensureCatalogSeeded();
    const sql = await getSql();
    const rows = await sql.query<TrackRow>(`select ${TRACK_SELECT} ${TRACK_FROM} where t.id = $1`, [id]);
    if (!rows[0]) return null;
    const c = await creditsFor(sql, id);
    const sources = (await sql.query(`select * from audio_sources where track_id = $1 order by created_at`, [id])).map(mapSource);
    const albumRows = await sql.query<AlbumRow>(`select * from albums where id = $1`, [rows[0].album_id]);
    return {
      track: mapTrack(rows[0], c.singers, c.lyricists),
      album: albumRows[0] ? mapAlbum(albumRows[0]) : null,
      sources,
    };
  });

export type SongPatch = {
  id?: string;
  title?: string;
  movieName?: string;
  albumId?: string;
  releaseYear?: number;
  language?: string;
  singerNames?: string;
  lyricistNames?: string;
  composer?: string;
  genre?: string;
  moods?: string[];
  description?: string;
  trackNumber?: number;
  artworkUrl?: string;
  audioUrl?: string;
  sourceType?: string;
  credits?: string;
  status?: string;
  catalogDuration?: number;
};

export const adminSaveSong = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: SongPatch) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await ensureCatalogSeeded();
    const sql = await getSql();
    const isNew = !data.id;
    const id = data.id || newId("t");
    if (isNew) {
      const albumId = data.albumId || "unassigned";
      const dup = await sql.query<{ id: string }>(
        `select id from tracks
         where lower(title) = lower($1) and lower(coalesce(movie_name,'')) = lower($2) and album_id = $3
         limit 1`,
        [data.title || "Untitled", data.movieName || "", albumId],
      );
      if (dup[0]) throw new Error("That song is already on this album.");
      if (albumId === "unassigned") {
        await sql.query(
          `insert into albums (id, title, movie_name, language, release_year, era, cover_url, category, moods, description, track_count, featured, album_type, status, search_text)
           values ('unassigned','Unassigned','Unassigned','Tamil',1980,'80s','','song','{}','Holding shelf for new tracks',0,false,'film_soundtrack','active','unassigned')
           on conflict (id) do nothing`,
        );
      }
      await sql.query(
        `insert into tracks (id, album_id, title, movie_name, language, release_year, category, audio_url, album_art_url, vinyl_center_label_url, mood_tags, duration, artist, track_number, composer, genre, description, credits, status, catalog_duration, search_text)
         values ($1,$2,$3,$4,$5,$6,'song',$7,$8,$8,$9::text[],$10,$11,$12,$13,$14,$15,$16,$17,$10,$18)`,
        [
          id,
          albumId,
          data.title || "Untitled",
          data.movieName || "",
          data.language || "Tamil",
          data.releaseYear || 1980,
          data.audioUrl || "",
          data.artworkUrl || "",
          data.moods ?? [],
          data.catalogDuration || 0,
          data.singerNames || "",
          data.trackNumber || 1,
          data.composer || "Ilaiyaraaja",
          data.genre || null,
          data.description || null,
          data.credits || null,
          data.status || "active",
          searchBlob(data.title, data.movieName, data.singerNames),
        ],
      );
      await writeAudit(context.userId, "create", "track", id, "title", null, data.title || "Untitled");
    } else {
      const prev = await sql.query<TrackRow>(`select ${TRACK_SELECT} ${TRACK_FROM} where t.id = $1`, [id]);
      const p = prev[0];
      if (!p) throw new Error("Song not found");
      const nextTitle = data.title ?? p.title;
      const nextMovie = data.movieName ?? p.movie_name;
      const nextYear = data.releaseYear ?? p.release_year;
      const nextLang = data.language ?? p.language;
      const nextAlbum = data.albumId ?? p.album_id;
      const nextArt = data.artworkUrl ?? p.album_art_url;
      const nextAudio = data.audioUrl ?? p.audio_url;
      const nextGenre = data.genre ?? p.genre;
      const nextDesc = data.description ?? p.description;
      const nextCredits = data.credits ?? p.credits;
      const nextStatus = data.status ?? p.status;
      const nextNum = data.trackNumber ?? p.track_number;
      const nextComposer = data.composer ?? p.composer;
      const nextMoods = data.moods ?? p.mood_tags ?? [];
      const nextDur = data.catalogDuration ?? p.catalog_duration ?? p.duration;
      await sql.query(
        `update tracks set
           title=$2, movie_name=$3, language=$4, release_year=$5, album_id=$6,
           album_art_url=$7, vinyl_center_label_url=$7, audio_url=$8, genre=$9,
           description=$10, credits=$11, status=$12, track_number=$13, composer=$14,
           mood_tags=$15::text[], catalog_duration=$16, duration=$16,
           search_text=$17, artist=$18, updated_at=now()
         where id=$1`,
        [
          id, nextTitle, nextMovie, nextLang, nextYear, nextAlbum, nextArt, nextAudio,
          nextGenre, nextDesc, nextCredits, nextStatus, nextNum, nextComposer, nextMoods,
          nextDur, searchBlob(nextTitle, nextMovie, data.singerNames ?? p.artist),
          data.singerNames ?? p.artist,
        ],
      );
      const fields: Array<[string, unknown, unknown]> = [
        ["title", p.title, nextTitle],
        ["movie_name", p.movie_name, nextMovie],
        ["release_year", p.release_year, nextYear],
        ["album_art_url", p.album_art_url, nextArt],
        ["audio_url", p.audio_url, nextAudio],
      ];
      for (const [field, oldV, newV] of fields) {
        if (String(oldV) !== String(newV)) {
          await writeAudit(context.userId, "update", "track", id, field, String(oldV ?? ""), String(newV ?? ""));
        }
      }
    }
    if (data.singerNames !== undefined || data.lyricistNames !== undefined) {
      await setPeople(
        sql,
        id,
        splitCredits(data.singerNames || "").filter((n) => !isLikelyLyricist(n) || n === "Gangai Amaran"),
        splitCredits(data.lyricistNames || "").concat(
          splitCredits(data.singerNames || "").filter((n) => isLikelyLyricist(n) && n !== "Gangai Amaran"),
        ),
      );
    }
    if (data.audioUrl !== undefined || data.sourceType) {
      const srcType = data.sourceType || (data.audioUrl ? "PREVIEW" : "UNAVAILABLE");
      const url = data.audioUrl || null;
      const provider = url && /itunes\.apple\.com|mzstatic\.com|dzcdn\.net/i.test(url) ? "itunes" : "manual";
      const capability = srcType === "FULL_TRACK" ? "full" : srcType === "PREVIEW" ? "preview" : "none";
      await sql.query(
        `insert into audio_sources (id, track_id, provider, source_url, source_type, playback_capability, is_verified, updated_at)
         values ($1,$2,$3,$4,$5,$6,false,now())
         on conflict (id) do update set
           source_url=excluded.source_url,
           source_type=excluded.source_type,
           playback_capability=excluded.playback_capability,
           provider=excluded.provider,
           duration_seconds = case
             when audio_sources.source_url is distinct from excluded.source_url then null
             else audio_sources.duration_seconds
           end,
           updated_at=now()`,
        [`src-${id}`, id, provider, url, srcType, capability],
      );
    }
    if (data.artworkUrl) {
      await sql.query(
        `insert into images (id, entity_type, entity_id, url, source, license_status, uploaded_at)
         values ($1,'track',$2,$3,'admin','admin-upload',now())`,
        [newId("img"), id, data.artworkUrl],
      );
    }
    await sql.query(
      `update albums set track_count = (
         select count(*)::int from tracks where album_id = albums.id and status <> 'archived'
       ), updated_at = now()
       where id = (select album_id from tracks where id = $1)`,
      [id],
    );
    invalidateCatalogCache();
    return { id };
  });

export const adminArchiveSong = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; restore?: boolean }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const status = data.restore ? "active" : "archived";
    await sql.query(`update tracks set status=$2, updated_at=now() where id=$1`, [data.id, status]);
    await writeAudit(context.userId, data.restore ? "restore" : "archive", "track", data.id);
    invalidateCatalogCache();
    return { ok: true };
  });

export const adminDeleteSong = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => String(id))
  .handler(async ({ context, data: id }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query(`delete from tracks where id = $1`, [id]);
    await writeAudit(context.userId, "delete", "track", id);
    invalidateCatalogCache();
    return { ok: true };
  });

export const adminBulkSongs = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { ids: string[]; action: "language" | "genre" | "mood" | "album" | "year" | "archive"; value?: string }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (!data.ids.length) return { ok: true, n: 0 };
    const sql = await getSql();
    const ph = data.ids.map((_, i) => `$${i + 1}`).join(",");
    if (data.action === "archive") {
      await sql.query(`update tracks set status='archived', updated_at=now() where id in (${ph})`, data.ids);
    } else if (data.action === "language" && data.value) {
      await sql.query(`update tracks set language=$${data.ids.length + 1}, updated_at=now() where id in (${ph})`, [...data.ids, data.value]);
    } else if (data.action === "genre" && data.value) {
      await sql.query(`update tracks set genre=$${data.ids.length + 1}, updated_at=now() where id in (${ph})`, [...data.ids, data.value]);
    } else if (data.action === "album" && data.value) {
      await sql.query(`update tracks set album_id=$${data.ids.length + 1}, updated_at=now() where id in (${ph})`, [...data.ids, data.value]);
    } else if (data.action === "year" && data.value) {
      await sql.query(`update tracks set release_year=$${data.ids.length + 1}, updated_at=now() where id in (${ph})`, [...data.ids, Number(data.value)]);
    } else if (data.action === "mood" && data.value) {
      await sql.query(
        `update tracks set mood_tags = array(select distinct unnest(mood_tags || $${data.ids.length + 1}::text[])), updated_at=now() where id in (${ph})`,
        [...data.ids, [data.value]],
      );
    }
    await writeAudit(context.userId, `bulk_${data.action}`, "track", data.ids.join(","), data.action, null, data.value ?? "");
    invalidateCatalogCache();
    return { ok: true, n: data.ids.length };
  });

export const adminSaveAlbum = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    id?: string;
    title: string;
    movieName?: string;
    releaseYear?: number;
    language?: string;
    coverUrl?: string;
    description?: string;
    albumType?: string;
    category?: string;
    featured?: boolean;
    trackIds?: string[];
  }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const id = data.id || slugify(data.title);
    const year = data.releaseYear || 1980;
    const era = year < 1980 ? "70s" : year < 1990 ? "80s" : year < 2000 ? "90s" : "2000s";
    await sql.query(
      `insert into albums (id, title, movie_name, language, release_year, era, cover_url, category, moods, description, track_count, featured, album_type, status, search_text, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'{}',$9,0,$10,$11,'active',$12,now())
       on conflict (id) do update set
         title=excluded.title, movie_name=excluded.movie_name, language=excluded.language,
         release_year=excluded.release_year, era=excluded.era, cover_url=excluded.cover_url,
         description=excluded.description, featured=excluded.featured, album_type=excluded.album_type,
         category=excluded.category, search_text=excluded.search_text, updated_at=now()`,
      [
        id,
        data.title,
        data.movieName || data.title,
        data.language || "Tamil",
        year,
        era,
        data.coverUrl || "",
        data.category || "song",
        data.description || "",
        Boolean(data.featured),
        data.albumType || "film_soundtrack",
        searchBlob(data.title, data.movieName),
      ],
    );
    if (data.trackIds) {
      for (let i = 0; i < data.trackIds.length; i++) {
        await sql.query(`update tracks set album_id=$2, track_number=$3, updated_at=now() where id=$1`, [
          data.trackIds[i],
          id,
          i + 1,
        ]);
      }
    }
    await sql.query(
      `update albums set track_count = (select count(*) from tracks where album_id = $1 and status <> 'archived') where id = $1`,
      [id],
    );
    await writeAudit(context.userId, data.id ? "update" : "create", "album", id, "title", null, data.title);
    invalidateCatalogCache();
    return { id };
  });

export const adminArchiveAlbum = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; restore?: boolean }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query(`update albums set status=$2, updated_at=now() where id=$1`, [
      data.id,
      data.restore ? "active" : "archived",
    ]);
    await writeAudit(context.userId, data.restore ? "restore" : "archive", "album", data.id);
    invalidateCatalogCache();
    return { ok: true };
  });

export const adminSavePerson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    kind: "singer" | "lyricist" | "artist" | "movie";
    id?: string;
    name: string;
    photoUrl?: string;
    biography?: string;
    extra?: string;
    year?: number;
    language?: string;
  }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const prefix = data.kind === "singer" ? "s" : data.kind === "lyricist" ? "l" : data.kind === "movie" ? "m" : "a";
    const id = data.id || `${prefix}-${slugify(data.name)}`;
    if (data.kind === "singer") {
      await sql.query(
        `insert into singers (id, name, photo_url, photo_source, biography, status, search_text, updated_at)
         values ($1,$2,$3,'admin',$4,'active',$5,now())
         on conflict (id) do update set name=excluded.name, photo_url=coalesce(excluded.photo_url, singers.photo_url), biography=excluded.biography, search_text=excluded.search_text, updated_at=now()`,
        [id, data.name, data.photoUrl || null, data.biography || null, searchBlob(data.name)],
      );
    } else if (data.kind === "lyricist") {
      await sql.query(
        `insert into lyricists (id, name, photo_url, photo_source, biography, known_works, status, search_text, updated_at)
         values ($1,$2,$3,'admin',$4,$5,'active',$6,now())
         on conflict (id) do update set name=excluded.name, photo_url=coalesce(excluded.photo_url, lyricists.photo_url), biography=excluded.biography, known_works=excluded.known_works, search_text=excluded.search_text, updated_at=now()`,
        [id, data.name, data.photoUrl || null, data.biography || null, data.extra || null, searchBlob(data.name)],
      );
    } else if (data.kind === "artist") {
      await sql.query(
        `insert into artists (id, name, photo_url, biography, role_label, status, search_text, updated_at)
         values ($1,$2,$3,$4,$5,'active',$6,now())
         on conflict (id) do update set name=excluded.name, photo_url=coalesce(excluded.photo_url, artists.photo_url), biography=excluded.biography, role_label=excluded.role_label, search_text=excluded.search_text, updated_at=now()`,
        [id, data.name, data.photoUrl || null, data.biography || null, data.extra || null, searchBlob(data.name)],
      );
    } else {
      await sql.query(
        `insert into movies (id, name, release_year, language, poster_url, description, status, search_text, updated_at)
         values ($1,$2,$3,$4,$5,$6,'active',$7,now())
         on conflict (id) do update set name=excluded.name, release_year=excluded.release_year, language=excluded.language, poster_url=coalesce(excluded.poster_url, movies.poster_url), description=excluded.description, search_text=excluded.search_text, updated_at=now()`,
        [id, data.name, data.year || null, data.language || null, data.photoUrl || null, data.biography || null, searchBlob(data.name)],
      );
    }
    await writeAudit(context.userId, data.id ? "update" : "create", data.kind, id, "name", null, data.name);
    invalidateCatalogCache();
    return { id };
  });

export const adminListEntities = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { kind: "albums" | "movies" | "singers" | "lyricists" | "artists" | "sources" | "images"; q?: string }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await ensureCatalogSeeded();
    const sql = await getSql();
    const q = data.q?.toLowerCase();
    if (data.kind === "albums") {
      const rows = q
        ? await sql.query<AlbumRow>(`select * from albums where search_text like $1 order by title`, [`%${q}%`])
        : await sql.query<AlbumRow>(`select * from albums order by title`);
      return { albums: rows.map(mapAlbum) };
    }
    if (data.kind === "movies") {
      const rows = q
        ? await sql.query(`select * from movies where search_text like $1 order by name`, [`%${q}%`])
        : await sql.query(`select * from movies order by name`);
      return { movies: rows.map(mapMovie) };
    }
    if (data.kind === "singers") {
      const rows = await sql.query(
        `select s.*, (select count(*)::int from track_singers ts where ts.singer_id = s.id) as song_count
         from singers s ${q ? "where s.search_text like $1" : ""} order by s.name`,
        q ? [`%${q}%`] : [],
      );
      return { singers: rows.map(mapSinger) };
    }
    if (data.kind === "lyricists") {
      const rows = await sql.query(
        `select l.*, (select count(*)::int from track_lyricists tl where tl.lyricist_id = l.id) as song_count
         from lyricists l ${q ? "where l.search_text like $1" : ""} order by l.name`,
        q ? [`%${q}%`] : [],
      );
      return { lyricists: rows.map(mapLyricist) };
    }
    if (data.kind === "artists") {
      const rows = q
        ? await sql.query(`select * from artists where search_text like $1 order by name`, [`%${q}%`])
        : await sql.query(`select * from artists order by name`);
      return { artists: rows };
    }
    if (data.kind === "sources") {
      const rows = await sql.query(
        `select s.*, t.title from audio_sources s join tracks t on t.id = s.track_id
         order by s.is_verified, t.title limit 200`,
      );
      return { sources: rows };
    }
    const images = await sql.query(`select * from images order by uploaded_at desc limit 200`);
    return { images };
  });

export const adminTaxonomy = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    await ensureCatalogSeeded();
    const sql = await getSql();
    return {
      genres: await sql`select * from genres order by name`,
      moods: await sql`select * from mood_defs order by name`,
      languages: await sql`select * from languages order by name`,
    };
  });

export const adminSaveTaxonomy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: "genre" | "mood" | "language"; id?: string; name: string; extra?: string }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const id = data.id || slugify(data.name);
    if (data.kind === "genre") {
      await sql.query(`insert into genres (id, name, description) values ($1,$2,$3) on conflict (id) do update set name=excluded.name, description=excluded.description`, [id, data.name, data.extra || null]);
    } else if (data.kind === "mood") {
      await sql.query(`insert into mood_defs (id, name, description, swatch) values ($1,$2,$3,$4) on conflict (id) do update set name=excluded.name, description=excluded.description, swatch=coalesce(excluded.swatch, mood_defs.swatch)`, [id, data.name, data.extra || null, "#C87D55"]);
    } else {
      await sql.query(`insert into languages (id, name) values ($1,$2) on conflict (id) do update set name=excluded.name`, [id, data.name]);
    }
    await writeAudit(context.userId, "upsert", data.kind, id, "name", null, data.name);
    invalidateCatalogCache();
    return { id };
  });

export const adminVerifySource = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; verified: boolean; sourceType?: string }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query(
      `update audio_sources set is_verified=$2, last_verified_at=now(), source_type=coalesce($3, source_type), updated_at=now() where id=$1`,
      [data.id, data.verified, data.sourceType || null],
    );
    await writeAudit(context.userId, "verify_source", "audio_source", data.id, "is_verified", null, String(data.verified));
    invalidateCatalogCache();
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      name: string | null;
      email: string | null;
      created_at: string;
      preferred_language: string | null;
      last_active_at: string | null;
      account_status: string | null;
      seconds: number;
      plays: number;
      favs: number;
      playlists: number;
      role: string | null;
    }>(`
      select u.id, u.name, u.email, u."createdAt" as created_at,
        p.preferred_language, p.last_active_at, p.account_status,
        coalesce((select sum(total_seconds_listened) from user_listening_analytics a where a.user_id = u.id),0)::int as seconds,
        coalesce((select sum(completed_plays) from user_listening_analytics a where a.user_id = u.id),0)::int as plays,
        coalesce((select count(*) from user_favorites f where f.user_id = u.id),0)::int as favs,
        coalesce((select count(*) from playlists pl where pl.user_id = u.id),0)::int as playlists,
        r.role
      from "user" u
      left join user_profiles p on p.user_id = u.id
      left join user_roles r on r.user_id = u.id
      order by u."createdAt" desc
      limit 200
    `);
    return rows;
  });

export const adminGetUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => String(id))
  .handler(async ({ context, data: id }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const users = await sql.query(`
      select u.id, u.name, u.email, u."createdAt" as created_at, p.preferred_language, p.last_active_at, p.account_status, r.role
      from "user" u
      left join user_profiles p on p.user_id = u.id
      left join user_roles r on r.user_id = u.id
      where u.id = $1
    `, [id]);
    if (!users[0]) return null;
    const stats = await sql.query(
      `select coalesce(sum(total_seconds_listened),0)::int as seconds, coalesce(sum(completed_plays),0)::int as plays, count(*)::int as tracks
       from user_listening_analytics where user_id = $1`,
      [id],
    );
    const recent = await sql.query(
      `select track_id, listened_seconds, completed, played_at from listening_history where user_id = $1 order by played_at desc limit 20`,
      [id],
    );
    const playlists = await sql.query(`select id, title, created_at from playlists where user_id = $1`, [id]);
    const favs = await sql.query<{ c: number }>`select count(*)::int as c from user_favorites where user_id = ${id}`;
    return { user: users[0], stats: stats[0], recent, playlists, favorites: favs[0]?.c ?? 0 };
  });

export const adminSetUserStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: "active" | "disabled"; role?: "user" | "admin" }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    await sql.query(
      `insert into user_profiles (user_id, account_status) values ($1,$2)
       on conflict (user_id) do update set account_status = excluded.account_status, updated_at=now()`,
      [data.id, data.status],
    );
    if (data.role) {
      await sql.query(
        `insert into user_roles (user_id, role) values ($1,$2)
         on conflict (user_id) do update set role = excluded.role`,
        [data.id, data.role],
      );
    }
    await writeAudit(context.userId, "user_status", "user", data.id, "account_status", null, data.status);
    return { ok: true };
  });

export const adminAnalytics = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const totals = await sql.query<{ seconds: number; plays: number; listeners: number }>(`
      select coalesce(sum(total_seconds_listened),0)::int as seconds,
             coalesce(sum(completed_plays),0)::int as plays,
             count(distinct user_id)::int as listeners
      from user_listening_analytics
    `);
    const top = await sql.query(`
      select a.track_id, t.title, t.movie_name, sum(a.total_seconds_listened)::int as seconds, sum(a.completed_plays)::int as plays
      from user_listening_analytics a
      join tracks t on t.id = a.track_id
      group by a.track_id, t.title, t.movie_name
      order by seconds desc
      limit 20
    `);
    return { totals: totals[0], top };
  });

export const adminAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AuditLog[]> => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select id, admin_user_id, action, entity_type, entity_id, field, old_value, new_value, created_at
      from admin_audit_logs order by created_at desc limit 200
    `;
    return rows.map((r) => ({
      id: r.id,
      adminUserId: r.admin_user_id,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      field: r.field,
      oldValue: r.old_value,
      newValue: r.new_value,
      createdAt: r.created_at,
    }));
  });

export const adminImportCsv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { rows: Array<Record<string, string>>; confirm: boolean }) => input)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await ensureCatalogSeeded();
    const sql = await getSql();
    const preview = [];
    for (const row of data.rows.slice(0, 500)) {
      const title = (row.title || row.song || "").trim();
      const year = Number(row.year || row.release_year || 0);
      const issues: string[] = [];
      if (!title) issues.push("missing title");
      if (year && (year < 1950 || year > 2030)) issues.push("invalid year");
      const dup = title
        ? await sql.query<{ id: string }>(`select id from tracks where lower(title)=lower($1) and lower(movie_name)=lower($2) limit 1`, [title, row.movie || row.album || ""])
        : [];
      if (dup[0]) issues.push("possible duplicate");
      preview.push({ title, movie: row.movie || "", year, issues, row });
    }
    if (!data.confirm) return { preview, imported: 0 };
    let imported = 0;
    for (const item of preview) {
      if (!item.title || item.issues.includes("missing title")) continue;
      const id = newId("t");
      const albumTitle = item.row.album || item.row.movie || "Unassigned";
      const albumId = slugify(albumTitle) || "unassigned";
      await sql.query(
        `insert into albums (id, title, movie_name, language, release_year, era, cover_url, category, moods, description, track_count, featured, album_type, status, search_text)
         values ($1,$2,$3,$4,$5,$6,'','song','{}','',0,false,'film_soundtrack','active',$7)
         on conflict (id) do nothing`,
        [albumId, albumTitle, item.row.movie || albumTitle, item.row.language || "Tamil", item.year || 1980, item.year && item.year < 1980 ? "70s" : "80s", searchBlob(albumTitle)],
      );
      await sql.query(
        `insert into tracks (id, album_id, title, movie_name, language, release_year, category, audio_url, album_art_url, vinyl_center_label_url, mood_tags, duration, artist, track_number, composer, status, search_text, genre)
         values ($1,$2,$3,$4,$5,$6,'song','','','',$7::text[],0,$8,$9,'Ilaiyaraaja','metadata_only',$10,$11)
         on conflict (id) do nothing`,
        [
          id, albumId, item.title, item.row.movie || albumTitle, item.row.language || "Tamil", item.year || 1980,
          (item.row.moods || "").split(";").map((s) => s.trim()).filter(Boolean),
          item.row.singers || "", Number(item.row.track_number || 1),
          searchBlob(item.title, item.row.movie, item.row.singers),
          item.row.genre || null,
        ],
      );
      await setPeople(sql, id, splitCredits(item.row.singers), splitCredits(item.row.lyricist));
      imported += 1;
    }
    await writeAudit(context.userId, "csv_import", "track", null, "count", null, String(imported));
    invalidateCatalogCache();
    return { preview, imported };
  });

export const adminListPlaylists = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const sql = await getSql();
    return sql`select p.*, (select count(*)::int from playlist_tracks t where t.playlist_id = p.id) as track_count from playlists p order by p.updated_at desc limit 100`;
  });
