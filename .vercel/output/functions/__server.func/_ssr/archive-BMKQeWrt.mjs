import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as filterAlbums } from "./catalog-HuPloD0r.mjs";
import { t as cn } from "./utils-CEubyQ9-.mjs";
import { s as Search } from "../_libs/lucide-react.mjs";
import { i as Route$10 } from "./router-CM1X38DT.mjs";
import { n as LANGUAGES, t as ERAS } from "./moods-CbakLCT1.mjs";
import { t as AlbumGrid } from "./coverflow-De4YHz-3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/archive-BMKQeWrt.js
var import_jsx_runtime = require_jsx_runtime();
function Archive() {
	const search = Route$10.useSearch();
	const navigate = Route$10.useNavigate();
	const albums = filterAlbums({
		q: search.q,
		language: search.language,
		era: search.era,
		mood: search.mood
	});
	function patch(next) {
		navigate({ search: {
			...search,
			...next
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl italic text-ink",
					children: "The archive"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [albums.length, " albums · language, era, and the search bar."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 flex min-h-11 items-center gap-2 rounded-[14px] border border-border bg-cream px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search.q ?? "",
						onChange: (e) => patch({ q: e.target.value || void 0 }),
						placeholder: "Search films, songs, singers",
						className: "h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: !search.language,
						onClick: () => patch({ language: void 0 }),
						label: "All tongues"
					}), LANGUAGES.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: search.language === lang,
						onClick: () => patch({ language: search.language === lang ? void 0 : lang }),
						label: lang
					}, lang))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex gap-2 overflow-x-auto pb-2",
					children: ERAS.map((era) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						active: search.era === era.id,
						onClick: () => patch({ era: search.era === era.id ? void 0 : era.id }),
						label: era.label
					}, era.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlbumGrid, { albums })]
	});
}
function Chip({ label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("shrink-0 rounded-full border px-3 py-2 text-xs font-medium", active ? "border-ochre-dark bg-ochre text-cream" : "border-border bg-cream text-ink"),
		children: label
	});
}
//#endregion
export { Archive as component };
