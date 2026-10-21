import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Listener",
          callbackURL: "/",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (err) throw new Error(err.message);
      }
      const { getMyRole } = await import("@/lib/server/roles");
      const role = await getMyRole();
      window.location.href = role.role === "admin" ? "/admin" : "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="px-5 py-10">
      <p className="text-[11px] uppercase tracking-[0.28em] text-ochre-dark">
        Members' lounge
      </p>
      <h1 className="mt-2 font-display text-4xl italic text-ink">
        {mode === "in" ? "Welcome back" : "Take a seat"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Save listening time, preferred language, and the records you keep
        spinning. Guests can still play — this shelf is for your history.
      </p>

      {!authEnabled ? (
        <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-8 max-w-sm space-y-3">
            {mode === "up" ? (
              <Field
                label="Name"
                value={name}
                onChange={setName}
                autoComplete="name"
              />
            ) : null}
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
            />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
            />
            {error ? <p className="text-sm text-ochre-dark">{error}</p> : null}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            type="button"
            className="mt-3 text-sm text-ochre-dark"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "Need an account? Join the lounge" : "Already a member? Sign in"}
          </button>

          <div className="mt-8 max-w-sm space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Or continue with</p>
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        </>
      )}

      <Link to="/" className="mt-10 inline-block text-sm text-muted">
        Back to the studio
      </Link>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 h-11 w-full rounded-[12px] border border-border bg-cream px-3 text-sm text-ink outline-none focus:border-ochre"
      />
    </label>
  );
}
