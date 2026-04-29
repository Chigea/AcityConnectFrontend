import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { BrandedLoader } from "../components/BrandedLoader";

type Conv = {
  id: string;
  updatedAt: string;
  buyerId: string;
  listing: { id: string; title: string; sellerId: string };
  messages?: {
    id: string;
    body: string;
    createdAt: string;
    sender?: { displayName: string | null };
  }[];
};

export function ConversationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Conv[]>([]);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    apiFetch<{ conversations: Conv[] }>(`/api/conversations`)
      .then((r) => setItems(r.conversations))
      .catch(() => null)
      .finally(() => setPending(false));
  }, []);

  if (!user) return <div className="panel">Sign in to see messages.</div>;

  return (
    <section className="panel">
      <h1>Messages</h1>
      <p className="lead">Threads start when you tap "I'm interested" on a listing.</p>

      {pending ? (
        <BrandedLoader label="Loading conversations" size="default" />
      ) : null}

      {!pending && items.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", marginTop: "1rem" }}>
          <h3>No conversations yet</h3>
          <p className="muted small">Reach out from a listing detail page to begin chatting.</p>
          <div style={{ marginTop: "0.85rem" }}>
            <Link className="btn primary" to="/">
              Browse listings
            </Link>
          </div>
        </div>
      ) : null}

      {!pending && items.length > 0 && (
        <ul className="table-list">
          {items.map((c) => {
            const preview = c.messages?.[0];
            const role = c.listing.sellerId === user.id ? "as seller" : "as buyer";
            return (
              <li key={c.id}>
                <Link
                  to={`/conversations/${c.id}`}
                  className="table-row"
                  style={{ textDecoration: "none" }}
                >
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block" }}>{c.listing.title}</strong>
                    <div className="muted small" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {preview
                        ? `${preview.sender?.displayName ?? "You"}: ${preview.body}`
                        : `Tap to start the conversation ${role}.`}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                    <span className="pill subdued">{role}</span>
                    <span className="muted tiny">{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
