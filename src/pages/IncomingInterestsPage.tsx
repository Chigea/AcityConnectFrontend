import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { BrandedLoader } from "../components/BrandedLoader";

type IncomingRow = {
  id: string;
  status: string;
  user: { id: string; email: string; displayName: string | null };
  listing: { id: string; title: string };
};

export function IncomingInterestsPage() {
  const [items, setItems] = useState<IncomingRow[]>([]);
  const [pending, setPending] = useState(true);

  async function reload() {
    const res = await apiFetch<{ interests: IncomingRow[] }>(
      `/api/interests/incoming`
    ).catch(() => ({ interests: [] }));
    setItems(res.interests);
    setPending(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function updateStatus(row: IncomingRow, status: string) {
    await apiFetch(`/api/listings/${row.listing.id}/interests/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    reload();
  }

  return (
    <section className="panel">
      <h1>Inbox</h1>
      <p className="lead">
        People who are interested in your listings. Accept, decline, or close out completed swaps.
      </p>

      {pending ? <BrandedLoader label="Loading inbox" size="default" /> : null}

      {!pending && items.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", marginTop: "1rem" }}>
          <h3>No interest yet</h3>
          <p className="muted small">When someone taps Interested on your listing, they'll appear here.</p>
        </div>
      ) : null}

      {!pending && items.length > 0 && (
        <ul className="table-list">
          {items.map((row) => (
            <li key={row.id}>
              <div className="table-row">
                <div>
                  <strong>
                    <Link className="inline-link" to={`/listings/${row.listing.id}`}>
                      {row.listing.title}
                    </Link>
                  </strong>
                  <div className="muted small">
                    From {row.user.displayName ?? row.user.email}
                  </div>
                </div>
                <span className={`status status-${row.status}`}>{row.status}</span>
              </div>
              <div className="incoming-actions">
                <button type="button" className="btn outline tiny" onClick={() => updateStatus(row, "accepted")}>
                  Accept
                </button>
                <button type="button" className="btn ghost tiny" onClick={() => updateStatus(row, "declined")}>
                  Decline
                </button>
                <button type="button" className="btn ghost tiny" onClick={() => updateStatus(row, "completed")}>
                  Mark completed
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
