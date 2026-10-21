import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { c as filterTracks, l as getAlbum, n as ALL_TRACKS, p as tracksForAlbum, t as ALL_ALBUMS } from "./catalog-HuPloD0r.mjs";
import { r as getSql } from "./db-DtK8jl4N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-BDGE-4Pi.js
var seeding = null;
async function ensureCatalogSeeded() {
	if (seeding) return seeding;
	seeding = (async () => {
		const sql = await getSql();
		if (((await sql`select count(*)::int as c from albums`)[0]?.c ?? 0) > 0) return;
		for (const a of ALL_ALBUMS) await sql.query(`insert into albums (id, title, movie_name, language, release_year, era, cover_url, category, moods, description, track_count, featured)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9::text[],$10,$11,$12)
         on conflict (id) do nothing`, [
			a.id,
			a.title,
			a.movieName,
			a.language,
			a.releaseYear,
			a.era,
			a.coverUrl,
			a.category,
			a.moods,
			a.description,
			a.trackCount,
			a.featured
		]);
		for (const t of ALL_TRACKS) await sql.query(`insert into tracks (id, album_id, title, movie_name, language, release_year, category, audio_url, album_art_url, vinyl_center_label_url, mood_tags, duration, artist, track_number)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::text[],$12,$13,$14)
         on conflict (id) do nothing`, [
			t.id,
			t.albumId,
			t.title,
			t.movieName,
			t.language,
			t.releaseYear,
			t.category,
			t.audioUrl,
			t.albumArtUrl,
			t.vinylCenterLabelUrl,
			t.moods,
			t.duration,
			t.artist,
			t.trackNumber
		]);
	})().catch((err) => {
		seeding = null;
		console.error("[ochre] catalog seed failed", err);
	});
	return seeding;
}
var seedCatalog_createServerFn_handler = createServerRpc({
	id: "1bf683354c16a85c12cfe05f88c4eae7c82cea31b2463aeeae8bf69932cdb559",
	name: "seedCatalog",
	filename: "src/lib/server/catalog.ts"
}, (opts) => seedCatalog.__executeServer(opts));
var seedCatalog = createServerFn({ method: "POST" }).handler(seedCatalog_createServerFn_handler, async () => {
	await ensureCatalogSeeded();
	return {
		albums: ALL_ALBUMS.length,
		tracks: ALL_TRACKS.length
	};
});
var listTracks_createServerFn_handler = createServerRpc({
	id: "3477411c74fc22179fbbf6fd30482de6198fe8169748bd8bfc9e95f552573cbb",
	name: "listTracks",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listTracks.__executeServer(opts));
var listTracks = createServerFn({ method: "GET" }).validator((input) => input ?? {}).handler(listTracks_createServerFn_handler, async ({ data }) => {
	return filterTracks(data ?? {});
});
var getAlbumWithTracks_createServerFn_handler = createServerRpc({
	id: "600eebfcfae5a1f97071b5d6007ccc8d0d6fcac380a585881e3bb7b1ec7759af",
	name: "getAlbumWithTracks",
	filename: "src/lib/server/catalog.ts"
}, (opts) => getAlbumWithTracks.__executeServer(opts));
var getAlbumWithTracks = createServerFn({ method: "GET" }).validator((albumId) => albumId).handler(getAlbumWithTracks_createServerFn_handler, async ({ data: albumId }) => {
	const album = getAlbum(albumId);
	if (!album) return null;
	return {
		album,
		tracks: tracksForAlbum(albumId)
	};
});
var recommendByMood_createServerFn_handler = createServerRpc({
	id: "db9c7c1326a73438bf0b8c9c57adbc494b752b892d7e34c420bc110e8344b946",
	name: "recommendByMood",
	filename: "src/lib/server/catalog.ts"
}, (opts) => recommendByMood.__executeServer(opts));
var recommendByMood = createServerFn({ method: "GET" }).validator((mood) => mood).handler(recommendByMood_createServerFn_handler, async ({ data: mood }) => {
	const { tracks, total } = filterTracks({
		mood,
		limit: 24
	});
	return {
		mood,
		total,
		tracks
	};
});
//#endregion
export { getAlbumWithTracks_createServerFn_handler, listTracks_createServerFn_handler, recommendByMood_createServerFn_handler, seedCatalog_createServerFn_handler };
