import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { adminStats } from "@/lib/server/admin";
import type { AdminStats } from "@/lib/types";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  return (
    <AdminGuard>
      <Dash />
    </AdminGuard>
  );
}

function Dash() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => {
    void adminStats().then(setStats);
  }, []);
  if (!stats) return <div className="h-48 ochre-skeleton rounded-[18px]" />;
  const cards: Array<{ label: string; value: number; to?: string }> = [
    { label: "Total Users", value: stats.users, to: "/admin/users" },
    { label: "Total Songs", value: stats.songs, to: "/admin/songs" },
    { label: "Total Albums", value: stats.albums, to: "/admin/albums" },
    { label: "Total Movies", value: stats.movies, to: "/admin/movies" },
    { label: "Total Singers", value: stats.singers, to: "/admin/singers" },
    { label: "Total Lyricists", value: stats.lyricists, to: "/admin/lyricists" },
    { label: "Playable Tracks", value: stats.playable, to: "/admin/audio-sources" },
    { label: "Metadata-only Tracks", value: stats.metadataOnly, to: "/admin/songs" },
    { label: "Missing Artwork", value: stats.missingArtwork, to: "/admin/artwork" },
    { label: "Unverified Audio Sources", value: stats.unverifiedSources, to: "/admin/verification" },
    { label: "Broken Sources", value: stats.brokenSources, to: "/admin/verification" },
  ];
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-ochre-dark">Curator</p>
      <h1 className="font-display text-4xl italic text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Live counts from the archive database — never placeholders.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to || "/admin"}
            className="rounded-[18px] border border-border bg-cream px-4 py-4"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{c.label}</p>
            <p className="mt-1 font-display text-3xl tabular-nums text-ink">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
