# ACITY CONNECT: Frontend (React + Vite)

Single-page React app for the ACITY CONNECT academic marketplace: onboarding, moderated listings browse/create, messaging, interest dashboards, and an admin cockpit when your account carries the `admin` role.

Uses **Hash Routing** (`HashRouter`) so deep links behave on GitHub Pages without extra infra.

## Deployment links

| Surface | Purpose |
|---------|---------|
| **GitHub Pages** | Paste your published URL (`https://<user>.github.io/<repo>/` or mapped custom domain). |
| **Backend API** | Document the companion Render hostname (see Backend coursework README). |
| **CI workflow** | [`.github/workflows/frontend-pages.yml`](../.github/workflows/frontend-pages.yml) uploads `frontend/dist`. |

Automate GitHub Pages deploys via the included **`frontend-pages`** workflow (located under `.github/workflows/` when you preserve the monorepo layout).


## Assignment README sections

### Project overview & technology

ACITY CONNECT empowers Academic City learners to circulate second-hand items and complementary skills securely. Institutional (`@ACITY`) signup keeps the network authentic. This SPA pairs with the Node.js + PostgreSQL backend described in its separate coursework README.

Stack: React 19 · Vite · TypeScript · React Router (hash mode).

### Demo logins

| Role | Username | Password |
|------|-----------|----------|
| Student | `fidelia.chimezie@acity.edu.gh` | `Password123!` |
| Administrator | `admin@acity.edu.gh` | `Password123!` |

### Feature checklist vs rubric

1. Users & profiles: login/register gated to institutional domains, editable profile/skills surfaces.
2. Marketplace: create listings (items/skills), search + filter feeds, statuses visible.
3. Interactions: “Interested”, messaging inbox, statuses for interests.
4. Admin: moderator queue (`/admin`), KPI stats pulled from `/api/admin/stats`, flag/remove actions.

Tick each checkbox in your coursework PDF after verifying in the deployed build.

### Live URLs (fill during deployment)

```
Frontend (GitHub Pages): https://YOUR-GH-PAGES-HOST/path/
Backend API (Render):    https://YOUR-RENDER-HOST/api/health → { "ok": true }
```

Replace placeholders when you ship.

### Local installation

```bash
cd frontend
npm install
cp .env.example .env.local             # REQUIRED: set VITE_API_URL=http://localhost:4000 (or tunnel)
npm run dev                            # listens on http://localhost:5173
```

Ensure the backend is running concurrently with matching CORS `FRONTEND_ORIGIN` for `http://localhost:5173`.

Build for production/GitHub Actions:

```
npm run build
```

Artifacts land in `dist/`. For GitHub project pages rooted at `/repo/`, compile with:

```
VITE_API_URL="https://api.example.com"
VITE_BASE_PATH="/repo/"
npm run build
```

### Notes

- `VITE_*` vars are baked in at compile time. Update secrets and rebuild Pages when rotating API URLs.
- `sessionStorage` stores JWTs suitable for demos; tightening to http-only cookies belongs in hardened deployments.
