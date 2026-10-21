import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInGate } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { LANGUAGES } from "@/lib/moods";
import { getListeningStats } from "@/lib/server/analytics";
import { getOrCreateProfile, updateProfile } from "@/lib/server/profile";
import { claimAdminIfEmpty, getMyRole } from "@/lib/server/roles";
import { formatHours } from "@/lib/utils";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const { isPending } = useCurrentUserState();
  const user = useCurrentUser();
  return (
    <div className="px-5 pb-8 pt-6 fade-up">
      <p className="text-[11px] uppercase tracking-[0.28em] text-ochre-dark">Profile</p>
      <h1 className="mt-1 font-display text-3xl italic text-ink">Your hours with Raja</h1>
      {isPending ? <div className="mt-6 h-24 ochre-skeleton rounded-[18px]" /> : (
        <SignInGate fallback={<Guest />}>
          <Member name={user?.displayName ?? user?.primaryEmail ?? "Listener"} />
        </SignInGate>
      )}
    </div>
  );
}

function Guest() {
  return (
    <div className="mt-4">
      <p className="text-sm text-muted">
        Sign in to keep listening time, favorites, and playlists across phones, tablets, and the desk.
      </p>
      <Link to="/login" className="mt-4 inline-flex min-h-11 items-center rounded-[12px] bg-ochre px-4 text-sm font-medium text-cream">
        Sign in
      </Link>
    </div>
  );
}

function Member({ name }: { name: string }) {
  const [seconds, setSeconds] = useState(0);
  const [plays, setPlays] = useState(0);
  const [language, setLanguage] = useState("Tamil");
  const [favs, setFavs] = useState<{ song?: string; singer?: string; movie?: string; decade?: string; mood?: string }>({});
  const [canClaim, setCanClaim] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    void getOrCreateProfile().then((p) => setLanguage(p.preferredLanguage)).catch(() => undefined);
    void getListeningStats()
      .then((s) => {
        setSeconds(s.totals.seconds);
        setPlays(s.totals.plays);
        setFavs({
          song: s.favorites.song ? `${s.favorites.song.title}` : undefined,
          singer: s.favorites.singer?.name,
          movie: s.favorites.movie?.movie_name,
          decade: s.favorites.decade?.era,
          mood: s.favorites.mood?.mood,
        });
      })
      .catch(() => undefined);
    void getMyRole().then((r) => {
      setCanClaim(r.canClaimAdmin);
      setIsAdmin(r.role === "admin");
    });
  }, []);

  return (
    <div className="mt-4">
      <p className="font-display text-xl text-ink">{name}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Time listened" value={formatHours(seconds)} />
        <Stat label="Songs played" value={String(plays)} />
        <Stat label="Favorite song" value={favs.song || "—"} />
        <Stat label="Favorite singer" value={favs.singer || "—"} />
        <Stat label="Favorite movie" value={favs.movie || "—"} />
        <Stat label="Favorite decade" value={favs.decade || "—"} />
        <Stat label="Favorite mood" value={favs.mood || "—"} />
      </div>
      <label className="mt-6 block">
        <span className="text-xs font-medium text-muted">Preferred language</span>
        <select
          value={language}
          onChange={(e) => {
            const next = e.target.value;
            setLanguage(next);
            void updateProfile({ data: { preferredLanguage: next } });
          }}
          className="mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3 text-sm text-ink"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>
      {isAdmin ? (
        <Link to="/admin" className="mt-6 inline-flex min-h-11 items-center rounded-[12px] bg-ochre px-4 text-sm text-cream">
          Open curator desk
        </Link>
      ) : canClaim ? (
        <button
          type="button"
          className="mt-6 inline-flex min-h-11 items-center rounded-[12px] border border-border px-4 text-sm"
          onClick={() => {
            void claimAdminIfEmpty().then((r) => {
              if (r.ok) window.location.href = "/admin";
            });
          }}
        >
          Claim the curator desk
        </button>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-cream px-4 py-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-1 font-display text-xl text-ink">{value}</p>
    </div>
  );
}
