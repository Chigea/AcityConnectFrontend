import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import type { Listing } from "../types";
import { BrandedLoader } from "../components/BrandedLoader";

type AdminStats = {
  users: number;
  listingsByStatus: { status: string; _count: { _all: number } }[];
  pendingModeration: number;
  totalInteractions: number;
  messagesLast7Days: number;
  conversationsTotal: number;
};

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingItems, setPendingItems] = useState<Listing[]>([]);

  async function reload() {
    try {
      const s = await apiFetch<AdminStats>(`/api/admin/stats`);
      setStats(s);
    } catch {
      setStats(null);
    }
    try {
      const lst = await apiFetch<{ listings: Listing[] }>(
        `/api/listings?moderation=pending`
      );
      setPendingItems(lst.listings ?? []);
    } catch {
      setPendingItems([]);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function moderate(id: string, moderationStatus: "approved" | "rejected") {
    await apiFetch(`/api/admin/listings/${id}/moderate`, {
      method: "PATCH",
      body: JSON.stringify({ moderationStatus }),
    });
    reload();
  }

  async function removeListing(id: string) {
    if (!confirm("Delete listing permanently?")) return;
    await apiFetch(`/api/admin/listings/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <>
      <section className="panel">
        <span className="hero-eyebrow">Admin</span>
        <h1 style={{ marginTop: "0.6rem" }}>Platform overview</h1>
        <p className="lead">Approve drafts, intervene on flagged content, and watch platform vitality.</p>

        {!stats ? (
          <BrandedLoader label="Loading admin stats" size="default" />
        ) : (
          <div className="stats-grid">
            <article className="stat-card">
              <h3>{stats.users}</h3>
              <p>registered members</p>
            </article>
            <article className="stat-card warning">
              <h3>{stats.pendingModeration}</h3>
              <p>awaiting moderation</p>
            </article>
            <article className="stat-card">
              <h3>{stats.totalInteractions}</h3>
              <p>interest events</p>
            </article>
            <article className="stat-card">
              <h3>{stats.messagesLast7Days}</h3>
              <p>messages (7 days)</p>
            </article>
            <article className="stat-card subtle">
              <h3>{stats.conversationsTotal}</h3>
              <p>conversations lifetime</p>
            </article>
            <article className="stat-card subtle">
              <h3>
                {stats.listingsByStatus.reduce((acc, row) => acc + row._count._all, 0)}
              </h3>
              <p>captured listings counted</p>
            </article>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head-between">
          <div>
            <h2>Moderation queue</h2>
            <p className="lead">Drafts that need a human before going public.</p>
          </div>
          <span className="pill accent">
            {pendingItems.length} pending
          </span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="panel" style={{ textAlign: "center", marginTop: "1rem" }}>
            <h3>All caught up</h3>
            <p className="muted small">There's nothing waiting for review right now.</p>
          </div>
        ) : (
          <ul className="table-list">
            {pendingItems.map((l) => (
              <AdminRow
                key={l.id}
                listing={l}
                onApprove={() => moderate(l.id, "approved")}
                onReject={() => moderate(l.id, "rejected")}
                onDelete={() => removeListing(l.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function AdminRow({
  listing,
  onApprove,
  onReject,
  onDelete,
}: {
  listing: Listing;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editableTitle, setTitle] = useState(listing.title);

  async function patchTitle(ev: FormEvent) {
    ev.preventDefault();
    await apiFetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: editableTitle }),
    });
  }

  return (
    <li>
      <div className="table-row">
        <div>
          <strong>
            <Link className="inline-link" to={`/listings/${listing.id}`}>
              {editableTitle}
            </Link>
          </strong>
          <div className="muted small">{listing.seller.email}</div>
        </div>
        <span className="pill accent">{listing.category}</span>
      </div>

      <form className="mini-form" onSubmit={patchTitle}>
        <label>
          Quick edit title
          <input value={editableTitle} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <button type="submit" className="btn outline tiny">
          Save title
        </button>
      </form>

      <div className="incoming-actions">
        <button type="button" className="btn primary tiny" onClick={() => void onApprove()}>
          Approve
        </button>
        <button type="button" className="btn ghost tiny" onClick={() => void onReject()}>
          Reject
        </button>
        <button type="button" className="btn danger tiny" onClick={() => void onDelete()}>
          Delete
        </button>
        <AdminFlagListing id={listing.id} />
      </div>
    </li>
  );
}

function AdminFlagListing({ id }: { id: string }) {
  const [reason, setReason] = useState("");

  return (
    <form
      className="mini-form stacked"
      style={{ width: "100%", padding: 0 }}
      onSubmit={async (ev) => {
        ev.preventDefault();
        await apiFetch(`/api/admin/listings/${id}/flag`, {
          method: "PATCH",
          body: JSON.stringify({ flagged: true, reason }),
        });
        alert("Listing flagged for review.");
      }}
    >
      <label style={{ flex: 1 }}>
        Flag reason
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this content inappropriate?" />
      </label>
      <button type="submit" className="btn danger tiny">
        Flag content
      </button>
    </form>
  );
}
