const ALIASES: Record<string, string> = {
  chitra: "K.S. Chithra",
  "k.s. chithra": "K.S. Chithra",
  "k. s. chithra": "K.S. Chithra",
  "ks chithra": "K.S. Chithra",
  "s.p. balasubrahmanyam": "S.P. Balasubrahmanyam",
  "s. p. balasubrahmanyam": "S.P. Balasubrahmanyam",
  "s.p.balasubrahmanyam": "S.P. Balasubrahmanyam",
  spb: "S.P. Balasubrahmanyam",
  "s. janaki": "S. Janaki",
  "s.janaki": "S. Janaki",
  "k. j. yesudas": "K. J. Yesudas",
  "k.j. yesudas": "K. J. Yesudas",
  "kj yesudas": "K. J. Yesudas",
  yesudas: "K. J. Yesudas",
  vaalee: "Vaali",
  vaali: "Vaali",
  "vani jairam": "Vani Jairam",
  "vani jayaram": "Vani Jairam",
  "s.p.sailaja": "S. P. Sailaja",
  "s. p. sailaja": "S. P. Sailaja",
  "s.p. sailaja": "S. P. Sailaja",
  ilaiyaraaja: "Ilaiyaraaja",
  ilayaraja: "Ilaiyaraaja",
  ilayaraaja: "Ilaiyaraaja",
  ilaiyaraja: "Ilaiyaraaja",
  "i. raja": "Ilaiyaraaja",
  isaignani: "Ilaiyaraaja",
};

export const LYRICIST_CANON = new Set(
  [
    "Vaali",
    "Vairamuthu",
    "Palani Bharathi",
    "Pulamaipithan",
    "Muthulingam",
    "Na. Kamarajan",
    "Kannadasan",
    "Mu. Metha",
    "Na. Muthukumar",
    "Yugabharathi",
    "Thamarai",
    "Kabilan",
    "Panchu Arunachalam",
    "Gangai Amaran",
  ].map((n) => n.toLowerCase()),
);

const LYRICIST_ALIASES: Record<string, string> = {
  vaalee: "Vaali",
  vaali: "Vaali",
  palanibharathi: "Palani Bharathi",
  "palani bharathi": "Palani Bharathi",
  "gangai amaren": "Gangai Amaran",
};

export function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function slugify(s: string): string {
  const f = fold(s).replace(/\s+/g, "");
  return f.slice(0, 72) || "item";
}

export function canonicalPersonName(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const key = fold(cleaned);
  return ALIASES[key] || LYRICIST_ALIASES[key] || cleaned;
}

export function splitCredits(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/\s*(?:,|&|\/| and | feat\.? | ft\.? | with | x )\s*/i)
    .map((p) => canonicalPersonName(p.replace(/\s+/g, " ").trim()))
    .filter(Boolean);
}

export function isLikelyLyricist(name: string): boolean {
  return LYRICIST_CANON.has(fold(canonicalPersonName(name)));
}

export function eraFromYear(year: number): string {
  if (year < 1980) return "70s";
  if (year < 1990) return "80s";
  if (year < 2000) return "90s";
  return "2000s";
}

export function searchBlob(...parts: Array<string | null | undefined>): string {
  const aliases = ["ilaiyaraaja", "ilayaraja", "ilayaraaja", "ilaiyaraja", "isaignani"];
  const base = parts.filter(Boolean).join(" ").toLowerCase();
  return `${base} ${aliases.join(" ")}`;
}

export function officialSearchUrl(title: string, extra?: string): string {
  const q = [title, extra, "Ilaiyaraaja"].filter(Boolean).join(" ");
  return `https://music.apple.com/search?term=${encodeURIComponent(q)}`;
}

export function previewLabel(sourceType: string, actualSeconds?: number | null): string | null {
  if (sourceType === "FULL_TRACK") return null;
  if (sourceType === "UNAVAILABLE") return "Unavailable";
  if (sourceType === "EXTERNAL_ONLY") return "Official source only";
  if (sourceType !== "PREVIEW") return null;
  if (actualSeconds && Number.isFinite(actualSeconds) && actualSeconds > 1) {
    return `${Math.round(actualSeconds)}-second preview`;
  }
  return "Preview";
}

export function playBlockReason(sourceType: string): string {
  if (sourceType === "EXTERNAL_ONLY") {
    return "This recording is not licensed for in-app playback. Open the official source.";
  }
  if (sourceType === "UNAVAILABLE") return "No audio file is attached to this song.";
  if (sourceType === "PREVIEW") return "The preview file could not be played.";
  return "Unable to play this track.";
}
