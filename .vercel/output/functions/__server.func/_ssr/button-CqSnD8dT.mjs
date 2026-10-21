import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-CEubyQ9-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-CqSnD8dT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Button = (0, import_react.forwardRef)(function Button({ className, variant = "primary", static: isStatic, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		ref,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-[transform,background-color,color,opacity] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50", !isStatic && "active:not-disabled:scale-[0.96]", variant === "primary" && "bg-ochre text-cream hover:bg-ochre-dark", variant === "ghost" && "bg-transparent text-ink hover:bg-ink/5", variant === "outline" && "border border-border bg-transparent text-ink hover:bg-paper-3/40", variant === "paper" && "bg-cream text-ink shadow-sm hover:bg-paper-2", className),
		...props
	});
});
//#endregion
export { Button as t };
