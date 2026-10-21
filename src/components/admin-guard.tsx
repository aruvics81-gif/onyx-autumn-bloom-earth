import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { claimAdminIfEmpty, getMyRole } from "@/lib/server/roles";
import { Button } from "./ui/button";

export function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"load" | "ok" | "claim" | "no">("load");

  useEffect(() => {
    void getMyRole().then((r) => {
      if (r.role === "admin") setState("ok");
      else if (r.canClaimAdmin) setState("claim");
      else setState("no");
    });
  }, []);

  if (state === "load") return <div className="h-40 ochre-skeleton rounded-[18px]" />;
  if (state === "claim") {
    return (
      <div className="max-w-md">
        <h1 className="font-display text-3xl italic">The desk is unclaimed</h1>
        <p className="mt-2 text-sm text-muted">
          No curator exists yet. Claiming makes this account the administrator — catalog edits, users, and imports.
        </p>
        <Button
          className="mt-4"
          onClick={() => {
            void claimAdminIfEmpty().then((r) => {
              if (r.ok) window.location.reload();
            });
          }}
        >
          Claim curator desk
        </Button>
      </div>
    );
  }
  if (state === "no") {
    return (
      <div>
        <h1 className="font-display text-3xl">Forbidden</h1>
        <p className="mt-2 text-sm text-muted">This desk is for curators only. Listener controls live in the museum.</p>
        <Link to="/" className="mt-4 inline-block text-ochre-dark">Return to the studio</Link>
      </div>
    );
  }
  return <>{children}</>;
}
