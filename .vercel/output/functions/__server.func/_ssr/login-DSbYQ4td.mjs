import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { o as GROK_PROVIDERS } from "./verify.server-51ITWM-n.mjs";
import { t as Button } from "./button-CqSnD8dT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DSbYQ4td.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setError(null);
		setPending(true);
		try {
			if (mode === "up") {
				const { error: err } = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0] || "Listener",
					callbackURL: "/"
				});
				if (err) throw new Error(err.message);
			} else {
				const { error: err } = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/"
				});
				if (err) throw new Error(err.message);
			}
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.28em] text-ochre-dark",
				children: "Members' lounge"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl italic text-ink",
				children: mode === "in" ? "Welcome back" : "Take a seat"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm text-muted",
				children: "Save listening time, preferred language, and the records you keep spinning. Guests can still play — this shelf is for your history."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-8 max-w-sm space-y-3",
					children: [
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							value: name,
							onChange: setName,
							autoComplete: "name"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							value: email,
							onChange: setEmail,
							type: "email",
							autoComplete: "email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Password",
							value: password,
							onChange: setPassword,
							type: "password",
							autoComplete: mode === "up" ? "new-password" : "current-password"
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-ochre-dark",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending,
							className: "w-full",
							children: pending ? "One moment…" : mode === "in" ? "Sign in" : "Create account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 text-sm text-ochre-dark",
					onClick: () => setMode(mode === "in" ? "up" : "in"),
					children: mode === "in" ? "Need an account? Join the lounge" : "Already a member? Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 max-w-sm space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.18em] text-muted",
						children: "Or continue with"
					}), GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "w-full",
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						children: ["Continue with ", p.label]
					}, p.providerId))]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-10 inline-block text-sm text-muted",
				children: "Back to the studio"
			})
		]
	});
}
function Field({ label, value, onChange, type = "text", autoComplete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type,
			value,
			autoComplete,
			onChange: (e) => onChange(e.target.value),
			required: true,
			className: "mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3 text-sm text-ink outline-none focus:border-ochre"
		})]
	});
}
//#endregion
export { Login as component };
