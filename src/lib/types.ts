export type Language =
  | "Tamil"
  | "Telugu"
  | "Malayalam"
  | "Kannada"
  | "Hindi"
  | "Instrumental";

export type Era = "70s" | "80s" | "90s" | "2000s";

export type Category = "song" | "bgm";

export type SourceType = "FULL_TRACK" | "PREVIEW" | "EXTERNAL_ONLY" | "UNAVAILABLE";

export type RepeatMode = "off" | "all" | "one";

export type UserRole = "guest" | "user" | "admin";

export type TrackStatus = "active" | "archived" | "metadata_only";

export type MoodId =
  | "earthy-folk"
  | "rain"
  | "romance"
  | "melancholy"
  | "elevation"
  | "classical"
  | "nostalgia"
  | "dusk-longing"
  | "celebration"
  | "spiritual"
  | "youth";

export type CreditPerson = {
  id: string;
  name: string;
  photoUrl?: string | null;
};

export type AudioSource = {
  id: string;
  trackId: string;
  provider: string;
  providerTrackId: string | null;
  sourceUrl: string | null;
  sourceType: SourceType;
  playbackCapability: string;
  durationSeconds: number | null;
  isVerified: boolean;
  lastVerifiedAt: string | null;
};

export type Album = {
  id: string;
  title: string;
  movieName: string;
  movieId: string | null;
  language: Language | string;
  releaseYear: number;
  era: Era | string;
  coverUrl: string;
  category: Category | string;
  albumType: string;
  moods: string[];
  description: string;
  trackCount: number;
  featured: boolean;
  status: string;
  updatedAt?: string;
};

export type Track = {
  id: string;
  albumId: string;
  albumTitle?: string;
  title: string;
  movieName: string;
  movieId?: string | null;
  language: Language | string;
  releaseYear: number;
  category: Category | string;
  audioUrl: string;
  albumArtUrl: string;
  vinylCenterLabelUrl: string;
  moods: string[];
  duration: number;
  catalogDuration: number;
  artist: string;
  trackNumber: number;
  composer: string;
  genre: string | null;
  description: string | null;
  credits: string | null;
  status: string;
  sourceType: SourceType;
  sourceUrl: string | null;
  officialUrl: string | null;
  singers: CreditPerson[];
  lyricists: CreditPerson[];
  updatedAt?: string;
};

export type Movie = {
  id: string;
  name: string;
  releaseYear: number | null;
  language: string | null;
  posterUrl: string | null;
  description: string | null;
  director: string | null;
  production: string | null;
  status: string;
  trackCount?: number;
};

export type Singer = {
  id: string;
  name: string;
  photoUrl: string | null;
  photoSource: string | null;
  photoLicense: string | null;
  biography: string | null;
  languages: string[];
  externalUrl: string | null;
  status: string;
  songCount?: number;
};

export type Lyricist = {
  id: string;
  name: string;
  photoUrl: string | null;
  photoSource: string | null;
  photoLicense: string | null;
  biography: string | null;
  knownWorks: string | null;
  status: string;
  songCount?: number;
};

export type Artist = {
  id: string;
  name: string;
  photoUrl: string | null;
  photoSource: string | null;
  photoLicense: string | null;
  biography: string | null;
  roleLabel: string | null;
  status: string;
};

export type Playlist = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  trackCount?: number;
  createdAt: string;
};

export type ListeningRow = {
  trackId: string;
  totalSecondsListened: number;
  completedPlays: number;
  lastListenedAt: string;
};

export type UserProfile = {
  userId: string;
  displayName: string | null;
  preferredLanguage: string;
  subscriptionTier: string;
  accountStatus: string;
  avatarUrl: string | null;
  role: UserRole;
};

export type AdminStats = {
  users: number;
  songs: number;
  albums: number;
  movies: number;
  singers: number;
  lyricists: number;
  playable: number;
  metadataOnly: number;
  missingArtwork: number;
  unverifiedSources: number;
  brokenSources: number;
};

export type AuditLog = {
  id: number;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
};
