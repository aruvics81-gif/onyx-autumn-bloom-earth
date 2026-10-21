import type { Album, Track } from "@/lib/types";
import { getSql } from "@/lib/db";
import {
  eraFromYear,
  isLikelyLyricist,
  searchBlob,
  slugify,
  splitCredits,
} from "@/lib/normalize";

type RawCatalog = { albums: Album[]; tracks: Track[] };

const NOTHING_BUT_WIND_TRACKS = [
  "Singing Earth",
  "Mozart I Love You",
  "Song of Soul",
  "Folkdance in Concert",
  "Innocent Passion",
  "Which is the Way?",
  "Nothing But Wind",
] as const;

let seeding: Promise<void> | null = null;

export function invalidateCatalogCache() {
  cacheGen += 1;
  snapshot = null;
}

export let cacheGen = 1;
let snapshot: null | { gen: number } = null;
void snapshot;

export async function ensureCatalogSeeded() {
  if (seeding) return seeding;
  seeding = (async () => {
    const sql = await getSql();
    const meta = await sql<{ value: string }>`select value from app_meta where key = 'seed_version'`;
    const version = meta[0]?.value ?? "0";
    if (version >= "3") return;

    await seedTaxonomy(sql);
    const albumsN = await sql<{ c: number }>`select count(*)::int as c from albums`;
    if ((albumsN[0]?.c ?? 0) === 0) {
      await seedFromJson(sql);
    } else {
      await backfillTrackColumns(sql);
    }
    await deriveGraph(sql);
    await seedNothingButWind(sql);
    await sql.query(
      `insert into app_meta (key, value) values ('seed_version', '3')
       on conflict (key) do update set value = excluded.value`,
    );
    invalidateCatalogCache();
  })().catch((err) => {
    seeding = null;
    console.error("[ochre] catalog seed failed", err);
    throw err;
  });
  return seeding;
}

async function seedTaxonomy(sql: Awaited<ReturnType<typeof getSql>>) {
  const langs = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "Instrumental"];
  for (const name of langs) {
    const id = slugify(name);
    await sql.query(`insert into languages (id, name) values ($1,$2) on conflict (id) do nothing`, [
      id,
      name,
    ]);
  }
  const genres = [
    ["film-song", "Film song"],
    ["bgm", "Background score"],
    ["instrumental", "Instrumental"],
    ["fusion", "Indian-Western fusion"],
    ["folk", "Folk"],
    ["classical-fusion", "Classical fusion"],
  ];
  for (const [id, name] of genres) {
    await sql.query(`insert into genres (id, name) values ($1,$2) on conflict (id) do nothing`, [
      id,
      name,
    ]);
  }
  const moods: Array<[string, string, string, string]> = [
    ["earthy-folk", "Earthy Folk", "Nattupura soil, nadaswaram, village dust.", "#A65B32"],
    ["rain", "Rain Songs", "Monsoon strings and a flute behind the shutters.", "#7A8B7A"],
    ["romance", "Romance", "Poove, thenral, a glance held one bar too long.", "#C87D55"],
    ["melancholy", "Melancholy", "Pathos violin — the Raja signature ache.", "#6B3A28"],
    ["elevation", "Mass / Elevation", "Brass stabs, dholak fire, a hero's walk.", "#8B4513"],
    ["classical", "Classical Fusion", "Raga counterpoint, veena against a western line.", "#C4A574"],
    ["nostalgia", "Nostalgia", "Aged tape, Madras evenings, analog warmth.", "#D4A574"],
    ["dusk-longing", "Dusk Longing", "Ilaya nila — guitar, neon, the long way home.", "#9A5B3C"],
    ["celebration", "Celebration", "Wedding horns, folk bounce, laughter in 4/4.", "#E0A060"],
    ["spiritual", "Spiritual", "Temple bells, oratorio, a raga as prayer.", "#B8895A"],
    ["youth", "Youth", "College bounce, radio heat, a first walk.", "#C48A5A"],
  ];
  for (const [id, name, description, swatch] of moods) {
    await sql.query(
      `insert into mood_defs (id, name, description, swatch) values ($1,$2,$3,$4)
       on conflict (id) do nothing`,
      [id, name, description, swatch],
    );
  }
  await sql.query(
    `insert into artists (id, name, role_label, biography, search_text, status)
     values ($1,$2,$3,$4,$5,'active') on conflict (id) do nothing`,
    [
      "a-ilaiyaraaja",
      "Ilaiyaraaja",
      "Composer",
      "Isaignani — composer of thousands of film songs and scores across Tamil, Telugu, Malayalam, Kannada and Hindi cinema.",
      searchBlob("Ilaiyaraaja"),
    ],
  );
  await sql.query(
    `insert into artists (id, name, role_label, biography, search_text, status)
     values ($1,$2,$3,$4,$5,'active') on conflict (id) do nothing`,
    [
      "a-hariprasadchaurasia",
      "Hariprasad Chaurasia",
      "Flute",
      "Bansuri maestro; featured performer on Ilaiyaraaja's 1988 instrumental album Nothing But Wind.",
      searchBlob("Hariprasad Chaurasia"),
    ],
  );
}

