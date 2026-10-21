import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useRouter, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { c as filterTracks, d as streamUrl, l as getAlbum, p as tracksForAlbum } from "./catalog-HuPloD0r.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { r as getSql } from "./db-DtK8jl4N.mjs";
import { a as hasGateSessionMarker, i as auth, n as getSessionUser, o as GROK_PROVIDERS, t as UnauthorizedError } from "./verify.server-51ITWM-n.mjs";
import { r as formatTime, t as cn } from "./utils-CEubyQ9-.mjs";
import { a as SkipBack, c as Repeat, d as Library, f as Heart, h as ChevronDown, i as SkipForward, l as Play, m as Compass, n as TriangleAlert, o as Shuffle, p as Disc3, r as Sparkles, t as UserRound, u as Pause } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CM1X38DT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function resolveSignInGateState(input) {
	if (input.isPending) return "pending";
	return input.hasUser ? "signed_in" : "signed_out";
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
function SignInGate({ children, fallback }) {
	const { user, isPending } = useCurrentUserState();
	const state = resolveSignInGateState({
		isPending,
		hasUser: user !== null
	});
	if (state === "pending") return null;
	if (state === "signed_in") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: fallback ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInButtons, {}) });
}
function SignInButtons() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex w-full max-w-sm flex-col gap-2",
		children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => signIn(p.providerId, { callbackURL: "/" }),
			className: "w-full cursor-pointer rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900",
			children: ["Continue with ", p.label]
		}, p.providerId))
	});
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function AuthSlot() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-9 shrink-0 animate-pulse rounded-full bg-ink/10" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "max-w-[46vw] overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "inline-flex h-9 items-center rounded-full border border-border bg-cream px-3 text-sm font-medium text-ink",
		children: "Sign in"
	});
}
var audio = null;
var analyticsTimer = null;
var lastTickAt = 0;
var secondsBucket = 0;
var analyticsAuthed = true;
function getAudio() {
	if (typeof window === "undefined") return null;
	if (!audio) {
		audio = new Audio();
		audio.preload = "auto";
		audio.addEventListener("timeupdate", () => {
			usePlayer.setState({
				progress: audio?.currentTime ?? 0,
				duration: Number.isFinite(audio?.duration) ? audio?.duration ?? 0 : 0
			});
		});
		audio.addEventListener("play", () => usePlayer.setState({
			isPlaying: true,
			error: null
		}));
		audio.addEventListener("pause", () => usePlayer.setState({ isPlaying: false }));
		audio.addEventListener("ended", () => {
			flushAnalytics(true);
			const { repeat, current } = usePlayer.getState();
			if (repeat === "one" && current) {
				loadAndPlay(current, true);
				return;
			}
			usePlayer.getState().next();
		});
		audio.addEventListener("error", () => {
			const el = audio;
			if ((el?.src ?? "").includes("/api/v1/stream") && usePlayer.getState().current) {
				const raw = usePlayer.getState().current.audioUrl;
				if (el && el.getAttribute("data-src") !== "direct") {
					el.src = raw;
					el.setAttribute("data-src", "direct");
					el.play().catch(() => {
						usePlayer.setState({
							isPlaying: false,
							error: "This preview could not be loaded. Try another track."
						});
					});
					return;
				}
			}
			usePlayer.setState({
				isPlaying: false,
				error: "This preview could not be loaded. Try another track."
			});
		});
	}
	return audio;
}
async function loadAndPlay(track, force = false) {
	const el = getAudio();
	if (!el) return;
	if (force || el.getAttribute("data-track") !== track.id) {
		el.src = streamUrl(track.audioUrl);
		el.setAttribute("data-track", track.id);
		el.setAttribute("data-src", "proxy");
	}
	try {
		await el.play();
		startAnalytics();
	} catch {
		usePlayer.setState({
			isPlaying: false,
			error: "Tap play to start the needle."
		});
	}
}
function startAnalytics() {
	if (typeof window === "undefined") return;
	lastTickAt = Date.now();
	if (analyticsTimer != null) return;
	analyticsTimer = window.setInterval(() => {
		if (!usePlayer.getState().isPlaying) return;
		const now = Date.now();
		secondsBucket += (now - lastTickAt) / 1e3;
		lastTickAt = now;
		if (secondsBucket >= 5) {
			const secs = Math.floor(secondsBucket);
			secondsBucket -= secs;
			reportListening(secs, false);
		}
	}, 1e3);
}
function flushAnalytics(completed) {
	const secs = Math.floor(secondsBucket);
	secondsBucket = 0;
	lastTickAt = Date.now();
	if (secs > 0 || completed) reportListening(Math.max(secs, completed ? 1 : 0), completed);
}
function bumpLocalStats(trackId, seconds, completed) {
	if (typeof window === "undefined") return;
	try {
		const raw = window.localStorage.getItem("ochre.listening") || "{}";
		const stats = JSON.parse(raw);
		const prev = stats[trackId] ?? {
			seconds: 0,
			plays: 0
		};
		prev.seconds += seconds;
		if (completed) prev.plays += 1;
		stats[trackId] = prev;
		window.localStorage.setItem("ochre.listening", JSON.stringify(stats));
	} catch {}
}
async function reportListening(seconds, completed) {
	const track = usePlayer.getState().current;
	if (!track || seconds < 0) return;
	bumpLocalStats(track.id, seconds, completed);
	if (!analyticsAuthed) return;
	try {
		const { logListeningTime } = await import("./analytics-BDUFFN3h.mjs");
		await logListeningTime({ data: {
			trackId: track.id,
			seconds,
			completed
		} });
	} catch {
		analyticsAuthed = false;
	}
}
function readLocalStats() {
	if (typeof window === "undefined") return {};
	try {
		return JSON.parse(window.localStorage.getItem("ochre.listening") || "{}");
	} catch {
		return {};
	}
}
var usePlayer = create((set, get) => ({
	current: null,
	queue: [],
	queueIndex: 0,
	isPlaying: false,
	progress: 0,
	duration: 0,
	volume: .9,
	muted: false,
	repeat: "all",
	shuffle: false,
	expanded: false,
	error: null,
	playTrack: (track, queue) => {
		const q = queue && queue.length ? queue : [track];
		set({
			current: track,
			queue: q,
			queueIndex: Math.max(0, q.findIndex((t) => t.id === track.id)),
			error: null,
			expanded: true
		});
		loadAndPlay(track, true);
		if (typeof navigator !== "undefined" && navigator.mediaSession) {
			const album = getAlbum(track.albumId);
			navigator.mediaSession.metadata = new MediaMetadata({
				title: track.title,
				artist: "Ilaiyaraaja",
				album: album?.title ?? track.movieName,
				artwork: track.albumArtUrl ? [{
					src: track.albumArtUrl,
					sizes: "600x600",
					type: "image/jpeg"
				}] : []
			});
			navigator.mediaSession.setActionHandler("play", () => get().toggle());
			navigator.mediaSession.setActionHandler("pause", () => get().pause());
			navigator.mediaSession.setActionHandler("nexttrack", () => get().next());
			navigator.mediaSession.setActionHandler("previoustrack", () => get().prev());
		}
	},
	playAlbum: (albumId, startTrackId) => {
		const tracks = tracksForAlbum(albumId);
		if (!tracks.length) return;
		const start = tracks.find((t) => t.id === startTrackId) ?? tracks[0];
		get().playTrack(start, tracks);
	},
	toggle: () => {
		const el = getAudio();
		const { current, isPlaying } = get();
		if (!current || !el) return;
		if (isPlaying) {
			el.pause();
			flushAnalytics(false);
		} else loadAndPlay(current, false);
	},
	pause: () => {
		getAudio()?.pause();
		flushAnalytics(false);
	},
	next: () => {
		const { queue, queueIndex, shuffle, repeat } = get();
		if (!queue.length) return;
		let nextIndex;
		if (shuffle) nextIndex = Math.floor(Math.random() * queue.length);
		else {
			nextIndex = queueIndex + 1;
			if (nextIndex >= queue.length) {
				if (repeat === "off") {
					getAudio()?.pause();
					set({ isPlaying: false });
					return;
				}
				nextIndex = 0;
			}
		}
		const track = queue[nextIndex];
		set({
			queueIndex: nextIndex,
			current: track,
			progress: 0
		});
		loadAndPlay(track, true);
	},
	prev: () => {
		const el = getAudio();
		if (el && el.currentTime > 3) {
			el.currentTime = 0;
			return;
		}
		const { queue, queueIndex } = get();
		if (!queue.length) return;
		const nextIndex = (queueIndex - 1 + queue.length) % queue.length;
		const track = queue[nextIndex];
		set({
			queueIndex: nextIndex,
			current: track,
			progress: 0
		});
		loadAndPlay(track, true);
	},
	seek: (seconds) => {
		const el = getAudio();
		if (!el || !Number.isFinite(seconds)) return;
		el.currentTime = Math.max(0, seconds);
		set({ progress: el.currentTime });
	},
	setVolume: (v) => {
		const el = getAudio();
		const vol = Math.min(1, Math.max(0, v));
		if (el) el.volume = vol;
		set({
			volume: vol,
			muted: vol === 0
		});
	},
	toggleMute: () => {
		const el = getAudio();
		const muted = !get().muted;
		if (el) el.muted = muted;
		set({ muted });
	},
	setRepeat: (mode) => set({ repeat: mode }),
	toggleShuffle: () => set({ shuffle: !get().shuffle }),
	setExpanded: (open) => set({ expanded: open })
}));
function VinylDisc({ artUrl, spinning, sizeClass, onClick, interactive = true }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "vinyl-disc-spin",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "vinyl-label",
			style: {
				backgroundImage: artUrl ? `url(${artUrl})` : void 0,
				backgroundSize: "cover",
				backgroundPosition: "center"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "vinyl-spindle" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "vinyl-highlight" })] });
	const cls = cn("vinyl-disc", spinning && "is-playing", sizeClass);
	if (!interactive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cls,
		children: inner
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-label": spinning ? "Pause" : "Play",
		className: cls,
		children: inner
	});
}
function Tonearm({ playing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: cn("tonearm", playing && "is-playing"),
		viewBox: "0 0 120 180",
		fill: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "86",
				y: "8",
				width: "22",
				height: "18",
				rx: "3",
				fill: "#f4f0ea",
				stroke: "#cfc6ba"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M97 26 L40 150",
				stroke: "#f7f3ee",
				strokeWidth: "7",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M97 26 L40 150",
				stroke: "#d9d0c4",
				strokeWidth: "2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "28",
				y: "146",
				width: "22",
				height: "18",
				rx: "2",
				fill: "#f7f3ee",
				stroke: "#cfc6ba",
				transform: "rotate(-28 39 155)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "97",
				cy: "18",
				r: "5",
				fill: "#c87d55"
			})
		]
	});
}
function barsFor(seed, count = 48) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	const out = [];
	for (let i = 0; i < count; i++) {
		h ^= h << 13;
		h ^= h >>> 17;
		h ^= h << 5;
		const n = (h >>> 0) / 4294967295;
		const envelope = Math.sin(i / count * Math.PI);
		out.push(.18 + envelope * (.35 + n * .47));
	}
	return out;
}
function WaveformSeeker({ seed, progress, duration, onSeek, className }) {
	const bars = (0, import_react.useMemo)(() => barsFor(seed), [seed]);
	const ratio = duration > 0 ? Math.min(1, progress / duration) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-12 cursor-pointer items-end gap-px", className),
		role: "slider",
		"aria-valuemin": 0,
		"aria-valuemax": Math.round(duration),
		"aria-valuenow": Math.round(progress),
		"aria-label": "Seek",
		tabIndex: 0,
		onClick: (e) => {
			const rect = e.currentTarget.getBoundingClientRect();
			onSeek((e.clientX - rect.left) / rect.width * duration);
		},
		onKeyDown: (e) => {
			if (e.key === "ArrowRight") onSeek(Math.min(duration, progress + 2));
			if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 2));
		},
		children: bars.map((h, i) => {
			const filled = i / bars.length <= ratio;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "wave-bar w-full rounded-full",
				style: {
					height: `${Math.round(h * 100)}%`,
					backgroundColor: filled ? "var(--color-ochre)" : "rgb(28 19 14 / 0.18)"
				}
			}, i);
		})
	});
}
function FullPlayer() {
	const { current, isPlaying, progress, duration, expanded, error, shuffle, repeat, toggle, next, prev, seek, setExpanded, toggleShuffle, setRepeat } = usePlayer();
	if (!expanded || !current) return null;
	const album = getAlbum(current.albumId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-paper paper-grain",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between px-4 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setExpanded(false),
					className: "grid size-11 place-items-center rounded-full bg-cream text-ink",
					"aria-label": "Close player",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-[0.22em] text-muted",
						children: "Now spinning"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm text-ink",
						children: album?.title ?? current.movieName
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-11 place-items-center text-ochre",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto mt-4 w-full max-w-3xl flex-1 overflow-y-auto px-5 pb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid items-center gap-6 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "poster-frame mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[22px] bg-paper-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: current.albumArtUrl,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto grid place-items-center py-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VinylDisc, {
							artUrl: current.vinylCenterLabelUrl || current.albumArtUrl,
							spinning: isPlaying,
							onClick: toggle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tonearm, { playing: isPlaying })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 text-center md:text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl leading-tight text-ink",
							children: current.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Ilaiyaraaja · ",
								current.movieName,
								" · ",
								current.releaseYear
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs uppercase tracking-[0.16em] text-ochre-dark",
							children: "Apple Music preview"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveformSeeker, {
						seed: current.id,
						progress,
						duration: duration || 30,
						onSeek: seek
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex justify-between text-xs tabular-nums text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(progress) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTime(duration || 30) })]
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-sm text-ochre-dark",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-center gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleShuffle,
							className: "grid size-11 place-items-center text-ink",
							"aria-label": "Shuffle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, {
								className: "size-4",
								strokeWidth: shuffle ? 2.6 : 1.8
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: prev,
							className: "grid size-12 place-items-center rounded-full bg-cream text-ink",
							"aria-label": "Previous",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-5 fill-current" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggle,
							className: "grid size-16 place-items-center rounded-full bg-ochre text-cream shadow-lg",
							"aria-label": isPlaying ? "Pause" : "Play",
							children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-7 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-7 fill-current" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: next,
							className: "grid size-12 place-items-center rounded-full bg-cream text-ink",
							"aria-label": "Next",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-5 fill-current" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRepeat(repeat === "one" ? "all" : repeat === "all" ? "off" : "one"),
							className: "grid size-11 place-items-center text-ink",
							"aria-label": "Repeat",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, {
								className: "size-4",
								strokeWidth: repeat === "off" ? 1.8 : 2.6
							})
						})
					]
				})
			]
		})]
	});
}
function MiniPlayer() {
	const { current, isPlaying, progress, duration, toggle, next, setExpanded, expanded } = usePlayer();
	if (!current || expanded) return null;
	const ratio = duration > 0 ? Math.min(1, progress / duration) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto mx-3 mb-2 overflow-hidden rounded-[18px] border border-border bg-cream shadow-[0_8px_30px_rgb(28_19_14_/_0.12)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-0.5 w-full bg-paper-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full bg-ochre",
				style: { width: `${ratio * 100}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setExpanded(true),
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VinylDisc, {
						artUrl: current.vinylCenterLabelUrl || current.albumArtUrl,
						spinning: isPlaying,
						sizeClass: "vinyl-mini",
						interactive: false
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setExpanded(true),
					className: "min-w-0 flex-1 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-sm text-ink",
						children: current.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted",
						children: current.movieName
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: toggle,
					className: "grid size-11 place-items-center rounded-full bg-ochre text-cream",
					"aria-label": isPlaying ? "Pause" : "Play",
					children: isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: next,
					className: "grid size-11 place-items-center text-ink",
					"aria-label": "Next",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4 fill-current" })
				})
			]
		})]
	});
}
var seedCatalog = createServerFn({ method: "POST" }).handler(createSsrRpc("1bf683354c16a85c12cfe05f88c4eae7c82cea31b2463aeeae8bf69932cdb559"));
createServerFn({ method: "GET" }).validator((input) => input ?? {}).handler(createSsrRpc("3477411c74fc22179fbbf6fd30482de6198fe8169748bd8bfc9e95f552573cbb"));
createServerFn({ method: "GET" }).validator((albumId) => albumId).handler(createSsrRpc("600eebfcfae5a1f97071b5d6007ccc8d0d6fcac380a585881e3bb7b1ec7759af"));
createServerFn({ method: "GET" }).validator((mood) => mood).handler(createSsrRpc("db9c7c1326a73438bf0b8c9c57adbc494b752b892d7e34c420bc110e8344b946"));
var NAV = [
	{
		to: "/",
		label: "Studio",
		icon: Disc3
	},
	{
		to: "/scores",
		label: "Scores",
		icon: Sparkles
	},
	{
		to: "/moods",
		label: "Moods",
		icon: Compass
	},
	{
		to: "/archive",
		label: "Archive",
		icon: Library
	},
	{
		to: "/you",
		label: "You",
		icon: UserRound
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		seedCatalog().catch(() => void 0);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "paper-grain mx-auto flex min-h-dvh max-w-5xl flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-paper/90 px-4 py-3 backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-baseline gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-2xl italic tracking-tight text-ochre-dark",
						children: "OCHRE"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden text-[10px] uppercase tracking-[0.22em] text-muted sm:inline",
						children: "Ilaiyaraaja vinyl"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 pb-32",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto max-w-5xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayer, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "pointer-events-auto border-t border-border bg-paper/95 px-2 pt-1 backdrop-blur-md safe-bottom",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid grid-cols-5",
						children: NAV.map((item) => {
							const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px]", active ? "text-ochre-dark" : "text-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									strokeWidth: active ? 2.4 : 1.8
								}), item.label]
							}) }, item.to);
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullPlayer, {})
		]
	});
}
var styles_default = "/assets/styles-CbyfeENy.css";
var APP_NAME = "OCHRE";
var fetchSessionUser = createServerFn({ method: "GET" }).handler(createSsrRpc("2c4985e96c199268f7f639534cb5e8e31d6b19d43286bf77416413db60ffde26"));
var Route$12 = createRootRoute({
	beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "OCHRE — the Ilaiyaraaja vinyl archive. Spin analog Tamil, Telugu, Malayalam, Kannada and Hindi film scores."
			},
			{
				name: "theme-color",
				content: "#C87D55"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;1,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$6 = () => import("./routes-DYLLZUxa.mjs");
var Route$11 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./archive-BMKQeWrt.mjs");
var Route$10 = createFileRoute("/archive")({
	validateSearch: (s) => ({
		q: typeof s.q === "string" ? s.q : void 0,
		language: typeof s.language === "string" ? s.language : void 0,
		era: typeof s.era === "string" ? s.era : void 0,
		mood: typeof s.mood === "string" ? s.mood : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./login-DSbYQ4td.mjs");
var Route$9 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./moods-VnnBYfo6.mjs");
var Route$8 = createFileRoute("/moods")({
	validateSearch: (s) => ({ mood: typeof s.mood === "string" ? s.mood : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./scores-D90L7DOp.mjs");
var Route$7 = createFileRoute("/scores")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./you-BWyoPGsu.mjs");
var Route$6 = createFileRoute("/you")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./album._albumId-DCcqoIke.mjs");
var Route$5 = createFileRoute("/album/$albumId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$4 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
function isAllowedAudioHost(hostname) {
	return hostname === "audio-ssl.itunes.apple.com" || hostname.endsWith(".apple.com") || hostname.endsWith(".mzstatic.com") || hostname.endsWith(".dzcdn.net");
}
var Route$3 = createFileRoute("/api/v1/stream")({ server: { handlers: { GET: async ({ request }) => {
	const src = new URL(request.url).searchParams.get("u");
	if (!src) return new Response("Missing audio url", { status: 400 });
	let parsed;
	try {
		parsed = new URL(src);
	} catch {
		return new Response("Bad url", { status: 400 });
	}
	if (parsed.protocol !== "https:" || !isAllowedAudioHost(parsed.hostname)) return new Response("Forbidden host", { status: 403 });
	const range = request.headers.get("range");
	const upstream = await fetch(src, { headers: range ? { Range: range } : void 0 });
	if (!upstream.ok && upstream.status !== 206) return new Response("Upstream audio failed", { status: 502 });
	const headers = new Headers();
	headers.set("Content-Type", "audio/mp4");
	headers.set("Cache-Control", "public, max-age=86400");
	headers.set("Accept-Ranges", "bytes");
	const len = upstream.headers.get("content-length");
	if (len) headers.set("Content-Length", len);
	const cr = upstream.headers.get("content-range");
	if (cr) headers.set("Content-Range", cr);
	return new Response(upstream.body, {
		status: upstream.status,
		headers
	});
} } } });
var Route$2 = createFileRoute("/api/v1/tracks")({ server: { handlers: { GET: ({ request }) => {
	const url = new URL(request.url);
	const albumId = url.searchParams.get("albumId") ?? void 0;
	if (albumId) {
		const album = getAlbum(albumId);
		if (!album) return Response.json({ error: "Album not found" }, { status: 404 });
		return Response.json({
			album,
			tracks: tracksForAlbum(albumId),
			total: tracksForAlbum(albumId).length
		});
	}
	const result = filterTracks({
		q: url.searchParams.get("q") ?? void 0,
		language: url.searchParams.get("language") ?? void 0,
		era: url.searchParams.get("era") ?? void 0,
		category: url.searchParams.get("category") ?? void 0,
		mood: url.searchParams.get("mood") ?? void 0,
		page: Number(url.searchParams.get("page") ?? 1),
		limit: Number(url.searchParams.get("limit") ?? 40)
	});
	return Response.json(result);
} } } });
var Route$1 = createFileRoute("/api/v1/analytics/listening-time")({ server: { handlers: { POST: async ({ request }) => {
	const user = await getSessionUser();
	if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
	let body;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}
	const trackId = String(body.trackId ?? "");
	const seconds = Math.max(0, Math.min(3600, Math.floor(Number(body.seconds) || 0)));
	const extraPlays = body.completed ? 1 : 0;
	if (!trackId) return Response.json({ error: "trackId required" }, { status: 400 });
	try {
		await (await getSql()).query(`insert into user_listening_analytics (user_id, track_id, total_seconds_listened, completed_plays, last_listened_at)
             values ($1, $2, $3, $4, now())
             on conflict (user_id, track_id) do update set
               total_seconds_listened = user_listening_analytics.total_seconds_listened + excluded.total_seconds_listened,
               completed_plays = user_listening_analytics.completed_plays + excluded.completed_plays,
               last_listened_at = now()`, [
			user.id,
			trackId,
			seconds,
			extraPlays
		]);
	} catch (err) {
		const message = err instanceof UnauthorizedError ? "Unauthorized" : "Could not record";
		return Response.json({ error: message }, { status: 500 });
	}
	return Response.json({ ok: true });
} } } });
var Route = createFileRoute("/api/v1/recommendations/mood")({ server: { handlers: { GET: ({ request }) => {
	const mood = new URL(request.url).searchParams.get("mood") || "romance";
	const { tracks, total } = filterTracks({
		mood,
		limit: 24
	});
	return Response.json({
		mood,
		total,
		tracks
	});
} } } });
var rootRouteChildren = {
	IndexRoute: Route$11.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$12
	}),
	ArchiveRoute: Route$10.update({
		id: "/archive",
		path: "/archive",
		getParentRoute: () => Route$12
	}),
	LoginRoute: Route$9.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$12
	}),
	MoodsRoute: Route$8.update({
		id: "/moods",
		path: "/moods",
		getParentRoute: () => Route$12
	}),
	ScoresRoute: Route$7.update({
		id: "/scores",
		path: "/scores",
		getParentRoute: () => Route$12
	}),
	YouRoute: Route$6.update({
		id: "/you",
		path: "/you",
		getParentRoute: () => Route$12
	}),
	AlbumAlbumIdRoute: Route$5.update({
		id: "/album/$albumId",
		path: "/album/$albumId",
		getParentRoute: () => Route$12
	}),
	ApiAuthSplatRoute: Route$4.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$12
	}),
	ApiV1StreamRoute: Route$3.update({
		id: "/api/v1/stream",
		path: "/api/v1/stream",
		getParentRoute: () => Route$12
	}),
	ApiV1TracksRoute: Route$2.update({
		id: "/api/v1/tracks",
		path: "/api/v1/tracks",
		getParentRoute: () => Route$12
	}),
	ApiV1AnalyticsListeningTimeRoute: Route$1.update({
		id: "/api/v1/analytics/listening-time",
		path: "/api/v1/analytics/listening-time",
		getParentRoute: () => Route$12
	}),
	ApiV1RecommendationsMoodRoute: Route.update({
		id: "/api/v1/recommendations/mood",
		path: "/api/v1/recommendations/mood",
		getParentRoute: () => Route$12
	})
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Tonearm as a, usePlayer as c, useCurrentUserState as d, createSsrRpc as f, Route$10 as i, SignInGate as l, Route$5 as n, VinylDisc as o, Route$8 as r, readLocalStats as s, router_exports as t, useCurrentUser as u };
