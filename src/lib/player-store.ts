import { create } from "zustand";
import { playbackSource, streamUrl } from "./catalog";
import { playBlockReason } from "./normalize";
import type { RepeatMode, Track } from "./types";

type SleepMode = "15" | "30" | "45" | "60" | "end" | null;

type PlayerState = {
  current: Track | null;
  queue: Track[];
  originalQueue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  expanded: boolean;
  queueOpen: boolean;
  error: string | null;
  sleepMode: SleepMode;
  sleepEndsAt: number | null;
  rate: number;
  playTrack: (track: Track, queue?: Track[]) => void;
  playAlbum: (albumId: string, startTrackId?: string) => Promise<void>;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setExpanded: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  moveInQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  retry: () => void;
  setSleep: (mode: SleepMode) => void;
  setRate: (rate: number) => void;
};

let audio: HTMLAudioElement | null = null;
let analyticsTimer: number | null = null;
let sleepTimer: number | null = null;
let lastTickAt = 0;
let secondsBucket = 0;
let analyticsAuthed = true;

function persist() {
  if (typeof window === "undefined") return;
  const s = usePlayer.getState();
  try {
    window.localStorage.setItem(
      "ochre.player",
      JSON.stringify({
        repeat: s.repeat,
        shuffle: s.shuffle,
        volume: s.volume,
        rate: s.rate,
        lastTrackId: s.current?.id,
      }),
    );
  } catch {
    /* ignore */
  }
}

function readPersist(): Partial<PlayerState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("ochre.player");
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PlayerState>;
  } catch {
    return {};
  }
}

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    const syncDuration = () => {
      const d = audio?.duration;
      usePlayer.setState({
        duration: Number.isFinite(d) && d ? d : 0,
        progress: audio?.currentTime ?? 0,
      });
    };
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", () => {
      const d = audio?.duration;
      usePlayer.setState({
        progress: audio?.currentTime ?? 0,
        duration: Number.isFinite(d) && d ? d : usePlayer.getState().duration,
      });
      const sleep = usePlayer.getState();
      if (sleep.sleepMode === "end") return;
      if (sleep.sleepEndsAt && Date.now() >= sleep.sleepEndsAt) {
        usePlayer.getState().pause();
        usePlayer.setState({ sleepMode: null, sleepEndsAt: null });
      }
    });
    audio.addEventListener("play", () => usePlayer.setState({ isPlaying: true, error: null }));
    audio.addEventListener("pause", () => usePlayer.setState({ isPlaying: false }));
    audio.addEventListener("ended", () => {
      flushAnalytics(true);
      const { repeat, current, sleepMode } = usePlayer.getState();
      if (sleepMode === "end") {
        usePlayer.setState({ sleepMode: null, sleepEndsAt: null, isPlaying: false });
        return;
      }
      if (repeat === "one" && current) {
        void loadAndPlay(current, true);
        return;
      }
      usePlayer.getState().next();
    });
    audio.addEventListener("error", () => {
      const el = audio;
      const src = el?.src ?? "";
      const cur = usePlayer.getState().current;
      if (src.includes("/api/v1/stream") && cur?.audioUrl && el?.getAttribute("data-src") !== "direct") {
        el.src = cur.audioUrl;
        el.setAttribute("data-src", "direct");
        void el.play().catch(() => {
          usePlayer.setState({
            isPlaying: false,
            error: "Unable to play this track.",
          });
        });
        return;
      }
      usePlayer.setState({
        isPlaying: false,
        error: "Unable to play this track.",
      });
    });
  }
  return audio;
}

async function loadAndPlay(track: Track, force = false) {
  const el = getAudio();
  if (!el) return;
  const { playable, url } = playbackSource(track);
  if (!playable || !url) {
    usePlayer.setState({
      isPlaying: false,
      error: playBlockReason(track.sourceType),
      duration: 0,
      progress: 0,
    });
    return;
  }
  if (force || el.getAttribute("data-track") !== track.id) {
    el.src = url.startsWith("/") ? url : streamUrl(url);
    el.setAttribute("data-track", track.id);
    el.setAttribute("data-src", "proxy");
    usePlayer.setState({ progress: 0, duration: 0, error: null });
  }
  el.playbackRate = usePlayer.getState().rate;
  try {
    await el.play();
    startAnalytics();
    bindMediaSession(track);
  } catch {
    usePlayer.setState({ isPlaying: false, error: "Unable to play this track." });
  }
}

