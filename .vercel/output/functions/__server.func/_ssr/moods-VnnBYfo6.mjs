import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as tracksByMood, r as albumsByMood } from "./catalog-HuPloD0r.mjs";
import { t as cn } from "./utils-CEubyQ9-.mjs";
import { r as Route$8 } from "./router-CM1X38DT.mjs";
import { r as MOODS } from "./moods-CbakLCT1.mjs";
import { t as TrackList } from "./track-list-BEbRLhfN.mjs";
import { t as AlbumGrid } from "./coverflow-De4YHz-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/moods-VnnBYfo6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MoodWheel({ selected, onSelect }) {
	const slice = 360 / MOODS.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative size-[280px] md:size-[320px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 100 100",
				className: "size-full -rotate-90",
				children: [MOODS.map((mood, i) => {
					const start = i * slice;
					const end = start + slice - 1.2;
					const active = selected === mood.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: annularSlice(50, 50, 18, 48, start, end),
						fill: mood.swatch,
						opacity: selected && !active ? .45 : 1,
						className: "cursor-pointer transition-opacity duration-200",
						onClick: () => onSelect(mood.id)
					}, mood.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "50",
					r: "16",
					fill: "#fff8f0"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-[7.5rem] text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-base leading-tight text-ink",
						children: MOODS.find((m) => m.id === selected)?.label ?? "Mood"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted",
						children: "turn the earth"
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex max-w-lg flex-wrap justify-center gap-2 px-4",
			children: MOODS.map((mood) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoodChip, {
				mood,
				active: selected === mood.id,
				onClick: () => onSelect(mood.id)
			}, mood.id))
		})]
	});
}
function MoodChip({ mood, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium", active ? "border-ochre-dark bg-ochre text-cream" : "border-border bg-cream text-ink"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "size-2.5 rounded-full",
			style: { background: mood.swatch }
		}), mood.label]
	});
}
function polar(cx, cy, r, deg) {
	const rad = (deg - 90) * Math.PI / 180;
	return {
		x: cx + r * Math.cos(rad),
		y: cy + r * Math.sin(rad)
	};
}
function annularSlice(cx, cy, r0, r1, a0, a1) {
	const large = a1 - a0 > 180 ? 1 : 0;
	const p0 = polar(cx, cy, r1, a0);
	const p1 = polar(cx, cy, r1, a1);
	const p2 = polar(cx, cy, r0, a1);
	const p3 = polar(cx, cy, r0, a0);
	return `M ${p0.x} ${p0.y} A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r0} ${r0} 0 ${large} 0 ${p3.x} ${p3.y} Z`;
}
function Moods() {
	const { mood } = Route$8.useSearch();
	const navigate = Route$8.useNavigate();
	const selected = mood ?? "romance";
	const def = MOODS.find((m) => m.id === selected) ?? MOODS[2];
	const albums = (0, import_react.useMemo)(() => albumsByMood(selected).slice(0, 16), [selected]);
	const tracks = (0, import_react.useMemo)(() => tracksByMood(selected).slice(0, 12), [selected]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.28em] text-ochre-dark",
						children: "Color wheel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl italic text-ink",
						children: "Find a feeling"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-2 max-w-md text-sm text-muted",
						children: def.line
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoodWheel, {
					selected,
					onSelect: (id) => void navigate({ search: { mood: id } })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "px-5 font-display text-xl text-ink",
					children: "Albums in this hue"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlbumGrid, { albums })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-5 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl text-ink",
					children: "Drop these needles"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackList, { tracks })]
			})
		]
	});
}
//#endregion
export { Moods as component };
