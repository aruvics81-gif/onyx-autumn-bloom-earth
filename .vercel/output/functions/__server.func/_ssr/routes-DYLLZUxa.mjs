import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as getAlbum, o as featuredAlbums, p as tracksForAlbum } from "./catalog-HuPloD0r.mjs";
import { t as cn } from "./utils-CEubyQ9-.mjs";
import { l as Play, u as Pause } from "../_libs/lucide-react.mjs";
import { a as Tonearm, c as usePlayer, o as VinylDisc } from "./router-CM1X38DT.mjs";
import { t as ERAS } from "./moods-CbakLCT1.mjs";
import { n as Coverflow } from "./coverflow-De4YHz-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DYLLZUxa.js
var import_jsx_runtime = require_jsx_runtime();
function VinylStage({ album, track, playing, onToggle, compact = false }) {
	const art = track?.albumArtUrl || album.coverUrl;
	const label = track?.vinylCenterLabelUrl || art;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative overflow-hidden rounded-[var(--radius-xl)] bg-cream", compact ? "p-4" : "p-5 md:p-8"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("grid items-center gap-4", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 md:gap-8"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "poster-frame aspect-square overflow-hidden rounded-[18px] bg-paper-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: art,
							alt: album.title,
							className: "h-full w-full object-cover",
							draggable: false
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-xl leading-tight text-ink md:text-2xl",
						children: track?.title ?? album.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							album.movieName,
							album.releaseYear ? ` · ${album.releaseYear}` : "",
							" · Ilaiyaraaja"
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid place-items-center py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VinylDisc, {
						artUrl: label,
						spinning: playing,
						onClick: onToggle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tonearm, { playing }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onToggle,
						className: "absolute bottom-2 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-ochre text-cream shadow-lg",
						"aria-label": playing ? "Pause" : "Play",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5 fill-current" })
					})
				]
			})]
		})
	});
}
function Home() {
	const featured = featuredAlbums();
	const current = usePlayer((s) => s.current);
	const isPlaying = usePlayer((s) => s.isPlaying);
	const playAlbum = usePlayer((s) => s.playAlbum);
	const toggle = usePlayer((s) => s.toggle);
	const heroAlbum = current && getAlbum(current.albumId) || featured[0] || null;
	const heroTracks = heroAlbum ? tracksForAlbum(heroAlbum.id) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "px-5 pb-2 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.28em] text-ochre-dark",
					children: "Isaignani · 8,600 songs · 1,523 films"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 max-w-xl font-display text-[2.15rem] italic leading-[1.12] text-ink md:text-5xl",
					children: "Designing my color vinyl"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-lg text-sm leading-relaxed text-muted",
					children: "Warm analog Ilaiyaraaja — Tamil soil, Telugu ragas, Malayalam dusk, brass, and tape hiss. Drop the needle. The record is real."
				})
			]
		}),
		heroAlbum ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "px-4 pt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VinylStage, {
				album: heroAlbum,
				track: current && current.albumId === heroAlbum.id ? current : heroTracks[0],
				playing: Boolean(current && current.albumId === heroAlbum.id && isPlaying),
				onToggle: () => {
					if (current && current.albumId === heroAlbum.id) toggle();
					else playAlbum(heroAlbum.id);
				}
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-ink",
					children: "The shelf"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Flick through the pressings"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/archive",
					className: "text-sm font-medium text-ochre-dark",
					children: "All albums"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coverflow, { albums: featured })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 px-5 pb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-ink",
				children: "By decade"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-3",
				children: ERAS.map((era) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/archive",
					search: { era: era.id },
					className: "rounded-[18px] border border-border bg-cream px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-ink",
						children: era.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: era.range
					})]
				}, era.id))
			})]
		})
	] });
}
//#endregion
export { Home as component };
