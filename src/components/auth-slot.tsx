import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-ink/10" />;
  }
  if (user) {
    return (
      <div className="max-w-[46vw] overflow-hidden">
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      className="inline-flex h-9 items-center rounded-full border border-border bg-cream px-3 text-sm font-medium text-ink"
    >
      Sign in
    </Link>
  );
}
