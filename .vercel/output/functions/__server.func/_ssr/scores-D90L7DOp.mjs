import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as bgmTracks, i as bgmAlbums, r as albumsByMood } from "./catalog-HuPloD0r.mjs";
import { r as MOODS } from "./moods-CbakLCT1.mjs";
import { t as TrackList } from "./track-list-BEbRLhfN.mjs";
import { t as AlbumGrid } from "./coverflow-De4YHz-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scores-D90L7DOp.js
var import_jsx_runtime = require_jsx_runtime();
function Scores() {
	const bgm = bgmAlbums();
	const cues = bgmTracks().slice(0, 20);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.28em] text-ochre-dark",
						children: "BGM & film scores"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl italic text-ink",
						children: "Music for the scene"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-lg text-sm text-muted",
						children: "Background scores, fusion suites, and the rooms between songs — How to Name It, film cues, and the orchestra when no one is singing."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "px-5 font-display text-xl text-ink",
					children: "Score pressings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlbumGrid, { albums: bgm.length ? bgm : albumsByMood("classical").slice(0, 12) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-5 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl text-ink",
					children: "By scene"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-2",
					children: [
						{
							mood: "nostalgia",
							label: "Nostalgia"
						},
						{
							mood: "melancholy",
							label: "Melancholy"
						},
						{
							mood: "elevation",
							label: "Mass / Elevation"
						},
						{
							mood: "classical",
							label: "Classical counterpoint"
						},
						{
							mood: "romance",
							label: "Romance"
						}
					].map((s) => {
						const meta = MOODS.find((m) => m.id === s.mood);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/moods",
							search: { mood: s.mood },
							className: "flex items-center justify-between rounded-[16px] border border-border bg-cream px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-medium text-ink",
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs text-muted",
								children: meta?.line
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-3 rounded-full",
								style: { background: meta?.swatch }
							})]
						}, s.mood);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-5 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl text-ink",
					children: "Cues on the reel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackList, { tracks: cues })]
			})
		]
	});
}
//#endregion
export { Scores as component };
