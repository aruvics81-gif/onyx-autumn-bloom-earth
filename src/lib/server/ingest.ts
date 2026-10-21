/**
 * Data fetching / aggregation strategy for OCHRE.
 *
 * Film songs are copyrighted, so the catalog uses official Apple Music /
 * iTunes 30-second previews (legal stream snippets) plus artwork from
 * mzstatic. Server-side ingest — never scrape Google Images or YouTube rips.
 *
 * Sources
 *  1. iTunes Search API  GET https://itunes.apple.com/search?term=Ilaiyaraaja&entity=album
 *  2. iTunes Lookup      GET https://itunes.apple.com/lookup?id={collectionId}&entity=song
 *  3. Optional Deezer    GET https://api.deezer.com/search?q=ilaiyaraaja  (also 30s MP3)
 *
 * Run from a trusted server (this app's createServerFn / a one-off script).
 * Preview URLs are then proxied by GET /api/v1/stream so the vinyl player
 * always has a same-origin audio source.
 */
export const ITUNES_SEARCH =
  "https://itunes.apple.com/search?term=Ilaiyaraaja&entity=album&limit=200&country=IN&media=music";

export function artworkHiRes(url: string): string {
  return url.replace("100x100bb", "600x600bb").replace("60x60bb", "600x600bb");
}

export function isAllowedAudioHost(hostname: string): boolean {
  return (
    hostname === "audio-ssl.itunes.apple.com" ||
    hostname.endsWith(".apple.com") ||
    hostname.endsWith(".mzstatic.com") ||
    hostname.endsWith(".dzcdn.net")
  );
}
