import type { Track } from "./types";

export function streamUrl(audioUrl: string): string {
  if (!audioUrl) return "";
  if (audioUrl.startsWith("/")) return audioUrl;
  return `/api/v1/stream?u=${encodeURIComponent(audioUrl)}`;
}

export function artCacheUrl(url: string | null | undefined, version?: string): string {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  if (!version) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(version)}`;
}

export function playbackSource(track: Track): { url: string; playable: boolean } {
  const playable =
    Boolean(track.audioUrl) &&
    (track.sourceType === "FULL_TRACK" || track.sourceType === "PREVIEW");
  return { url: playable ? streamUrl(track.audioUrl) : "", playable };
}
