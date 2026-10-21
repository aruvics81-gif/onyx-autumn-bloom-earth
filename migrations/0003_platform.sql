-- OCHRE platform: roles, catalog graph, sources, playlists, audit
-- 0002 is already applied; only additive changes here.

alter table albums add column if not exists album_type text not null default 'film_soundtrack';
alter table albums add column if not exists movie_id text;
alter table albums add column if not exists status text not null default 'active';
alter table albums add column if not exists updated_at timestamptz not null default now();
alter table albums add column if not exists search_text text not null default '';

alter table tracks add column if not exists composer text not null default 'Ilaiyaraaja';
alter table tracks add column if not exists genre text;
alter table tracks add column if not exists description text;
alter table tracks add column if not exists credits text;
alter table tracks add column if not exists status text not null default 'active';
alter table tracks add column if not exists catalog_duration int not null default 0;
alter table tracks add column if not exists search_text text not null default '';
alter table tracks add column if not exists updated_at timestamptz not null default now();
alter table tracks add column if not exists movie_id text;

alter table user_profiles add column if not exists account_status text not null default 'active';
alter table user_profiles add column if not exists last_active_at timestamptz;
alter table user_profiles add column if not exists avatar_url text;
alter table user_profiles add column if not exists role_cache text;

create table if not exists app_meta (
  key   text primary key,
  value text not null
);

create table if not exists user_roles (
  user_id    text primary key,
  role       text not null check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists movies (
  id            text primary key,
  name          text not null,
  release_year  int,
  language      text,
  poster_url    text,
  description   text,
  director      text,
  production    text,
  status        text not null default 'active',
  search_text   text not null default '',
  updated_at    timestamptz not null default now()
);

create table if not exists singers (
  id            text primary key,
  name          text not null,
  photo_url     text,
  photo_source  text,
  photo_license text,
  biography     text,
  languages     text[] not null default '{}',
  external_url  text,
  status        text not null default 'active',
  search_text   text not null default '',
  updated_at    timestamptz not null default now()
);

create table if not exists lyricists (
  id            text primary key,
  name          text not null,
  photo_url     text,
  photo_source  text,
  photo_license text,
  biography     text,
  known_works   text,
  status        text not null default 'active',
  search_text   text not null default '',
  updated_at    timestamptz not null default now()
);

create table if not exists artists (
  id            text primary key,
  name          text not null,
  photo_url     text,
  photo_source  text,
  photo_license text,
  biography     text,
  role_label    text,
  status        text not null default 'active',
  search_text   text not null default '',
  updated_at    timestamptz not null default now()
);

create table if not exists genres (
  id          text primary key,
  name        text not null unique,
  description text
);

create table if not exists mood_defs (
  id          text primary key,
  name        text not null,
  description text,
  swatch      text
);

create table if not exists languages (
  id   text primary key,
  name text not null unique
);

create table if not exists track_singers (
  track_id  text not null references tracks(id) on delete cascade,
  singer_id text not null references singers(id) on delete cascade,
  position  int not null default 1,
  primary key (track_id, singer_id)
);

create table if not exists track_lyricists (
  track_id     text not null references tracks(id) on delete cascade,
  lyricist_id  text not null references lyricists(id) on delete cascade,
  position     int not null default 1,
  primary key (track_id, lyricist_id)
);

create table if not exists album_artists (
  album_id  text not null references albums(id) on delete cascade,
  artist_id text not null references artists(id) on delete cascade,
  role      text,
  primary key (album_id, artist_id)
);

create table if not exists audio_sources (
  id                   text primary key,
  track_id             text not null references tracks(id) on delete cascade,
  provider             text not null,
  provider_track_id    text,
  source_url           text,
  source_type          text not null check (source_type in ('FULL_TRACK','PREVIEW','EXTERNAL_ONLY','UNAVAILABLE')),
  playback_capability  text not null default 'none',
  duration_seconds     int,
  is_verified          boolean not null default false,
  last_verified_at     timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists audio_sources_track_id_idx on audio_sources (track_id);

create table if not exists images (
  id             text primary key,
  entity_type    text not null,
  entity_id      text not null,
  url            text not null,
  source         text,
  source_url     text,
  license_status text,
  attribution    text,
  verified_by    text,
  verified_at    timestamptz,
  width          int,
  height         int,
  uploaded_at    timestamptz not null default now()
);

create index if not exists images_entity_idx on images (entity_type, entity_id);

create table if not exists playlists (
  id          text primary key,
  user_id     text not null,
  title       text not null,
  description text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists playlists_user_id_idx on playlists (user_id);

create table if not exists playlist_tracks (
  playlist_id text not null references playlists(id) on delete cascade,
  track_id    text not null,
  position    int not null default 1,
  added_at    timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create table if not exists listening_history (
  id                serial primary key,
  user_id           text not null,
  track_id          text not null,
  listened_seconds  int not null default 0,
  completed         boolean not null default false,
  played_at         timestamptz not null default now()
);

create index if not exists listening_history_user_idx on listening_history (user_id, played_at desc);

create table if not exists admin_audit_logs (
  id            serial primary key,
  admin_user_id text not null,
  action        text not null,
  entity_type   text not null,
  entity_id     text,
  field         text,
  old_value     text,
  new_value     text,
  created_at    timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_idx on admin_audit_logs (created_at desc);

create index if not exists tracks_search_idx on tracks (search_text);
create index if not exists albums_search_idx on albums (search_text);
create index if not exists singers_search_idx on singers (search_text);
create index if not exists movies_search_idx on movies (search_text);
create index if not exists tracks_status_idx on tracks (status);
create index if not exists albums_status_idx on albums (status);
create index if not exists albums_movie_id_idx on albums (movie_id);
