import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as getSql } from "./db-DtK8jl4N.mjs";
import { t as authMiddleware } from "./middleware-D4T3645t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics-yLhFK8KT.js
var logListeningTime_createServerFn_handler = createServerRpc({
	id: "b6d7734175b934ca7b7c4a71291039cc0a27bed3daa8b4fd3873b159c0378794",
	name: "logListeningTime",
	filename: "src/lib/server/analytics.ts"
}, (opts) => logListeningTime.__executeServer(opts));
var logListeningTime = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	trackId: String(input.trackId),
	seconds: Math.max(0, Math.min(3600, Math.floor(Number(input.seconds) || 0))),
	completed: Boolean(input.completed)
})).handler(logListeningTime_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const extraPlays = data.completed ? 1 : 0;
	await sql.query(`insert into user_listening_analytics (user_id, track_id, total_seconds_listened, completed_plays, last_listened_at)
       values ($1, $2, $3, $4, now())
       on conflict (user_id, track_id) do update set
         total_seconds_listened = user_listening_analytics.total_seconds_listened + excluded.total_seconds_listened,
         completed_plays = user_listening_analytics.completed_plays + excluded.completed_plays,
         last_listened_at = now()`, [
		context.userId,
		data.trackId,
		data.seconds,
		extraPlays
	]);
	return { ok: true };
});
var getListeningStats_createServerFn_handler = createServerRpc({
	id: "488b2e03921d9680a5b48f48e55a356b84c9603a347e19d91f04c8da5af5a233",
	name: "getListeningStats",
	filename: "src/lib/server/analytics.ts"
}, (opts) => getListeningStats.__executeServer(opts));
var getListeningStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getListeningStats_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const rows = await sql`
      select track_id, total_seconds_listened, completed_plays, last_listened_at
      from user_listening_analytics
      where user_id = ${context.userId}
      order by last_listened_at desc
      limit 200
    `;
	const totals = await sql`
      select coalesce(sum(total_seconds_listened),0)::int as seconds,
             coalesce(sum(completed_plays),0)::int as plays,
             count(*)::int as tracks
      from user_listening_analytics
      where user_id = ${context.userId}
    `;
	return {
		rows: rows.map((r) => ({
			trackId: r.track_id,
			totalSecondsListened: r.total_seconds_listened,
			completedPlays: r.completed_plays,
			lastListenedAt: r.last_listened_at
		})),
		totals: totals[0] ?? {
			seconds: 0,
			plays: 0,
			tracks: 0
		}
	};
});
var toggleFavorite_createServerFn_handler = createServerRpc({
	id: "b37a492d007db198d5bbbdf54a2f9431dd82a0b972958259d577803a9e629b2f",
	name: "toggleFavorite",
	filename: "src/lib/server/analytics.ts"
}, (opts) => toggleFavorite.__executeServer(opts));
var toggleFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((trackId) => String(trackId)).handler(toggleFavorite_createServerFn_handler, async ({ context, data: trackId }) => {
	const sql = await getSql();
	if ((await sql`
      select track_id from user_favorites
      where user_id = ${context.userId} and track_id = ${trackId}
    `).length) {
		await sql`delete from user_favorites where user_id = ${context.userId} and track_id = ${trackId}`;
		return { favorited: false };
	}
	await sql`insert into user_favorites (user_id, track_id) values (${context.userId}, ${trackId})`;
	return { favorited: true };
});
var listFavorites_createServerFn_handler = createServerRpc({
	id: "d82c2b6d63d963d48e0f04ce11aa523699e1fdd1ef12b50e648cca09de515489",
	name: "listFavorites",
	filename: "src/lib/server/analytics.ts"
}, (opts) => listFavorites.__executeServer(opts));
var listFavorites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listFavorites_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select track_id from user_favorites
      where user_id = ${context.userId}
      order by created_at desc
    `).map((r) => r.track_id);
});
//#endregion
export { getListeningStats_createServerFn_handler, listFavorites_createServerFn_handler, logListeningTime_createServerFn_handler, toggleFavorite_createServerFn_handler };