function bindMediaSession(track: Track) {
  if (typeof navigator === "undefined" || !navigator.mediaSession) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.singers.map((s) => s.name).join(", ") || "Ilaiyaraaja",
    album: track.albumTitle ?? track.movieName,
    artwork: track.albumArtUrl ? [{ src: track.albumArtUrl, sizes: "600x600", type: "image/jpeg" }] : [],
  });
  const get = () => usePlayer.getState();
  navigator.mediaSession.setActionHandler("play", () => get().toggle());
  navigator.mediaSession.setActionHandler("pause", () => get().pause());
  navigator.mediaSession.setActionHandler("nexttrack", () => get().next());
  navigator.mediaSession.setActionHandler("previoustrack", () => get().prev());
  navigator.mediaSession.setActionHandler("seekto", (e) => {
    if (typeof e.seekTime === "number") get().seek(e.seekTime);
  });
}

function startAnalytics() {
  if (typeof window === "undefined") return;
  lastTickAt = Date.now();
  if (analyticsTimer != null) return;
  analyticsTimer = window.setInterval(() => {
    if (!usePlayer.getState().isPlaying) return;
    const now = Date.now();
    secondsBucket += (now - lastTickAt) / 1000;
    lastTickAt = now;
    if (secondsBucket >= 5) {
      const secs = Math.floor(secondsBucket);
      secondsBucket -= secs;
      void reportListening(secs, false);
    }
  }, 1000);
}

function flushAnalytics(completed: boolean) {
  const secs = Math.floor(secondsBucket);
  secondsBucket = 0;
  lastTickAt = Date.now();
  if (secs > 0 || completed) {
    void reportListening(Math.max(secs, completed ? 1 : 0), completed);
  }
}

type LocalStats = Record<string, { seconds: number; plays: number }>;

function bumpLocalStats(trackId: string, seconds: number, completed: boolean) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("ochre.listening") || "{}";
    const stats = JSON.parse(raw) as LocalStats;
    const prev = stats[trackId] ?? { seconds: 0, plays: 0 };
    prev.seconds += seconds;
    if (completed) prev.plays += 1;
    stats[trackId] = prev;
    window.localStorage.setItem("ochre.listening", JSON.stringify(stats));
  } catch {
    /* ignore quota */
  }
}

async function reportListening(seconds: number, completed: boolean) {
  const track = usePlayer.getState().current;
  if (!track || seconds < 0) return;
  bumpLocalStats(track.id, seconds, completed);
  if (!analyticsAuthed) return;
  try {
    const { logListeningTime } = await import("@/lib/server/analytics");
    await logListeningTime({ data: { trackId: track.id, seconds, completed } });
  } catch {
    analyticsAuthed = false;
  }
}

export function readLocalStats(): LocalStats {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("ochre.listening") || "{}") as LocalStats;
  } catch {
    return {};
  }
}

function shuffleRest(queue: Track[], index: number): Track[] {
  const current = queue[index];
  const rest = queue.filter((_, i) => i !== index);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return current ? [current, ...rest] : rest;
}

const saved = typeof window !== "undefined" ? readPersist() : {};

