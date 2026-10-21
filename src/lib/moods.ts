import type { MoodId } from "./types";

export type MoodDef = {
  id: MoodId;
  label: string;
  line: string;
  swatch: string;
};

/** Earth-family wheel — ochre, umber, sienna, dusk brass. */
export const MOODS: MoodDef[] = [
  {
    id: "earthy-folk",
    label: "Earthy Folk",
    line: "Nattupura soil, nadaswaram, village dust.",
    swatch: "#A65B32",
  },
  {
    id: "rain",
    label: "Rain Songs",
    line: "Monsoon strings and a flute behind the shutters.",
    swatch: "#7A8B7A",
  },
  {
    id: "romance",
    label: "Romance",
    line: "Poove, thenral, a glance held one bar too long.",
    swatch: "#C87D55",
  },
  {
    id: "melancholy",
    label: "Melancholy",
    line: "Pathos violin — the Raja signature ache.",
    swatch: "#6B3A28",
  },
  {
    id: "elevation",
    label: "Mass / Elevation",
    line: "Brass stabs, dholak fire, a hero's walk.",
    swatch: "#8B4513",
  },
  {
    id: "classical",
    label: "Classical Fusion",
    line: "Raga counterpoint, veena against a western line.",
    swatch: "#C4A574",
  },
  {
    id: "nostalgia",
    label: "Nostalgia",
    line: "Aged tape, Madras evenings, analog warmth.",
    swatch: "#D4A574",
  },
  {
    id: "dusk-longing",
    label: "Dusk Longing",
    line: "Ilaya nila — guitar, neon, the long way home.",
    swatch: "#9A5B3C",
  },
  {
    id: "celebration",
    label: "Celebration",
    line: "Wedding horns, folk bounce, laughter in 4/4.",
    swatch: "#E0A060",
  },
  {
    id: "spiritual",
    label: "Spiritual",
    line: "Temple bells, oratorio, a raga as prayer.",
    swatch: "#B8895A",
  },
];

export const MOOD_BY_ID = Object.fromEntries(MOODS.map((m) => [m.id, m])) as Record<
  MoodId,
  MoodDef
>;

export const LANGUAGES = [
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Hindi",
  "Instrumental",
] as const;

export const ERAS = [
  { id: "70s", label: "1970s", range: "The first flight" },
  { id: "80s", label: "1980s", range: "The golden analog years" },
  { id: "90s", label: "1990s", range: "Folk kings & film sagas" },
  { id: "2000s", label: "2000s+", range: "Late style & scores" },
] as const;
