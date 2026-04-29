import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { BrandedLoader } from "./BrandedLoader";

export function Layout() {
  const { user, logout, ready } = useAuth();
  const nav = useNavigate();

  const initials = (user?.displayName ?? user?.email ?? "?")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-link" aria-label="ACITY Connect home">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="ACITY Connect"
              className="brand-logo"
            />
          </Link>

          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end>
              Discover
            </NavLink>
            {user && (
              <>
                <NavLink to="/listings/new">Post</NavLink>
                <NavLink to="/interests/mine">My interests</NavLink>
                <NavLink to="/interests/incoming">Inbox</NavLink>
                <NavLink to="/conversations">Messages</NavLink>
                {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
                <NavLink to={`/profile/${user.id}`}>Profile</NavLink>
              </>
            )}
          </nav>

          <div className="auth-actions">
            {!ready ? (
              <BrandedLoader label="Loading session" size="compact" />
            ) : user ? (
              <>
                <span className="who">
                  <span className="who-avatar" aria-hidden>
                    {initials || "U"}
                  </span>
                  <span>{user.displayName ?? user.email.split("@")[0]}</span>
                </span>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="btn ghost" to="/login">
                  Sign in
                </Link>
                <Link className="btn primary" to="/register">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        Built for Academic City University College · Institutional sign-in only
      </footer>
    </div>
  );
}