export const usePlayer = create<PlayerState>((set, get) => ({
  current: null,
  queue: [],
  originalQueue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: typeof saved.volume === "number" ? saved.volume : 0.9,
  muted: false,
  repeat: saved.repeat ?? "all",
  shuffle: Boolean(saved.shuffle),
  expanded: false,
  queueOpen: false,
  error: null,
  sleepMode: null,
  sleepEndsAt: null,
  rate: typeof saved.rate === "number" ? saved.rate : 1,

  playTrack: (track, queue) => {
    const incoming = queue && queue.length ? queue : [track];
    const idx = Math.max(0, incoming.findIndex((t) => t.id === track.id));
    const shuffled = get().shuffle ? shuffleRest(incoming, idx) : incoming;
    const nextIndex = get().shuffle ? 0 : idx;
    set({
      current: shuffled[nextIndex] ?? track,
      queue: shuffled,
      originalQueue: incoming,
      queueIndex: nextIndex,
      error: null,
      expanded: true,
    });
    persist();
    void loadAndPlay(shuffled[nextIndex] ?? track, true);
  },

  playAlbum: async (albumId, startTrackId) => {
    const { getAlbumWithTracks } = await import("./server/catalog");
    const pack = await getAlbumWithTracks({ data: albumId });
    if (!pack?.tracks.length) return;
    const start = pack.tracks.find((t) => t.id === startTrackId) ?? pack.tracks[0];
    get().playTrack(start, pack.tracks);
  },

  toggle: () => {
    const el = getAudio();
    const { current, isPlaying } = get();
    if (!current || !el) return;
    if (isPlaying) {
      el.pause();
      flushAnalytics(false);
    } else {
      void loadAndPlay(current, false);
    }
  },

  pause: () => {
    getAudio()?.pause();
    flushAnalytics(false);
  },

  next: () => {
    const { queue, queueIndex, repeat } = get();
    if (!queue.length) return;
    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeat === "off") {
        getAudio()?.pause();
        set({ isPlaying: false });
        return;
      }
      nextIndex = 0;
    }
    const track = queue[nextIndex];
    set({ queueIndex: nextIndex, current: track, progress: 0, error: null });
    void loadAndPlay(track, true);
  },

  prev: () => {
    const el = getAudio();
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    const { queue, queueIndex } = get();
    if (!queue.length) return;
    const nextIndex = (queueIndex - 1 + queue.length) % queue.length;
    const track = queue[nextIndex];
    set({ queueIndex: nextIndex, current: track, progress: 0, error: null });
    void loadAndPlay(track, true);
  },

  seek: (seconds) => {
    const el = getAudio();
    if (!el || !Number.isFinite(seconds)) return;
    const max = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : seconds;
    el.currentTime = Math.max(0, Math.min(max, seconds));
    set({ progress: el.currentTime });
  },

  setVolume: (v) => {
    const el = getAudio();
    const vol = Math.min(1, Math.max(0, v));
    if (el) el.volume = vol;
    set({ volume: vol, muted: vol === 0 });
    persist();
  },

  toggleMute: () => {
    const el = getAudio();
    const muted = !get().muted;
    if (el) el.muted = muted;
    set({ muted });
  },

  cycleRepeat: () => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const i = order.indexOf(get().repeat);
    set({ repeat: order[(i + 1) % order.length] });
    persist();
  },

  toggleShuffle: () => {
    const on = !get().shuffle;
    if (on) {
      const { queue, queueIndex, originalQueue } = get();
      const base = originalQueue.length ? originalQueue : queue;
      const currentId = queue[queueIndex]?.id;
      const idx = Math.max(0, base.findIndex((t) => t.id === currentId));
      const shuffled = shuffleRest(base, idx);
      set({ shuffle: true, queue: shuffled, queueIndex: 0, originalQueue: base });
    } else {
      const { originalQueue, current } = get();
      const idx = Math.max(0, originalQueue.findIndex((t) => t.id === current?.id));
      set({ shuffle: false, queue: originalQueue.length ? originalQueue : get().queue, queueIndex: idx });
    }
    persist();
  },

  setExpanded: (open) => set({ expanded: open, queueOpen: open ? get().queueOpen : false }),
  setQueueOpen: (open) => set({ queueOpen: open }),

  addToQueue: (track) => {
    set({ queue: [...get().queue, track], originalQueue: [...get().originalQueue, track] });
  },

  playNext: (track) => {
    const { queue, queueIndex, originalQueue } = get();
    const next = [...queue];
    next.splice(queueIndex + 1, 0, track);
    const orig = [...originalQueue];
    orig.splice(queueIndex + 1, 0, track);
    set({ queue: next, originalQueue: orig });
  },

  removeFromQueue: (index) => {
    const { queue, queueIndex, current } = get();
    const next = queue.filter((_, i) => i !== index);
    let idx = queueIndex;
    if (index < queueIndex) idx -= 1;
    if (index === queueIndex) {
      const track = next[Math.min(idx, next.length - 1)] ?? null;
      set({ queue: next, originalQueue: next, queueIndex: Math.max(0, idx), current: track });
      if (track && track.id !== current?.id) void loadAndPlay(track, true);
      if (!track) {
        getAudio()?.pause();
        set({ isPlaying: false });
      }
      return;
    }
    set({ queue: next, originalQueue: next, queueIndex: Math.max(0, idx) });
  },

  moveInQueue: (from, to) => {
    const queue = [...get().queue];
    const [item] = queue.splice(from, 1);
    queue.splice(to, 0, item);
    const currentId = get().current?.id;
    set({ queue, originalQueue: queue, queueIndex: Math.max(0, queue.findIndex((t) => t.id === currentId)) });
  },

  clearQueue: () => {
    const current = get().current;
    set({ queue: current ? [current] : [], originalQueue: current ? [current] : [], queueIndex: 0 });
  },

  retry: () => {
    const { current } = get();
    if (current) void loadAndPlay(current, true);
  },

  setSleep: (mode) => {
    if (sleepTimer && typeof window !== "undefined") {
      window.clearTimeout(sleepTimer);
      sleepTimer = null;
    }
    if (!mode) {
      set({ sleepMode: null, sleepEndsAt: null });
      return;
    }
    if (mode === "end") {
      set({ sleepMode: "end", sleepEndsAt: null });
      return;
    }
    const mins = Number(mode);
    const ends = Date.now() + mins * 60 * 1000;
    if (typeof window !== "undefined") {
      sleepTimer = window.setTimeout(() => {
        usePlayer.getState().pause();
        usePlayer.setState({ sleepMode: null, sleepEndsAt: null });
      }, mins * 60 * 1000);
    }
    set({ sleepMode: mode, sleepEndsAt: ends });
  },

  setRate: (rate) => {
    const el = getAudio();
    if (el) el.playbackRate = rate;
    set({ rate });
    persist();
  },
}));
