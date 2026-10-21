import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { readRole } from "./roles";

export const getOrCreateProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{
      user_id: string;
      display_name: string | null;
      preferred_language: string;
      subscription_tier: string;
      account_status: string;
      avatar_url: string | null;
    }>`select user_id, display_name, preferred_language, subscription_tier, account_status, avatar_url from user_profiles where user_id = ${context.userId}`;
    const role = await readRole(context.userId);
    if (existing[0]) {
      if (existing[0].account_status === "disabled") {
        throw new Error("Account disabled");
      }
      return {
        userId: existing[0].user_id,
        displayName: existing[0].display_name,
        preferredLanguage: existing[0].preferred_language,
        subscriptionTier: existing[0].subscription_tier,
        accountStatus: existing[0].account_status,
        avatarUrl: existing[0].avatar_url,
        role,
      };
    }
    await sql`insert into user_profiles (user_id) values (${context.userId}) on conflict (user_id) do nothing`;
    return {
      userId: context.userId,
      displayName: null,
      preferredLanguage: "Tamil",
      subscriptionTier: "listener",
      accountStatus: "active",
      avatarUrl: null,
      role,
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string; preferredLanguage?: string }) => ({
    displayName: input.displayName?.trim().slice(0, 80) || undefined,
    preferredLanguage: input.preferredLanguage?.trim().slice(0, 32) || undefined,
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into user_profiles (user_id) values (${context.userId}) on conflict (user_id) do nothing`;
    if (data.displayName !== undefined) {
      await sql`update user_profiles set display_name = ${data.displayName}, updated_at = now() where user_id = ${context.userId}`;
    }
    if (data.preferredLanguage !== undefined) {
      await sql`update user_profiles set preferred_language = ${data.preferredLanguage}, updated_at = now() where user_id = ${context.userId}`;
    }
    return { ok: true };
  });
