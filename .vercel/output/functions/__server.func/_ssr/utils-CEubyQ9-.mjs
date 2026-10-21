import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-CEubyQ9-.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}
function formatHours(totalSeconds) {
	if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
	const m = Math.round(totalSeconds / 60);
	if (m < 60) return `${m} min`;
	const h = Math.floor(m / 60);
	const rem = m % 60;
	return rem ? `${h}h ${rem}m` : `${h}h`;
}
//#endregion
export { formatHours as n, formatTime as r, cn as t };