async function seedFromJson(sql: Awaited<ReturnType<typeof getSql>>) {
  const raw = (await import("../../data/catalog.json")).default as RawCatalog;
  for (const a of raw.albums) {
    const albumType =
      a.language === "Instrumental" || a.category === "bgm"
        ? a.id === "howtonameit"
          ? "instrumental"
          : "bgm"
        : "film_soundtrack";
    await sql.query(
      `insert into albums (id, title, movie_name, language, release_year, era, cover_url, category, moods, description, track_count, featured, album_type, status, search_text)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::text[],$10,$11,$12,$13,'active',$14)
       on conflict (id) do nothing`,
      [
        a.id,
        a.title,
        a.movieName,
        a.language,
        a.releaseYear,
        a.era,
        a.coverUrl,
        a.category,
        a.moods,
        a.description,
        a.trackCount,
        a.featured,
        albumType,
        searchBlob(a.title, a.movieName, a.language),
      ],
    );
  }
  for (const t of raw.tracks) {
    const catalogDuration = Number(t.duration) || 0;
    await sql.query(
      `insert into tracks (id, album_id, title, movie_name, language, release_year, category, audio_url, album_art_url, vinyl_center_label_url, mood_tags, duration, artist, track_number, composer, catalog_duration, status, search_text, genre)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::text[],$12,$13,$14,'Ilaiyaraaja',$15,'active',$16,$17)
       on conflict (id) do nothing`,
      [
        t.id,
        t.albumId,
        t.title,
        t.movieName,
        t.language,
        t.releaseYear,
        t.category,
        t.audioUrl,
        t.albumArtUrl,
        t.vinylCenterLabelUrl,
        t.moods,
        catalogDuration,
        t.artist,
        t.trackNumber,
        catalogDuration,
        searchBlob(t.title, t.movieName, t.artist),
        t.category === "bgm" ? "bgm" : "film-song",
      ],
    );
  }
}

async function backfillTrackColumns(sql: Awaited<ReturnType<typeof getSql>>) {
  await sql.query(`update tracks set catalog_duration = duration where catalog_duration = 0 and duration > 0`);
  await sql.query(
    `update tracks set search_text = lower(coalesce(title,'') || ' ' || coalesce(movie_name,'') || ' ' || coalesce(artist,''))
     where search_text = ''`,
  );
  await sql.query(
    `update albums set search_text = lower(coalesce(title,'') || ' ' || coalesce(movie_name,'') || ' ' || coalesce(language,''))
     where search_text = ''`,
  );
  await sql.query(
    `update albums set album_type = 'instrumental' where id = 'howtonameit' and album_type = 'film_soundtrack'`,
  );
}

