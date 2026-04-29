import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { BrandedLoader, Spinner } from "../components/BrandedLoader";
import type { Listing } from "../types";

export function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<Listing>(`/api/listings/${id}`)
      .then(setListing)
      .catch((e) => setError((e as Error).message));
  }, [id]);

  async function onInterested() {
    if (!listing || !user) return;
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/api/listings/${listing.id}/interest`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await apiFetch(`/api/conversations`, {
        method: "POST",
        body: JSON.stringify({ listingId: listing.id }),
      }).catch(() => null);
      navigate(`/conversations`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteMine() {
    if (!listing) return;
    if (!confirm("Delete this listing?")) return;
    await apiFetch(`/api/listings/${listing.id}`, { method: "DELETE" }).then(() =>
      navigate("/")
    );
  }

  if (!id) return <div className="panel">Missing listing id.</div>;
  if (error && !listing) return <div className="panel banner error">{error}</div>;
  if (!listing)
    return (
      <div className="panel">
        <BrandedLoader label="Loading listing" size="default" />
      </div>
    );

  const isSeller = user?.id === listing.sellerId;

  return (
    <article className="panel">
      <Link className="inline-link small" to="/" style={{ display: "inline-block", marginBottom: "0.6rem" }}>
        ← Back to discover
      </Link>

      <div className="panel-head-between">
        <div style={{ minWidth: 0 }}>
          <div className="card-head" style={{ marginBottom: "0.5rem" }}>
            <span className="pill accent">{listing.category}</span>
            {listing.skillSubtype && (
              <span className="pill subdued">{listing.skillSubtype}</span>
            )}
            <span className={`status status-${listing.status}`}>{listing.status}</span>
          </div>
          <h1>{listing.title}</h1>
          <p className="meta">
            Posted by{" "}
            <Link className="inline-link" to={`/profile/${listing.seller.id}`}>
              {listing.seller.displayName ?? listing.seller.email.split("@")[0]}
            </Link>
            {" · "}
            {new Date(listing.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="description">{listing.description}</div>

      {!isSeller ? (
        <div className="actions-row">
          {user ? (
            <button className="btn primary large" type="button" onClick={onInterested} disabled={busy}>
              <span className="btn-inner">
                {busy ? <Spinner /> : null}
                {busy ? "Sending…" : "I'm interested"}
              </span>
            </button>
          ) : (
            <Link className="btn primary large" to="/login">
              Sign in to show interest
            </Link>
          )}
        </div>
      ) : (
        <div className="actions-row">
          <Link className="btn outline" to={`/listings/${listing.id}/edit`}>
            Edit listing
          </Link>
          <button type="button" className="btn danger" onClick={deleteMine}>
            Delete listing
          </button>
        </div>
      )}
      <p className="muted tiny" style={{ marginTop: "1.25rem" }}>
        Moderation status: {listing.moderationStatus}
        {" · "}Updated {new Date(listing.updatedAt).toLocaleString()}
      </p>
      {error ? <div className="banner error" style={{ marginTop: "1rem" }}>{error}</div> : null}
    </article>
  );
}
