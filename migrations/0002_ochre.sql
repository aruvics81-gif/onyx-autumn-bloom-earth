-- OCHRE catalog + per-user listening
create table if not exists albums (
  id            text primary key,
  title         text not null,
  movie_name    text not null,
  language      text not null,
  release_year  int not null,
  era           text not null,
  cover_url     text not null,
  category      text not null,
  moods         text[] not null default '{}',
  description   text,
  track_count   int not null default 0,
  featured      boolean not null default false
);

create table if not exists tracks (
  id                      text primary key,
  album_id                text not null references albums(id) on delete cascade,
  title                   text not null,
  movie_name              text not null,
  language                text not null,
  release_year            int not null,
  category                text not null,
  audio_url               text not null,
  album_art_url           text not null,
  vinyl_center_label_url  text,
  mood_tags               text[] not null default '{}',
  duration                int not null default 30,
  artist                  text,
  track_number            int not null default 1
);

create index if not exists tracks_album_id_idx on tracks (album_id);
create index if not exists tracks_language_idx on tracks (language);
create index if not exists tracks_category_idx on tracks (category);

create table if not exists user_profiles (
  user_id             text primary key,
  display_name        text,
  preferred_language  text not null default 'Tamil',
  subscription_tier   text not null default 'listener',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists user_listening_analytics (
  id                     serial primary key,
  user_id                text not null,
  track_id               text not null,
  total_seconds_listened int not null default 0,
  completed_plays        int not null default 0,
  last_listened_at       timestamptz not null default now(),
  unique (user_id, track_id)
);

create index if not exists ula_user_id_idx on user_listening_analytics (user_id);

create table if not exists user_favorites (
  user_id    text not null,
  track_id   text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);
