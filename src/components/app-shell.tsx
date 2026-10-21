import { Link, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  Disc3,
  Heart,
  LayoutDashboard,
  Library,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AuthSlot } from "@/components/auth-slot";
import { FullPlayer } from "@/components/full-player";
import { MiniPlayer } from "@/components/mini-player";
import { QueuePanel } from "@/components/queue-panel";
import { seedCatalog } from "@/lib/server/catalog";
import { getMyRole } from "@/lib/server/roles";
import { usePlayer } from "@/lib/player-store";
import { cn } from "@/lib/utils";

const USER_NAV = [
  { to: "/", label: "Home", icon: Disc3 },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

const ADMIN_NAV: Array<{ to: string; label: string; group: string }> = [
  { group: "Overview", to: "/admin", label: "Dashboard" },
  { group: "Overview", to: "/admin/analytics", label: "Listening Analytics" },
  { group: "Catalog", to: "/admin/songs", label: "Songs" },
  { group: "Catalog", to: "/admin/albums", label: "Albums" },
  { group: "Catalog", to: "/admin/movies", label: "Movies" },
  { group: "Catalog", to: "/admin/bgm", label: "BGM / Scores" },
  { group: "People", to: "/admin/singers", label: "Singers" },
  { group: "People", to: "/admin/lyricists", label: "Lyricists" },
  { group: "People", to: "/admin/artists", label: "Artists" },
  { group: "Taxonomy", to: "/admin/genres", label: "Genres" },
  { group: "Taxonomy", to: "/admin/moods", label: "Moods" },
  { group: "Taxonomy", to: "/admin/languages", label: "Languages" },
  { group: "Media", to: "/admin/artwork", label: "Artwork" },
  { group: "Media", to: "/admin/audio-sources", label: "Audio Sources" },
  { group: "Media", to: "/admin/verification", label: "Source Verification" },
  { group: "Community", to: "/admin/users", label: "Users" },
  { group: "Community", to: "/admin/playlists", label: "Playlists / Collections" },
  { group: "Tools", to: "/admin/import", label: "Data Import" },
  { group: "Tools", to: "/admin/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [role, setRole] = useState<"guest" | "user" | "admin">("guest");

  useEffect(() => {
    void seedCatalog().catch(() => undefined);
    void getMyRole()
      .then((r) => setRole(r.role))
      .catch(() => setRole("guest"));
  }, [pathname]);

  if (pathname === "/login") {
    return (
      <div className="paper-grain min-h-dvh">
        {children}
      </div>
    );
  }

  if (pathname.startsWith("/admin")) {
    return <AdminShell pathname={pathname}>{children}</AdminShell>;
  }

  return (
    <UserShell pathname={pathname} isAdmin={role === "admin"}>
      {children}
    </UserShell>
  );
}

function UserShell({
  children,
  pathname,
  isAdmin,
}: {
  children: ReactNode;
  pathname: string;
  isAdmin: boolean;
}) {
  const current = usePlayer((s) => s.current);

  return (
    <div className="user-shell paper-grain">
      <header className="sticky top-0 z-30 col-span-full flex items-center justify-between gap-3 border-b border-border/70 bg-paper/90 px-4 py-3 backdrop-blur-md">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl italic tracking-tight text-ochre-dark">OCHRE</span>
          <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted sm:inline">
            Ilaiyaraaja museum
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {USER_NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm",
                  active ? "bg-ochre text-cream" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link to="/admin" className="hidden rounded-full border border-border px-3 py-1.5 text-xs text-ochre-dark sm:inline">
              Curator desk
            </Link>
          ) : null}
          <AuthSlot />
        </div>
      </header>

      <aside className="hidden border-r border-border/70 p-4 lg:flex lg:flex-col lg:gap-2">
        <p className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted">Listen</p>
        {USER_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to) && item.to !== "/";
          const isHome = item.to === "/" && pathname === "/";
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-[12px] px-3 text-sm",
                active || isHome ? "bg-ochre/15 text-ochre-dark" : "text-ink/80 hover:bg-cream",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </aside>

      <main className="min-w-0 pb-32 lg:pb-8">{children}</main>

      <aside className="hidden border-l border-border/70 p-4 xl:block">
        {current ? <QueuePanel /> : (
          <div className="rounded-[18px] border border-border bg-cream/70 p-4 text-sm text-muted">
            Drop a needle. The queue will gather here.
          </div>
        )}
      </aside>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:left-[220px] xl:right-[320px]">
        <MiniPlayer />
        <nav className="pointer-events-auto border-t border-border bg-paper/95 px-2 pt-1 backdrop-blur-md safe-bottom lg:hidden">
          <ul className="grid grid-cols-5">
            {USER_NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px]",
                      active ? "text-ochre-dark" : "text-muted",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <FullPlayer />
    </div>
  );
}

function AdminShell({ children, pathname }: { children: ReactNode; pathname: string }) {
  const [open, setOpen] = useState(false);
  const groups = [...new Set(ADMIN_NAV.map((n) => n.group))];

  return (
    <div className="admin-shell paper-grain">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-paper/95 px-4 py-3 md:hidden">
        <button type="button" className="grid size-11 place-items-center" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </button>
        <span className="font-display italic text-ochre-dark">Curator</span>
        <AuthSlot />
      </header>
      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/40 md:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-[80%] max-w-xs overflow-y-auto bg-paper p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-xl italic text-ochre-dark">OCHRE</span>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <AdminLinks pathname={pathname} groups={groups} onClick={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <aside className="hidden overflow-y-auto border-r border-border bg-cream/50 p-4 md:block">
        <Link to="/admin" className="font-display text-2xl italic text-ochre-dark">OCHRE</Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">Curator desk</p>
        <div className="mt-6">
          <AdminLinks pathname={pathname} groups={groups} />
        </div>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm text-ochre-dark">
          <Heart className="size-4" /> Listener app
        </Link>
        <div className="mt-4"><AuthSlot /></div>
      </aside>
      <main className="min-w-0 bg-paper p-4 md:p-8">{children}</main>
    </div>
  );
}

function AdminLinks({
  pathname,
  groups,
  onClick,
}: {
  pathname: string;
  groups: string[];
  onClick?: () => void;
}) {
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g}>
          <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted">{g}</p>
          <ul className="mt-1 space-y-0.5">
            {ADMIN_NAV.filter((n) => n.group === g).map((item) => {
              const active = item.to === "/admin" ? pathname === "/admin" : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClick}
                    className={cn(
                      "flex min-h-10 items-center rounded-[10px] px-2 text-sm",
                      active ? "bg-ochre text-cream" : "text-ink hover:bg-paper-3",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export { LayoutDashboard };
