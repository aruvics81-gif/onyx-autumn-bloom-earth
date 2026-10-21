import type { Album, AudioSource, CreditPerson, Lyricist, Movie, Singer, SourceType, Track } from "@/lib/types";
import { officialSearchUrl } from "@/lib/normalize";
import { artCacheUrl } from "@/lib/catalog";

export type TrackRow = {
  id: string;
  album_id: string;
  title: string;
  movie_name: string;
  language: string;
  release_year: number;
  category: string;
  audio_url: string;
  album_art_url: string;
  vinyl_center_label_url: string | null;
  mood_tags: string[] | null;
  duration: number;
  catalog_duration?: number | null;
  artist: string | null;
  track_number: number;
  composer?: string | null;
  genre?: string | null;
  description?: string | null;
  credits?: string | null;
  status?: string | null;
  movie_id?: string | null;
  updated_at?: string | null;
  album_title?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  source_duration?: number | null;
};

export type AlbumRow = {
  id: string;
  title: string;
  movie_name: string;
  language: string;
  release_year: number;
  era: string;
  cover_url: string;
  category: string;
  moods: string[] | null;
  description: string | null;
  track_count: number;
  featured: boolean;
  album_type?: string | null;
  movie_id?: string | null;
  status?: string | null;
  updated_at?: string | null;
};

export function mapAlbum(a: AlbumRow): Album {
  return {
    id: a.id,
    title: a.title,
    movieName: a.movie_name,
    movieId: a.movie_id ?? null,
    language: a.language,
    releaseYear: a.release_year,
    era: a.era,
    coverUrl: artCacheUrl(a.cover_url, a.updated_at) || "",
    category: a.category,
    albumType: a.album_type || "film_soundtrack",
    moods: a.moods ?? [],
    description: a.description || "",
    trackCount: a.track_count,
    featured: Boolean(a.featured),
    status: a.status || "active",
    updatedAt: a.updated_at || undefined,
  };
}

export function mapTrack(
  t: TrackRow,
  singers: CreditPerson[] = [],
  lyricists: CreditPerson[] = [],
): Track {
  const sourceType = (t.source_type as SourceType) || (t.audio_url ? "PREVIEW" : "UNAVAILABLE");
  const catalogDuration = t.catalog_duration || t.duration || 0;
  const playable = sourceType === "FULL_TRACK" || sourceType === "PREVIEW";
  const audioUrl = playable ? t.source_url || t.audio_url || "" : "";
  const art = artCacheUrl(t.album_art_url, t.updated_at) || "";
  return {
    id: t.id,
    albumId: t.album_id,
    albumTitle: t.album_title || undefined,
    title: t.title,
    movieName: t.movie_name,
    movieId: t.movie_id ?? null,
    language: t.language,
    releaseYear: t.release_year,
    category: t.category,
    audioUrl,
    albumArtUrl: art,
    vinylCenterLabelUrl: artCacheUrl(t.vinyl_center_label_url, t.updated_at) || art,
    moods: t.mood_tags ?? [],
    duration: catalogDuration,
    catalogDuration,
    artist: t.artist || "Ilaiyaraaja",
    trackNumber: t.track_number,
    composer: t.composer || "Ilaiyaraaja",
    genre: t.genre ?? null,
    description: t.description ?? null,
    credits: t.credits ?? null,
    status: t.status || "active",
    sourceType,
    sourceUrl: t.source_url ?? t.audio_url ?? null,
    officialUrl: officialSearchUrl(t.title, t.movie_name),
    singers,
    lyricists,
    updatedAt: t.updated_at || undefined,
  };
}

export function mapSinger(r: {
  id: string;
  name: string;
  photo_url: string | null;
  photo_source?: string | null;
  photo_license?: string | null;
  biography: string | null;
  languages?: string[] | null;
  external_url?: string | null;
  status: string;
  song_count?: number | null;
}): Singer {
  return {
    id: r.id,
    name: r.name,
    photoUrl: r.photo_url,
    photoSource: r.photo_source ?? null,
    photoLicense: r.photo_license ?? null,
    biography: r.biography,
    languages: r.languages ?? [],
    externalUrl: r.external_url ?? null,
    status: r.status,
    songCount: r.song_count ?? undefined,
  };
}

export function mapLyricist(r: {
  id: string;
  name: string;
  photo_url: string | null;
  photo_source?: string | null;
  photo_license?: string | null;
  biography: string | null;
  known_works?: string | null;
  status: string;
  song_count?: number | null;
}): Lyricist {
  return {
    id: r.id,
    name: r.name,
    photoUrl: r.photo_url,
    photoSource: r.photo_source ?? null,
    photoLicense: r.photo_license ?? null,
    biography: r.biography,
    knownWorks: r.known_works ?? null,
    status: r.status,
    songCount: r.song_count ?? undefined,
  };
}

export function mapMovie(r: {
  id: string;
  name: string;
  release_year: number | null;
  language: string | null;
  poster_url: string | null;
  description: string | null;
  director: string | null;
  production: string | null;
  status: string;
  track_count?: number | null;
}): Movie {
  return {
    id: r.id,
    name: r.name,
    releaseYear: r.release_year,
    language: r.language,
    posterUrl: r.poster_url,
    description: r.description,
    director: r.director,
    production: r.production,
    status: r.status,
    trackCount: r.track_count ?? undefined,
  };
}

export function mapSource(r: {
  id: string;
  track_id: string;
  provider: string;
  provider_track_id: string | null;
  source_url: string | null;
  source_type: string;
  playback_capability: string;
  duration_seconds: number | null;
  is_verified: boolean;
  last_verified_at: string | null;
}): AudioSource {
  return {
    id: r.id,
    trackId: r.track_id,
    provider: r.provider,
    providerTrackId: r.provider_track_id,
    sourceUrl: r.source_url,
    sourceType: r.source_type as SourceType,
    playbackCapability: r.playback_capability,
    durationSeconds: r.duration_seconds,
    isVerified: r.is_verified,
    lastVerifiedAt: r.last_verified_at,
  };
}

const SOURCE_SQL = `left join lateral (
  select source_type, source_url, duration_seconds
  from audio_sources s
  where s.track_id = t.id
  order by case s.source_type
    when 'FULL_TRACK' then 0
    when 'PREVIEW' then 1
    when 'EXTERNAL_ONLY' then 2
    else 3
  end
  limit 1
) src on true`;

export const TRACK_SELECT = `
  t.id, t.album_id, t.title, t.movie_name, t.language, t.release_year, t.category,
  t.audio_url, t.album_art_url, t.vinyl_center_label_url, t.mood_tags, t.duration,
  t.catalog_duration, t.artist, t.track_number, t.composer, t.genre, t.description,
  t.credits, t.status, t.movie_id, t.updated_at, a.title as album_title,
  src.source_type, src.source_url, src.duration_seconds as source_duration
`;

export const TRACK_FROM = `from tracks t join albums a on a.id = t.album_id ${SOURCE_SQL}`;
