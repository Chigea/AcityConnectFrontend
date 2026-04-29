import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { BrandedLoader } from "../components/BrandedLoader";

type MineRow = {
  id: string;
  status: string;
  listing: {
    id: string;
    title: string;
    seller?: { email: string; displayName: string | null };
  };
};

export function MyInterestsPage() {
  const [items, setItems] = useState<MineRow[]>([]);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    apiFetch<{ interests: MineRow[] }>(`/api/interests/mine`)
      .then((res) => setItems(res.interests))
      .finally(() => setPending(false));
  }, []);

  return (
    <section className="panel">
      <h1>My interests</h1>
      <p className="lead">Listings you've reached out about and the latest status from sellers.</p>

      {pending ? <BrandedLoader label="Loading interests" size="default" /> : null}

      {!pending && items.length === 0 ? (
        <div className="panel" style={{ textAlign: "center", marginTop: "1rem" }}>
          <h3>Nothing to track yet</h3>
          <p className="muted small">Tap "I'm interested" on a listing and it will land here.</p>
          <div style={{ marginTop: "0.85rem" }}>
            <Link className="btn primary" to="/">
              Discover listings
            </Link>
          </div>
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
                  {row.listing.seller && (
                    <div className="muted small">
                      Seller · {row.listing.seller.displayName ?? row.listing.seller.email}
                    </div>
                  )}
                </div>
                <span className={`status status-${row.status}`}>{row.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
