import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { Spinner } from "../components/BrandedLoader";
import type { UserPublic } from "../types";

export function LoginPage() {
  const { loginFromResponse } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ token: string; user: UserPublic }>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
          auth: false,
        }
      );
      loginFromResponse(res.token, res.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel narrow">
      <span className="hero-eyebrow">Welcome back</span>
      <h1 style={{ marginTop: "0.6rem" }}>Sign in</h1>
      <p className="lead">Use your Academic City email to continue.</p>
      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@acity.edu.gh"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <div className="banner error">{error}</div> : null}
        <button
          className="btn primary stretch large"
          type="submit"
          disabled={submitting}
        >
          <span className="btn-inner">
            {submitting ? <Spinner /> : null}
            {submitting ? "Signing in…" : "Sign in"}
          </span>
        </button>
      </form>
      <p className="muted small" style={{ marginTop: "1.1rem", textAlign: "center" }}>
        Don't have an account?{" "}
        <Link className="inline-link" to="/register">
          Create one
        </Link>
      </p>
    </section>
  );
}
