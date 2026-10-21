import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CEubyQ9-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coverflow-De4YHz-3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Coverflow({ albums, onOpen }) {
	const scroller = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scroller,
			className: "flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden",
			children: albums.map((album, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/album/$albumId",
				params: { albumId: album.id },
				onClick: () => onOpen?.(album),
				className: "coverflow-card w-[46vw] max-w-[220px] min-w-[148px] shrink-0 snap-center md:w-[200px]",
				style: { animationDelay: `${Math.min(i, 8) * 40}ms` },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "poster-frame relative aspect-square overflow-hidden rounded-[18px] bg-paper-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: album.coverUrl,
							alt: "",
							className: "h-full w-full object-cover",
							draggable: false
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute bottom-2 left-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cream",
							children: [
								album.releaseYear,
								" · ",
								album.trackCount,
								" tracks"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 truncate font-display text-base leading-tight text-ink",
						children: album.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-xs text-muted",
						children: [
							album.language,
							" · ",
							album.era
						]
					})
				]
			}, album.id))
		})
	});
}
function AlbumGrid({ albums }) {
	if (!albums.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-5 py-10 text-center text-sm text-muted",
		children: "No records on this shelf. Try another filter."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 px-5 pb-6 sm:grid-cols-3 md:grid-cols-4",
		children: albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/album/$albumId",
			params: { albumId: album.id },
			className: "group",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "poster-frame aspect-square overflow-hidden rounded-[16px] bg-paper-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: album.coverUrl,
						alt: "",
						className: "h-full w-full object-cover transition-transform duration-300 group-active:scale-[0.98] md:group-hover:scale-[1.03]"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 truncate font-display text-sm text-ink",
					children: album.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("truncate text-xs text-muted"),
					children: [
						album.releaseYear,
						" · ",
						album.trackCount,
						" songs"
					]
				})
			]
		}, album.id))
	});
}
//#endregion
export { Coverflow as n, AlbumGrid as t };
