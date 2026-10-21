import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as getSql } from "./db-DtK8jl4N.mjs";
import { t as authMiddleware } from "./middleware-D4T3645t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-BKcNoKuK.js
var getOrCreateProfile_createServerFn_handler = createServerRpc({
	id: "59e1497ab6943f8118cb3e4e57f1553cf85ed839321c10042ad7fa9443e8f0b5",
	name: "getOrCreateProfile",
	filename: "src/lib/server/profile.ts"
}, (opts) => getOrCreateProfile.__executeServer(opts));
var getOrCreateProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getOrCreateProfile_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const existing = await sql`select user_id, display_name, preferred_language, subscription_tier from user_profiles where user_id = ${context.userId}`;
	if (existing[0]) return {
		userId: existing[0].user_id,
		displayName: existing[0].display_name,
		preferredLanguage: existing[0].preferred_language,
		subscriptionTier: existing[0].subscription_tier
	};
	await sql`insert into user_profiles (user_id) values (${context.userId}) on conflict (user_id) do nothing`;
	return {
		userId: context.userId,
		displayName: null,
		preferredLanguage: "Tamil",
		subscriptionTier: "listener"
	};
});
var updateProfile_createServerFn_handler = createServerRpc({
	id: "580eb9cacacfd10e534ae986491eec3b15431475b909edd07b8eb72a9cf24ce9",
	name: "updateProfile",
	filename: "src/lib/server/profile.ts"
}, (opts) => updateProfile.__executeServer(opts));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	displayName: input.displayName?.trim().slice(0, 80) || void 0,
	preferredLanguage: input.preferredLanguage?.trim().slice(0, 32) || void 0
})).handler(updateProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await sql`insert into user_profiles (user_id) values (${context.userId}) on conflict (user_id) do nothing`;
	if (data.displayName !== void 0) await sql`update user_profiles set display_name = ${data.displayName}, updated_at = now() where user_id = ${context.userId}`;
	if (data.preferredLanguage !== void 0) await sql`update user_profiles set preferred_language = ${data.preferredLanguage}, updated_at = now() where user_id = ${context.userId}`;
	return { ok: true };
});
//#endregion
export { getOrCreateProfile_createServerFn_handler, updateProfile_createServerFn_handler };
