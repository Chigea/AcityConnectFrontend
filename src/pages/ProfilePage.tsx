import { type FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { BrandedLoader, Spinner } from "../components/BrandedLoader";
import type { UserPublic } from "../types";

export function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserPublic | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<UserPublic>(`/api/users/${id}`)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [id]);

  if (!id) return <div className="panel">Missing profile id.</div>;
  if (!profile)
    return (
      <div className="panel">
        <BrandedLoader label="Loading profile" size="default" />
      </div>
    );

  const initials = (profile.displayName ?? profile.email)
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <section className="panel">
      <Link className="inline-link small" to="/" style={{ display: "inline-block", marginBottom: "0.6rem" }}>
        ← Back to discover
      </Link>

      <div className="panel-head-between">
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div
            className="who-avatar"
            style={{ width: 56, height: 56, fontSize: "1.15rem", borderRadius: 16 }}
          >
            {initials || "U"}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>{profile.displayName ?? profile.email}</h1>
            <p className="muted small" style={{ marginTop: "0.2rem" }}>{profile.email}</p>
          </div>
        </div>
        {user?.id === profile.id ? (
          <Link className="btn outline" to="/profile/edit">
            Edit profile
          </Link>
        ) : null}
      </div>

      <p style={{ marginTop: "1rem", color: "var(--ink-soft)" }}>
        {profile.bio ?? <span className="muted">No biography yet.</span>}
      </p>

      <SkillBlock title="Skills offered" values={profile.skillsOffered} />
      <SkillBlock title="Skills needed" values={profile.skillsNeeded} />
    </section>
  );
}

function SkillBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="stack">
      <h3>{title}</h3>
      {values?.length ? (
        <ul className="pill-list">
          {values.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="muted small">None listed yet.</p>
      )}
    </div>
  );
}

export function ProfileEditPage() {
  const { user, refreshMe } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skillsOffered, setOffered] = useState("");
  const [skillsNeeded, setNeeded] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? "");
    setBio(user.bio ?? "");
    setOffered(user.skillsOffered.join(", "));
    setNeeded(user.skillsNeeded.join(", "));
  }, [user]);

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      await apiFetch<UserPublic>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          displayName,
          bio,
          skillsOffered: skillsOffered
            ? skillsOffered.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          skillsNeeded: skillsNeeded
            ? skillsNeeded.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });
      await refreshMe();
      setMessage("Profile saved.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return <div className="panel">Sign in first.</div>;

  return (
    <section className="panel narrow">
      <h1>Edit profile</h1>
      <p className="lead">Update what others see and the skills you offer or need.</p>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Display name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A few sentences about you" />
        </label>
        <label className="field">
          <span>Skills offered <small className="muted">(comma-separated)</small></span>
          <textarea rows={2} value={skillsOffered} onChange={(e) => setOffered(e.target.value)} placeholder="e.g. Python tutoring, Logo design" />
        </label>
        <label className="field">
          <span>Skills needed <small className="muted">(comma-separated)</small></span>
          <textarea rows={2} value={skillsNeeded} onChange={(e) => setNeeded(e.target.value)} placeholder="e.g. SwiftUI, Public speaking" />
        </label>
        {message ? <div className="banner success">{message}</div> : null}
        <button className="btn primary stretch large" type="submit" disabled={submitting}>
          <span className="btn-inner">
            {submitting ? <Spinner /> : null}
            {submitting ? "Saving…" : "Save profile"}
          </span>
        </button>
      </form>
    </section>
  );
}
