import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { BrandedLoader } from "../components/BrandedLoader";
import type { Listing } from "../types";

export function FeedPage() {
  const [params, setParams] = useSearchParams();
  const qParam = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const status = params.get("status") ?? "";

  const { user } = useAuth();
  const [items, setItems] = useState<Listing[]>([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = new URLSearchParams();
    if (qParam) search.set("q", qParam);
    if (category) search.set("category", category);
    if (status) search.set("status", status);
    const qs = search.toString();
    setPending(true);
    apiFetch<{ listings: Listing[] }>(`/api/listings${qs ? `?${qs}` : ""}`)
      .then((r) => {
        setItems(r.listings);
        setError(null);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setPending(false));
  }, [qParam, category, status]);

  return (
    <>
      <section className="hero">
        <span className="hero-eyebrow">For Academic City</span>
        <h1>Trade items. Trade skills. Build campus.</h1>
        <p className="lead">
          A trusted marketplace and skill exchange, open to everyone with an
          {" "}
          <code>@acity.edu.gh</code> address. Find textbooks, gear, and the
          peers who can teach you what you need next.
        </p>
        <div className="actions-row">
          {user ? (
            <Link className="btn primary large" to="/listings/new">
              Post a listing
            </Link>
          ) : (
            <>
              <Link className="btn primary large" to="/register">
                Create your account
              </Link>
              <Link className="btn outline large" to="/login">
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <form
          className="filter-bar"
          onSubmit={(ev) => {
            ev.preventDefault();
            const fd = new FormData(ev.currentTarget);
            const next = new URLSearchParams();
            const q = String(fd.get("q") ?? "").trim();
            const cat = String(fd.get("category") ?? "");
            const st = String(fd.get("status") ?? "");
            if (q) next.set("q", q);
            if (cat) next.set("category", cat);
            if (st) next.set("status", st);
            setParams(next);
          }}
        >
          <label className="field">
            <span>Search</span>
            <input
              name="q"
              defaultValue={qParam}
              placeholder="Search title or description"
            />
          </label>
          <label className="field">
            <span>Category</span>
            <select name="category" defaultValue={category}>
              <option value="">Any</option>
              <option value="item">Items</option>
              <option value="skill">Skills</option>
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={status}>
              <option value="">Any</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="swapped">Swapped</option>
            </select>
          </label>
          <button className="btn primary" type="submit">
            Apply
          </button>
        </form>

        {error ? <div className="banner error" style={{ marginTop: "1rem" }}>{error}</div> : null}

        {pending ? (
          <div className="feed-loader-wrap">
            <BrandedLoader label="Loading listings" size="default" />
          </div>
        ) : items.length === 0 ? (
          <div className="panel" style={{ textAlign: "center", marginTop: "1rem" }}>
            <h3>No matches</h3>
            <p className="muted small">Try clearing filters or be the first to post here.</p>
          </div>
        ) : (
          <ul className="cards">
            {items.map((l) => (
              <li key={l.id} className="card">
                <div className="card-head">
                  <span className="pill accent">{l.category}</span>
                  {l.skillSubtype && (
                    <span className="pill subdued">{l.skillSubtype}</span>
                  )}
                  <span className={`status status-${l.status}`}>{l.status}</span>
                </div>
                <Link to={`/listings/${l.id}`} className="card-title">
                  {l.title}
                </Link>
                <p className="card-body clamp">{l.description}</p>
                <footer className="card-foot">
                  <span>{l.seller.displayName ?? l.seller.email.split("@")[0]}</span>
                  <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                </footer>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
