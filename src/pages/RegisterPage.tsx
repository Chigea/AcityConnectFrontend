import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { Spinner } from "../components/BrandedLoader";
import type { UserPublic } from "../types";

export function RegisterPage() {
  const { loginFromResponse } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
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
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            ...(displayName.trim() ? { displayName } : {}),
          }),
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
      <span className="hero-eyebrow">Get started</span>
      <h1 style={{ marginTop: "0.6rem" }}>Create your account</h1>
      <p className="lead">
        Open only to verified Academic City emails (<code>@acity.edu.gh</code>).
      </p>
      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          <span>Display name</span>
          <input
            placeholder="Shown on listings and profile"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Academic City email</span>
          <input
            type="email"
            required
            placeholder="you@acity.edu.gh"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Password (minimum 8 characters)</span>
          <input
            type="password"
            minLength={8}
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
            {submitting ? "Creating…" : "Create account"}
          </span>
        </button>
      </form>
      <p className="muted small" style={{ marginTop: "1.1rem", textAlign: "center" }}>
        Already have access?{" "}
        <Link className="inline-link" to="/login">
          Sign in
        </Link>
      </p>
    </section>
  );
}
