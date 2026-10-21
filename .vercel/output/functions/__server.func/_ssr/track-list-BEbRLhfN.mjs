import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatTime, t as cn } from "./utils-CEubyQ9-.mjs";
import { l as Play, u as Pause } from "../_libs/lucide-react.mjs";
import { c as usePlayer } from "./router-CM1X38DT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/track-list-BEbRLhfN.js
var import_jsx_runtime = require_jsx_runtime();
function TrackList({ tracks }) {
	const current = usePlayer((s) => s.current);
	const isPlaying = usePlayer((s) => s.isPlaying);
	const playTrack = usePlayer((s) => s.playTrack);
	if (!tracks.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-1 py-8 text-sm text-muted",
		children: "No songs on this pressing."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "divide-y divide-border/80",
		children: tracks.map((track, i) => {
			const active = current?.id === track.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => playTrack(track, tracks),
				className: cn("flex w-full items-center gap-3 px-1 py-3 text-left", active && "bg-ochre/10"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-full bg-cream text-ink",
						children: active && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: track.albumArtUrl,
						alt: "",
						className: "size-12 shrink-0 rounded-[10px] object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-medium text-ink",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-xs text-muted",
							children: [
								track.artist,
								" · ",
								track.movieName
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-xs tabular-nums text-muted",
						children: formatTime(track.duration)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden w-6 shrink-0 text-right text-xs text-muted sm:block",
						children: String(track.trackNumber || i + 1).padStart(2, "0")
					})
				]
			}) }, track.id);
		})
	});
}
//#endregion
export { TrackList as t };
