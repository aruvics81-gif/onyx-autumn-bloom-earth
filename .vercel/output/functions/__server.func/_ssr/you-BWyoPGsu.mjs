import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { u as getTrack } from "./catalog-HuPloD0r.mjs";
import { n as formatHours } from "./utils-CEubyQ9-.mjs";
import { d as useCurrentUserState, f as createSsrRpc, l as SignInGate, s as readLocalStats, u as useCurrentUser } from "./router-CM1X38DT.mjs";
import { n as LANGUAGES } from "./moods-CbakLCT1.mjs";
import { t as TrackList } from "./track-list-BEbRLhfN.mjs";
import { t as authMiddleware } from "./middleware-D4T3645t.mjs";
import { getListeningStats } from "./analytics-BDUFFN3h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/you-BWyoPGsu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getOrCreateProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("59e1497ab6943f8118cb3e4e57f1553cf85ed839321c10042ad7fa9443e8f0b5"));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	displayName: input.displayName?.trim().slice(0, 80) || void 0,
	preferredLanguage: input.preferredLanguage?.trim().slice(0, 32) || void 0
})).handler(createSsrRpc("580eb9cacacfd10e534ae986491eec3b15431475b909edd07b8eb72a9cf24ce9"));
function You() {
	const { isPending } = useCurrentUserState();
	const user = useCurrentUser();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-8 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.28em] text-ochre-dark",
				children: "Listening room"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl italic text-ink",
				children: "Your hours with Raja"
			}),
			isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-24 animate-pulse rounded-[18px] bg-ink/10" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInGate, {
				fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuestPanel, {}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberPanel, { name: user?.displayName ?? user?.primaryEmail ?? "Listener" })
			})
		]
	});
}
function GuestPanel() {
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [seconds, setSeconds] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const stats = readLocalStats();
		const ids = Object.entries(stats).sort((a, b) => b[1].seconds - a[1].seconds);
		setSeconds(ids.reduce((n, [, v]) => n + v.seconds, 0));
		setTracks(ids.map(([id]) => getTrack(id)).filter((t) => Boolean(t)).slice(0, 8));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"You have ",
					formatHours(seconds),
					" on this device. Sign in to keep the ledger across phones and tablets."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "mt-4 inline-flex min-h-11 items-center rounded-[12px] bg-ochre px-4 text-sm font-medium text-cream",
				children: "Sign in to save listening"
			}),
			tracks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl text-ink",
					children: "Recently spun here"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackList, { tracks })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm text-muted",
				children: "Drop a needle on the studio shelf — your first minutes will land here."
			})
		]
	});
}
function MemberPanel({ name }) {
	const [seconds, setSeconds] = (0, import_react.useState)(0);
	const [plays, setPlays] = (0, import_react.useState)(0);
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [language, setLanguage] = (0, import_react.useState)("Tamil");
	const [saved, setSaved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		(async () => {
			try {
				const profile = await getOrCreateProfile();
				setLanguage(profile.preferredLanguage);
			} catch {}
			try {
				const stats = await getListeningStats();
				setSeconds(stats.totals.seconds);
				setPlays(stats.totals.plays);
				const found = stats.rows.map((r) => getTrack(r.trackId)).filter((t) => Boolean(t)).slice(0, 12);
				setTracks(found);
			} catch {
				const local = readLocalStats();
				const ids = Object.entries(local).sort((a, b) => b[1].seconds - a[1].seconds);
				setSeconds(ids.reduce((n, [, v]) => n + v.seconds, 0));
				setTracks(ids.map(([id]) => getTrack(id)).filter((t) => Boolean(t)).slice(0, 12));
			}
		})();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl text-ink",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Time listened",
					value: formatHours(seconds)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Completed plays",
					value: String(plays)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-medium text-muted",
						children: "Preferred language"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: language,
						onChange: (e) => {
							const next = e.target.value;
							setLanguage(next);
							setSaved(false);
							updateProfile({ data: { preferredLanguage: next } }).then(() => setSaved(true));
						},
						className: "mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3 text-sm text-ink",
						children: LANGUAGES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: l,
							children: l
						}, l))
					}),
					saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-ochre-dark",
						children: "Saved"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl text-ink",
					children: "Your recent spins"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackList, { tracks })]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[16px] border border-border bg-cream px-4 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.16em] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-2xl tabular-nums text-ink",
			children: value
		})]
	});
}
//#endregion
export { You as component };
