import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { BrandedLoader } from "../components/BrandedLoader";
import type { Listing } from "../types";

export function ListingCreatePage() {
  return <ListingEditor mode="new" />;
}

export function ListingEditPage({ id }: { id: string }) {
  return <ListingEditor mode="edit" listingId={id} />;
}

function ListingEditor({ mode, listingId }: { mode: "new" | "edit"; listingId?: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"item" | "skill">("item");
  const [skillSubtype, setSkillSubtype] = useState<"offer" | "request" | "">("");
  const [status, setStatus] = useState<"available" | "sold" | "swapped">("available");
  const [error, setError] = useState<string | null>(null);
  const [listingLoad, setListingLoad] = useState(mode === "edit");

  useEffect(() => {
    if (mode !== "edit" || !listingId) {
      setListingLoad(false);
      return;
    }
    let cancelled = false;
    setListingLoad(true);
    apiFetch<Listing>(`/api/listings/${listingId}`)
      .then((l) => {
        if (cancelled) return;
        if (user && l.sellerId !== user.id) {
          setError("You can only edit your own listings.");
          return;
        }
        setTitle(l.title);
        setDescription(l.description);
        setCategory(l.category);
        setSkillSubtype(l.skillSubtype ?? "");
        setStatus(l.status);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => {
        if (!cancelled) setListingLoad(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId, mode, user]);

  if (!user) {
    return <div className="panel narrow">Please log in to create or edit listings.</div>;
  }

  if (listingLoad) {
    return (
      <section className="panel narrow">
        <BrandedLoader label="Loading listing" size="default" />
      </section>
    );
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setError(null);
    if (category === "skill" && !skillSubtype) {
      setError("Skill listings require either “offer” or “request”.");
      return;
    }

    try {
      if (mode === "new") {
        await apiFetch<Listing>(`/api/listings`, {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            category,
            skillSubtype: category === "skill" ? skillSubtype : null,
            status,
          }),
        }).then(() => navigate("/"));
      } else if (listingId) {
        await apiFetch<Listing>(`/api/listings/${listingId}`, {
          method: "PATCH",
          body: JSON.stringify({
            title,
            description,
            category,
            skillSubtype: category === "skill" ? skillSubtype : null,
            status,
          }),
        }).then(() => navigate(`/listings/${listingId}`));
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="panel narrow">
      <span className="hero-eyebrow">
        {mode === "new" ? "New listing" : "Edit listing"}
      </span>
      <h1 style={{ marginTop: "0.6rem" }}>
        {mode === "new" ? "Post to the marketplace" : "Update your listing"}
      </h1>
      <p className="lead">
        Listings appear in the public feed once a moderator approves them. You can always
        see your own drafts.
      </p>
      <form className="form" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="e.g. Discrete Math textbook (2nd ed.)"
          />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Condition, location, exchange ideas..."
          />
        </label>
        <label className="field">
          <span>Listing category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
          >
            <option value="item">Item sale</option>
            <option value="skill">Skill listing</option>
          </select>
        </label>
        {category === "skill" && (
          <label className="field">
            <span>Skill direction</span>
            <select
              value={skillSubtype}
              onChange={(e) => setSkillSubtype(e.target.value as typeof skillSubtype)}
              required
            >
              <option value="">Select…</option>
              <option value="offer">Offering a skill</option>
              <option value="request">Requesting a skill</option>
            </select>
          </label>
        )}
        <label className="field">
          <span>Availability status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="swapped">Swapped</option>
          </select>
        </label>
        {error ? <div className="banner error">{error}</div> : null}
        <button className="btn primary stretch large" type="submit">
          {mode === "new" ? "Submit listing" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