async function deriveGraph(sql: Awaited<ReturnType<typeof getSql>>) {
  const albums = await sql<{
    id: string;
    title: string;
    movie_name: string;
    language: string;
    release_year: number;
    cover_url: string;
    description: string | null;
    category: string;
    album_type: string;
  }>`select id, title, movie_name, language, release_year, cover_url, description, category, album_type from albums`;

  for (const a of albums) {
    const isInstrumental = a.album_type === "instrumental" || a.language === "Instrumental";
    if (isInstrumental) continue;
    const movieId = `m-${slugify(a.movie_name)}-${a.release_year}`;
    await sql.query(
      `insert into movies (id, name, release_year, language, poster_url, description, status, search_text)
       values ($1,$2,$3,$4,$5,$6,'active',$7)
       on conflict (id) do nothing`,
      [
        movieId,
        a.movie_name,
        a.release_year,
        a.language,
        a.cover_url,
        a.description,
        searchBlob(a.movie_name, String(a.release_year), a.language),
      ],
    );
    await sql.query(`update albums set movie_id = $1 where id = $2 and movie_id is null`, [movieId, a.id]);
  }

  const tracks = await sql<{
    id: string;
    title: string;
    movie_name: string;
    artist: string | null;
    category: string;
    audio_url: string;
    duration: number;
    language: string;
  }>`select id, title, movie_name, artist, category, audio_url, duration, language from tracks`;

  const singerLangs = new Map<string, Set<string>>();

  for (const t of tracks) {
    const names = splitCredits(t.artist);
    let pos = 1;
    for (const name of names) {
      const lyricist = isLikelyLyricist(name) && name !== "Gangai Amaran";
      if (lyricist) {
        const id = `l-${slugify(name)}`;
        await sql.query(
          `insert into lyricists (id, name, status, search_text) values ($1,$2,'active',$3)
           on conflict (id) do nothing`,
          [id, name, searchBlob(name)],
        );
        await sql.query(
          `insert into track_lyricists (track_id, lyricist_id, position) values ($1,$2,$3)
           on conflict do nothing`,
          [t.id, id, pos],
        );
        continue;
      }
      if (name === "Ilaiyaraaja" && t.category === "bgm") {
        continue;
      }
      const id = `s-${slugify(name)}`;
      await sql.query(
        `insert into singers (id, name, status, search_text) values ($1,$2,'active',$3)
         on conflict (id) do nothing`,
        [id, name, searchBlob(name)],
      );
      await sql.query(
        `insert into track_singers (track_id, singer_id, position) values ($1,$2,$3)
         on conflict do nothing`,
        [t.id, id, pos],
      );
      if (!singerLangs.has(id)) singerLangs.set(id, new Set());
      singerLangs.get(id)!.add(t.language);
      pos += 1;
    }

    const hasAudio = Boolean(t.audio_url);
    const sourceType = hasAudio ? "PREVIEW" : "UNAVAILABLE";
    const sourceId = `src-${t.id}`;
    await sql.query(
      `insert into audio_sources (id, track_id, provider, provider_track_id, source_url, source_type, playback_capability, duration_seconds, is_verified)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do nothing`,
      [
        sourceId,
        t.id,
        hasAudio ? "itunes" : "none",
        t.id.replace(/^t-/, ""),
        hasAudio ? t.audio_url : null,
        sourceType,
        hasAudio ? "preview" : "none",
        hasAudio ? 30 : null,
        false,
      ],
    );
  }

  for (const [id, langs] of singerLangs) {
    const arr = [...langs];
    await sql.query(`update singers set languages = $1::text[] where id = $2`, [arr, id]);
  }

  await sql.query(
    `insert into album_artists (album_id, artist_id, role)
     select id, 'a-ilaiyaraaja', 'composer' from albums
     on conflict do nothing`,
  );
}

async function seedNothingButWind(sql: Awaited<ReturnType<typeof getSql>>) {
  const existing = await sql<{ id: string }>`
    select id from albums
    where lower(title) like '%nothing but wind%'
    limit 1
  `;
  if (existing[0]) return;

  const albumId = "nothingbutwind";
  await sql.query(
    `insert into albums (id, title, movie_name, language, release_year, era, cover_url, category, moods, description, track_count, featured, album_type, status, search_text)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9::text[],$10,$11,$12,$13,'active',$14)
     on conflict (id) do nothing`,
    [
      albumId,
      "Nothing But Wind",
      "Nothing But Wind",
      "Instrumental",
      1988,
      eraFromYear(1988),
      "",
      "bgm",
      ["classical", "spiritual", "elevation"],
      "1988 instrumental crossover album. Ilaiyaraaja's compositions performed with bansuri maestro Hariprasad Chaurasia. Original Oriental Records LP — seven pieces. In-app audio is not licensed; open the official source to hear the recording.",
      NOTHING_BUT_WIND_TRACKS.length,
      true,
      "instrumental",
      searchBlob("Nothing But Wind", "Hariprasad Chaurasia"),
    ],
  );
  await sql.query(
    `insert into album_artists (album_id, artist_id, role) values ($1,$2,$3) on conflict do nothing`,
    [albumId, "a-ilaiyaraaja", "composer"],
  );
  await sql.query(
    `insert into album_artists (album_id, artist_id, role) values ($1,$2,$3) on conflict do nothing`,
    [albumId, "a-hariprasadchaurasia", "flute"],
  );

  for (let i = 0; i < NOTHING_BUT_WIND_TRACKS.length; i++) {
    const title = NOTHING_BUT_WIND_TRACKS[i];
    const id = `t-nbw-${i + 1}`;
    await sql.query(
      `insert into tracks (id, album_id, title, movie_name, language, release_year, category, audio_url, album_art_url, vinyl_center_label_url, mood_tags, duration, artist, track_number, composer, catalog_duration, status, search_text, genre)
       values ($1,$2,$3,$4,$5,$6,'bgm','','','',$7::text[],0,$8,$9,'Ilaiyaraaja',0,'metadata_only',$10,'instrumental')
       on conflict (id) do nothing`,
      [
        id,
        albumId,
        title,
        "Nothing But Wind",
        "Instrumental",
        1988,
        ["classical", "spiritual"],
        "Ilaiyaraaja, Hariprasad Chaurasia",
        i + 1,
        searchBlob(title, "Nothing But Wind", "Hariprasad Chaurasia"),
      ],
    );
    await sql.query(
      `insert into audio_sources (id, track_id, provider, source_url, source_type, playback_capability, is_verified)
       values ($1,$2,'external',null,'EXTERNAL_ONLY','none', true)
       on conflict (id) do nothing`,
      [`src-${id}`, id],
    );
  }
}
