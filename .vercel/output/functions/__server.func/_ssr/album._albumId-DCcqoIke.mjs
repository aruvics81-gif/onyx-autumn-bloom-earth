import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as getAlbum, p as tracksForAlbum } from "./catalog-HuPloD0r.mjs";
import { l as Play } from "../_libs/lucide-react.mjs";
import { c as usePlayer, n as Route$5, o as VinylDisc } from "./router-CM1X38DT.mjs";
import { i as MOOD_BY_ID } from "./moods-CbakLCT1.mjs";
import { t as TrackList } from "./track-list-BEbRLhfN.mjs";
import { t as Button } from "./button-CqSnD8dT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/album._albumId-DCcqoIke.js
var import_jsx_runtime = require_jsx_runtime();
function AlbumPage() {
	const { albumId } = Route$5.useParams();
	const album = getAlbum(albumId);
	const tracks = tracksForAlbum(albumId);
	const playAlbum = usePlayer((s) => s.playAlbum);
	const current = usePlayer((s) => s.current);
	const isPlaying = usePlayer((s) => s.isPlaying);
	if (!album) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 py-16 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl",
			children: "This pressing is missing."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/archive",
			className: "mt-3 inline-block text-ochre-dark",
			children: "Back to the archive"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8 pt-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "poster-frame size-36 shrink-0 overflow-hidden rounded-[18px] sm:size-44",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: album.coverUrl,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] uppercase tracking-[0.2em] text-ochre-dark",
								children: [
									album.language,
									" · ",
									album.releaseYear,
									" · ",
									album.category === "bgm" ? "Score" : "Songs"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 font-display text-3xl leading-tight text-ink",
								children: album.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted",
								children: album.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm font-medium text-ink",
								children: [
									tracks.length,
									" ",
									tracks.length === 1 ? "track" : "tracks",
									" on this record"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-1.5",
								children: album.moods.map((m) => {
									const def = MOOD_BY_ID[m];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/moods",
										search: { mood: m },
										className: "rounded-full bg-paper-3 px-2.5 py-1 text-[11px] text-ink",
										children: def?.label ?? m
									}, m);
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden shrink-0 sm:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VinylDisc, {
							artUrl: album.coverUrl,
							spinning: Boolean(current && current.albumId === album.id && isPlaying),
							sizeClass: "!h-28 !w-28",
							onClick: () => playAlbum(album.id)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => playAlbum(album.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), "Play album"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/archive",
					search: { language: album.language },
					className: "inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border px-4 text-sm",
					children: ["More ", album.language]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-8 font-display text-xl text-ink",
				children: "Side A & B"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackList, { tracks })
		]
	});
}
//#endregion
export { AlbumPage as component };
