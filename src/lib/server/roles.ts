import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { UserRole } from "@/lib/types";

export async function readRole(userId: string): Promise<"user" | "admin"> {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from user_roles where user_id = ${userId}`;
  return rows[0]?.role === "admin" ? "admin" : "user";
}

export async function assertAdmin(userId: string) {
  const role = await readRole(userId);
  if (role !== "admin") {
    const err = new Error("Forbidden");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}

export async function writeAudit(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  field?: string | null,
  oldValue?: string | null,
  newValue?: string | null,
) {
  const sql = await getSql();
  await sql.query(
    `insert into admin_audit_logs (admin_user_id, action, entity_type, entity_id, field, old_value, new_value)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [adminUserId, action, entityType, entityId, field ?? null, oldValue ?? null, newValue ?? null],
  );
}

export const getMyRole = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  if (!u) return { userId: null as string | null, role: "guest" as UserRole, name: null as string | null, email: null as string | null, canClaimAdmin: false };
  const sql = await getSql();
  const role = await readRole(u.id);
  const admins = await sql<{ c: number }>`select count(*)::int as c from user_roles where role = 'admin'`;
  return {
    userId: u.id,
    role: role as UserRole,
    name: null as string | null,
    email: u.email ?? null,
    canClaimAdmin: role !== "admin" && (admins[0]?.c ?? 0) === 0,
  };
});

export const claimAdminIfEmpty = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const admins = await sql<{ c: number }>`select count(*)::int as c from user_roles where role = 'admin'`;
    if ((admins[0]?.c ?? 0) > 0) {
      return { ok: false as const, role: await readRole(context.userId) };
    }
    await sql.query(
      `insert into user_roles (user_id, role) values ($1, 'admin')
       on conflict (user_id) do update set role = 'admin'`,
      [context.userId],
    );
    await writeAudit(context.userId, "claim_admin", "user_roles", context.userId);
    return { ok: true as const, role: "admin" as const };
  });
