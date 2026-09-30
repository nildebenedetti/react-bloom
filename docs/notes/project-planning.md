# Bloom — Project Plan

Full-stack milestone tracking. A **Laravel 13** JSON API already exists and is complete.
This plan covers the work required to build the **React 19 SPA** that consumes it.

| | |
| --- | --- |
| Backend | `../Laravel/laravel-bloom` — API at `http://localhost:8000/api` |
| Frontend | this repo — Vite 8 dev server, must answer on `http://localhost:5173` |
| Auth | Sanctum personal access tokens, `Authorization: Bearer <token>` |
| Contract | `laravel-bloom-readme.md` (overview) + `../Laravel/laravel-bloom/docs/api/reference.md` (exact) |
| Style | Bootstrap 5.3.8 (already installed) + CSS custom properties |
| Motion | Framer Motion · Charts Recharts |

**Terminology** follows the domain metaphor: a record is a **bloom**, its emotions are the
**prism** it refracts through, and the public feed is the **meadow**.

---

## Route map (target)

| Path | View | Guard |
| --- | --- | --- |
| `/` | redirect → `/meadow` | — |
| `/meadow` | Blooming Meadow, public feed | public |
| `/about` | Platform manifesto | public |
| `/login` | Sign in | guest only |
| `/register` | Create account | guest only |
| `/records` | Journal, filterable card grid | protected |
| `/records/new` | Create record | protected |
| `/records/:id` | Record detail | protected (owner) |
| `/records/:id/edit` | Edit record | protected (owner) |
| `/prism` | Emotion gallery | protected |
| `/dashboard` | Analytics (Recharts) | protected |
| `*` | 404 | — |

There is **no admin surface in the SPA**. `/admin/*` stays server-rendered Blade; the SPA
receives `user.role` and may display it, but must not render admin affordances.

---

## 📌 Phase 0 — Blockers to resolve before writing views

The API is functional but has documented defects that directly gate the frontend. Decide
these first; several are one-line backend fixes that unblock whole phases.

- [ ] **B1. Taxonomy has no API.** There is no `GET /api/categories`, `/api/tiers` or
      `/api/emotions`. `POST /api/records` requires `category_id` and `tier_id`, and
      `/api/records?category_id=&tier_id=` filters need them, but `RecordResource`
      returns only **names**, never ids. Emotion ids *are* available (nested
      `emotions[].id`); category and tier ids are not.
      *Decision required.* Recommended: add three read-only authenticated endpoints
      returning `{id, name, color?}` (~1h backend). Fallback: hardcode the seeded
      taxonomy in `src/constants/taxonomy.js` (12 categories, 4 tiers, 7 emotions, ids
      assigned in seeder order) — correct only on a freshly seeded database.
- [ ] **B2. `POST /api/records` returns 500 on every request** (`$unset(...)` is a
      variable, not the language construct). The create form cannot be verified until
      fixed — one-character fix, `unset($validated['image'])`.
- [ ] **B3. `PUT/PATCH /api/records/{id}` always 422s on partial updates.** The same
      `StoreRecordRequest` is used for create and update, and every field is `required`.
      *Frontend must send the complete representation on every edit* until an
      `UpdateRecordRequest` exists.
- [ ] **B4. `DELETE` returns 500 for any record that has an image**, and non-owners get
      500 instead of 403 (missing `$this->` in two call sites). Affects record deletion
      and ownership error handling.
- [ ] **B5. Image replacement on update is dead code** (`hasFile('iamge')`), and the
      referenced `Storage::disk('records')` does not exist. Image upload on *create* also
      stores the file *before* the crash in B2, so every failed attempt orphans a file.
- [ ] **B6. `/api/blooming-meadow` leaks author emails** to anonymous callers. The SPA
      must **not render `relationships.user['user email']`** on the public feed.
- [ ] **B7. CORS origin is hardcoded** to `http://localhost:5173` in `config/cors.php`
      and ignores `FRONTEND_URL`. Any other port fails preflight with no server log
      entry. Frontend mitigations: pin Vite with `strictPort` (see F2) or proxy `/api`
      through Vite.

---

## 📌 Phase 1 — Backend Laravel ✅ complete (14–18h)

- [x] Migrations, Eloquent relations, `RecordVisibility` enum
- [x] Seeders and factories (12 categories, 4 tiers, 7 emotions, 2 users, 10 records)
- [x] Local disk image storage (`storage/app/public`, `public/storage` symlinked)
- [x] `Api\*` controllers and routes — records CRUD, filters, ordering, pagination
- [x] Public endpoint `GET /api/blooming-meadow`
- [x] Aggregated dashboard endpoint `GET /api/dashboard/stats` (spider / pie / area)
- [x] `RecordResource` JSON:API-shaped envelope, Form Requests, Sanctum token auth
- [ ] **B1–B7 above** are follow-ups to this phase, not new scope

---

## 📌 Phase 2 — Frontend foundation (7–9h)

### 🔹 Dependencies and tooling `1h`

- [ ] **F1. Add runtime libraries:** `recharts` (mandated by ADR-0014), `framer-motion`
- [ ] **F2. Pin the dev server port** in `vite.config.js` — Vite auto-increments to 5174
      when 5173 is busy, which breaks CORS with no obvious error:
      ```js
      server: { port: 5173, strictPort: true }
      ```
- [ ] **F3. Add `VITE_API_URL=http://localhost:8000/api`** to a `.env` file (and
      `.env.example`); never hardcode the base URL
- [ ] **F4. Add dev/quality tooling:** `vitest`, `@testing-library/react`,
      `@testing-library/jest-dom`, `msw` (needed — see F9)
- [ ] **F5. Set the document title and favicon** in `index.html` (`react-props` → Bloom)

### 🔹 API client layer `2-3h`

- [ ] **F6. `src/api/client.js`** — a single `fetch` wrapper owning: base URL from env,
      `Authorization: Bearer <token>` injection, `Content-Type` selection
      (JSON vs `FormData`), `Accept: application/json`, and a `normalizeError` step
- [ ] **F7. Normalize the three incompatible error shapes.** The API returns:
      | Origin | Shape |
      | --- | --- |
      | `AuthController` | `{ status, message, data }` |
      | validation `422` | `{ message, errors: { field: [msg] } }` |
      | missing token `401` | `{ message: "Unauthenticated." }` |
      | broken handlers `500` | unhandled, may be HTML when `APP_DEBUG=true` |
      Expose one shape: `{ status, message, fieldErrors, isNetwork, isAuth }`
- [ ] **F8. Token store** — `src/api/token.js`, reads/writes `localStorage`, plus
      `clearOnUnauthorized`. Do **not** branch logic on the `status` string: it is
      misspelled (`"Request was successfull"`) and `message` is the literal
      `"$message"`. Trust the HTTP status code instead.
- [ ] **F9. MSW handlers + fixtures** mirroring every endpoint, including the
      `attributes["category "]` trailing-space key, ISO-timestamp `date` and the
      `{tier_1, tier_2, …}` area keys. This is what makes B2–B5 testable today.
- [ ] **F10. `src/api/records.js`, `meadow.js`, `prism.js`, `dashboard.js`, `auth.js`** —
      one function per endpoint, no component ever calls `fetch` directly
- [ ] **F11. Serialize array query params** as repeated keys — `emotions[]=1&emotions[]=3`,
      never `emotions=1,3` (`URLSearchParams.append` in a loop)

### 🔹 Design system and theming `2-3h`

- [x] **F12. Decide the styling strategy.** The previous plan mentioned Tailwind; the
      project ships **Bootstrap 5.3.8 and no Tailwind**. Recommendation: keep Bootstrap and
      layer **CSS custom properties** under `src/styles/` (split into `theme/tokens.css`,
      `base.css`, `components.css`, manifest `index.css`). No new build step.
- [x] **F13. Wire the PRD palette** to variables on `:root` and `[data-bs-theme="dark"]`:
      light `#F8FAFC` / `#93C5FD`, dark `#1E293B` / `#E2E8F0`, plus semantic
      `--bloom-surface`, `--bloom-border`, `--bloom-text-muted` — *landed as a three-layer
      system in `index.css`: a `--bs-*` bridge (the handful of Bootstrap roots every
      component derives from) plus `--bloom-*` semantic tokens, both declared per theme.*
- [x] **F14. Extend `ThemeContext`** (already present) with `setTheme`, and **persist the
      choice** to `localStorage`, reading it in an initializer so there is no light flash.
      Keep the existing `useTheme` guard hook as the model for further contexts. — *done:
      `THEME_STORAGE_KEY` + lazy `useState` initializer + `useLayoutEffect` write, and a
      pre-paint inline script in `index.html`.*
- [ ] **F15. Export the palette as JS constants too** — CSS variables cannot reach SVG
      fills drawn by Recharts; chart colours need a shared `src/styles/tokens.js`
- [ ] **F16. Shared primitives** in `src/components/ui/`: `Button`, `Badge`, `Card`,
      `Spinner`, `EmptyState`, `ErrorState`, `Pagination`, `ConfirmDialog`,
      `Toast`/`Alert`, `Modal`, `Field` (label + error + hint wrapper)

### 🔹 App shell, layout and navigation `2h`

- [ ] **F17. `MainLayout`** (exists) — extend with a skip-link, `<main id="main">`, and a
      page container
- [ ] **F18. Two shells:** `MainLayout` for public pages, `DashboardLayout` for the
      private suite (sidebar hub + contextual motivational copy per the PRD)
- [ ] **F19. `Header`** — conditional nav by auth state, active state via `NavLink`,
      user badge with initials, theme toggle (already present), mobile collapse
- [ ] **F20. `Footer`** — real copy, not `MyApp`
- [ ] **F21. Route transitions with Framer Motion** — `AnimatePresence` keyed on
      `location.pathname`, respecting `prefers-reduced-motion`

---

## 📌 Phase 3 — Auth and route guards (3–4h)

- [ ] **F22. `AuthContext`** exposing `user`, `isAuthenticated`, `isBootstrapping`,
      `login`, `register`, `logout` — the `useAuth` hook must throw outside its provider,
      mirroring `useTheme`
- [ ] **F23. Session bootstrap** — on mount, if a token exists call `GET /api/user` to
      validate it; on `401` clear the token and treat the session as anonymous. This is
      what makes a hard refresh on a deep link work
- [ ] **F24. `login(email, password)`** → `POST /api/login`, persist `data.token` and
      `data.user`, then redirect to the `from` location
- [ ] **F25. `register(name, email, password, password_confirmation)`** →
      `POST /api/register`. **`password_confirmation` is mandatory** — omitting it is a
      422. Note the endpoint returns `200`, not `201`
- [ ] **F26. `logout()`** → `POST /api/logout`, then clear state. Do not treat a failure
      as fatal: clear locally regardless
- [ ] **F27. `ProtectedRoute`** — while bootstrapping render a spinner, not a redirect;
      redirect anonymous users to `/login` preserving the intended path
- [ ] **F28. `GuestRoute`** — redirect authenticated users away from `/login` and
      `/register`
- [ ] **F29. `LoginPage` / `RegisterPage`** — Bootstrap form, inline field errors mapped
      from `422 errors`, disabled submit while in flight, generic message on `401`
      (`credentials do not match`), link swap between the two routes
- [ ] **F30. No rate limiting exists on `POST /api/login`** — debounce the submit and
      show a clear failure state; treat this as a known backend gap, not a UI bug

---

## 📌 Phase 4 — Blooming Meadow, public feed (3–4h)

Endpoint: `GET /api/blooming-meadow` — anonymous, `visibility = 'public'` only,
**page size 15**, ordered by `created_at desc` (posting order, *not* `date`),
filters: `category_id`, `emotions[]`.

- [ ] **F31. `MeadowPage`** — hero section, responsive card grid (1 / 2 / 3 columns),
      newest first
- [ ] **F32. `RecordCard`** — image with `image_alt`, title, author display name, emotion
      dots in their seeded hex colours, relative date. **Never render the author's email**
      (B6)
- [ ] **F33. Infinite scroll** driven by `links.next`, with an explicit "Load more"
      fallback button and a spinner sentinel via `IntersectionObserver`
- [ ] **F34. Empty state** — "nothing has bloomed yet", distinct from the error state
- [ ] **F35. Staggered card entrance** with Framer Motion, disabled under
      `prefers-reduced-motion`
- [ ] **F36. Anonymous CTA** — sign up / sign in prompts once a guest reaches the bottom
- [ ] **F37. Respect `emotions` may be absent** — the relation is not always eager-loaded;
      render cards without emotion chips rather than crashing
- [ ] **F38. Image fallback** — `onError` swaps in a placeholder; the seeder creates
      records with no image, so this path is hit immediately

---

## 📌 Phase 5 — Journal records (7–9h)

Endpoints: `GET /api/records` (**page size 20**, filters `search`, `emotions[]`,
`category_id`, `tier_id`, `order`, `page`), plus `GET|POST|PUT|PATCH|DELETE /api/records[/{id}]`.

### List and filtering

- [ ] **F39. `RecordsPage`** — editorial card grid; clicking a card routes to
      `/records/:id`
- [ ] **F40. Filter bar** — category, tier and emotion as multi-select chips/dropdowns,
      driven by the taxonomy resolved in **B1**
- [ ] **F41. Debounced title search** (300–400ms) on `search`; clear the input resets to
      page 1
- [ ] **F42. Sort control** — `order=asc|desc`. Only `asc` is honoured; anything else
      falls back to `desc`
- [ ] **F43. Filter state in the URL query string** so a filtered view is shareable and
      survives a refresh; every filter change resets `page` to 1
- [ ] **F44. Pagination** from `meta` (`current_page`, `last_page`, `total`, `per_page`,
      `from`, `to`) — 20 per page, not configurable
- [ ] **F45. Result count** from `meta.total`, and a "no results, loosen your filters"
      empty state

### Detail

- [ ] **F46. `RecordDetailPage`** (`/records/:id`) — full image, description, category,
      tier, emotion chips, date, visibility badge, author, edit/delete actions
- [ ] **F47. Handle `403` and `404` distinctly** — 403 is "not yours", 404 is "gone".
      Note B4: non-owner `update`/`delete` currently 500 rather than 403
- [ ] **F48. Ownership check from `relationships.user.id`** (a **string**) compared
      against the session user id (a **number**) — compare with `String(a) === String(b)`
      or `==`, never `===`

### Create / edit form

- [ ] **F49. `RecordFormPage`** shared by `/records/new` and `/records/:id/edit`
- [ ] **F50. Client-side validation mirroring `StoreRecordRequest`:**

      | Field | Rule |
      | --- | --- |
      | `title` | required, **max 200** (the column is 200; the API wrongly allows 255) |
      | `description` | nullable per the API, but the column is `NOT NULL` — **always send the key**, `""` if empty |
      | `date` | required, `YYYY-MM-DD`, no future limit unless the product wants one |
      | `visibility` | required, `public` \| `private` |
      | `category_id` | required, must exist |
      | `tier_id` | required, must exist |
      | `emotions` / `emotions[]` | optional array of existing ids, **deduplicated** |
      | `image` | optional, `jpg\|jpeg\|png\|webp`, **max 2048 KB** |
      | `image_alt` | optional, max 255 |

- [ ] **F51. `multipart/form-data` submission** — never set `Content-Type` by hand, the
      browser must add the boundary
- [ ] **F52. Image picker** with local preview, size/type validation *before* upload,
      a progress affordance for the 2 MB limit, and alt-text input
- [ ] **F53. Submit as a full representation on edit** (B3) — hydrate the form from the
      fetched record, including all `emotions[]` ids, so the update is never partial
- [ ] **F54. Optimistic-free error surfacing** — map `422 errors` onto fields; for `500`
      show a retry affordance and the B2/B5 caveat in code comments
- [ ] **F55. Delete** — confirm dialog, then `DELETE`, then navigate to `/records`;
      handle the `204` empty body and the B4 image case
- [ ] **F56. Visibility switch explained in the UI** — a public record appears in the
      Meadow, a private one does not; surface that consequence near the control

---

## 📌 Phase 6 — Prism gallery (4–5h)

Endpoint: `GET /api/prism` — **page size 20**, filters `emotions[]` and `order` only.
No `search`, no `category_id`, no `tier_id`: the Prism is emotion-only by design.

- [ ] **F57. `PrismPage`** — photographic-portfolio layout: image-forward minimal cards,
      title revealed on hover **and on keyboard focus**, plus a visible fallback since
      touch devices have no hover
- [ ] **F58. Horizontal emotion filter rail** — chips carrying each emotion's hex colour;
      selecting one isolates matching records instantly
- [ ] **F59. Derive the emotion list from `emotions[].id|name|color`** in the records
      payload — ids are present here, so this view does not depend on B1
- [ ] **F60. Multi-select semantics match the API** — `whereHas(..., whereIn)` is
      **any-of**, not all-of. Label the UI accordingly so the behaviour is not surprising
- [ ] **F61. Gallery-specific empty state** — "no blooms carry that feeling yet"
- [ ] **F62. Handle records with no image** in an image-first layout (seeder data is
      image-free by default)
- [ ] **F63. Keyboard and a11y** — focusable cards, `aria-pressed` on filter chips,
      visible focus rings, the overlay readable without hover

---

## 📌 Phase 7 — Analytics dashboard (6–7h)

Endpoint: `GET /api/dashboard/stats?time_range=all_time|last_month|last_six_months`.
Returns `{ time_range, charts: { spider, pie, area } }` already aggregated — **do not
re-aggregate in the browser** (ADR-0014).

- [ ] **F64. `time_range` selector** — All time / Last month / Last six months. An
      unrecognised value is silently treated as `all_time`, so send only the three
      literals
- [ ] **F65. Spider / radar chart** — `charts.spider` is `[{ emotion, count }]`. The
      fixed 7-emotion set makes the shape meaningful, so **render all axes with a `0`
      for emotions absent from the response** instead of plotting only the present ones
- [ ] **F66. Pie / donut chart** — `charts.pie` is `[{ category, count }]`, with a legend
      and share percentages
- [ ] **F67. Stacked area chart** — `charts.area` is `[{ month: "2026-04", tier_1: 2, … }]`.
      Three contract facts drive this task:
      - `tier_<id>` keys are **opaque ids, not names** — map them with the taxonomy from
        B1 to name the stack series
      - **empty months are omitted entirely**, which renders as a discontinuity. Fill the
        gaps client-side with `0` over the selected range
      - series keys are dynamic, so compute them as
        `Object.keys(row).filter(k => k !== 'month')` rather than hardcoding four
- [ ] **F68. `<ResponsiveContainer>`** everywhere, with a minimum height per chart and a
      `min-width: 0` parent so flex children can actually shrink
- [ ] **F69. Custom tooltips** — counts, percentages and month labels; colours resolved
      from `src/styles/tokens.js` (F15), because CSS variables do not reach SVG fills
- [ ] **F70. Empty / single-record / no-emotion states** for each chart, including a
      "last 6 months" range with a single month of data
- [ ] **F71. The endpoint is MySQL-only** (`DATE_FORMAT`) — it works in local dev and
      fails on SQLite; keep the failure visible rather than silently empty
- [ ] **F72. Dashboard layout** — responsive grid, charts collapsing to one column on
      mobile, and the contextual motivational copy from the PRD

---

## 📌 Phase 8 — About page and polish (2–3h)

- [ ] **F73. `AboutPage`** — editorial manifesto: the small-wins philosophy, the
      bloom/prism/meadow metaphor, the three axes, the CTA to the Meadow. Static,
      responsive, good typography
- [ ] **F74. `NotFoundPage`** — copy and link updated for Bloom
- [ ] **F75. Responsive pass** — 360px → 1440px, including the filter bar and the
      dashboard grid
- [ ] **F76. Accessibility pass** — landmarks, focus order, `alt` on record images,
      contrast for emotion colours in both themes, visible focus, keyboard operability
      of the gallery and modals
- [ ] **F77. `prefers-reduced-motion`** honoured across all Framer Motion animations
- [ ] **F78. SEO/meta** — per-route document titles, Open Graph image for shared records
- [ ] **F79. Remove template leftovers** — `react-props` in `package.json`, `MyApp` in the
      footer, the `/about` link that currently points at a non-existent route
- [ ] **F80. Rewrite `README.md`** in English: prerequisites, the two-process workflow,
      env vars, seeded logins, and the B1–B7 caveats

---

## 📌 Phase 9 — Testing and quality gates (4–5h)

- [ ] **F81. `vitest` + jsdom** wired into `pnpm test`, plus a `pnpm test:watch`
- [ ] **F82. Component tests** for `RecordCard`, filter bar, emotion chips, the form's
      validation rules, and both route guards
- [ ] **F83. MSW-backed integration tests** for login → dashboard, create → list refresh,
      and the error branches — these are the tests that make the B2–B5 flows verifiable
      before the backend is fixed
- [ ] **F84. Contract tests against MSW fixtures** asserting the *quirks* stay handled:
      the `attributes["category "]` trailing space, ISO-timestamp `date`, string vs number
      ids, absent `emotions`
- [ ] **F85. `pnpm lint` clean** (ESLint 10 + `eslint-plugin-react-hooks` v7 — the new
      rules will flag effect dependency problems, which is where the double-fetch bugs
      will come from)
- [ ] **F86. StrictMode discipline** — `React.StrictMode` is intentionally on, so every
      effect that fetches must clean up with an `AbortController`; otherwise every request
      fires twice in development
- [ ] **F87. `pnpm build` passes** with no warnings, and the built bundle is served to
      confirm the router works on hard refresh

---

## 📌 Phase 10 — Backend follow-ups (tracked, not SPA work)

Each is small; together they remove most of the SPA's defensive code.

- [ ] **B1.** `GET /api/categories`, `/api/tiers`, `/api/emotions` — removes the
      hardcoded taxonomy and the id→name maps
- [ ] **B2.** `$unset(...)` → `unset(...)` in `Api\RecordController@store`; also reorder
      so the file is not stored before the failure point
- [ ] **B3.** `UpdateRecordRequest` with `sometimes|required`, and an
      `UpdateRecordRequest::authorize()` returning `true` plus a `RecordPolicy`
- [ ] **B4/B5.** `$this->error(...)` in `update`/`destroy`; `hasFile('image')`; drop the
      non-existent `Storage::disk('records')` in favour of the default disk
- [ ] **B6.** A `PublicRecordResource` for the Meadow without the email field
- [ ] **B7.** `allowed_origins` from `env('FRONTEND_URL', …)`; add
      `exposed_headers => ['X-Total-Count', 'Link']`; raise `max_age` from 0
- [ ] **B8.** Add `preventLazyLoading` outside production and close the three N+1s
      (`records` misses `user`; `prism` loads on the paginator; the meadow loads nothing)
- [ ] **B9.** `RegisterRequest` → `201`; throttling on `POST /api/login`;
      `HttpResponse::$message` single-quote typo
- [ ] **B10.** Token expiry (`createToken('…', now()->addDays(30))`) so the daily
      `sanctum:prune-expired` job is not a no-op

---

## API contract cheatsheet

| Endpoint | Auth | Params | Page |
| --- | --- | --- | --- |
| `POST /register` | — | `name, email, password, password_confirmation` | — |
| `POST /login` | — | `email, password` (min 6) | — |
| `POST /logout` | token | — | — |
| `GET /user` | token | — | — |
| `GET /blooming-meadow` | — | `category_id, emotions[]` | **15** |
| `GET /records` | token | `search, emotions[], category_id, tier_id, order, page` | **20** |
| `POST /records` | token | `multipart/form-data`, see F50 | — |
| `GET /records/{id}` | token | owner only | — |
| `PUT\|PATCH /records/{id}` | token | full representation only (B3) | — |
| `DELETE /records/{id}` | token | owner only, `204` | — |
| `GET /prism` | token | `emotions[], order` | **20** |
| `GET /dashboard/stats` | token | `time_range` | — |

**Envelope** — `{ data, links, meta }`; each record is
`{ id: string, attributes: {...}, relationships: { user: { id, "user name", "user email" } } }`.

**Quirks the client must absorb**

| Quirk | Handling |
| --- | --- |
| `attributes["category "]` has a **trailing space** | bracket access, never `.category` |
| `category` / `tier` are **names, no ids** | keep an id→name map (resolved by B1) |
| `date` is a full ISO timestamp, column is `date` | slice to `YYYY-MM-DD`; the timezone is undeclared |
| Record `id` is a **string**, `emotions[].id` is a **number** | compare with `String()` |
| `visibility` is a plain `"public"` / `"private"` | the valid set is not discoverable from the response |
| `emotions` only present when eager-loaded | always optional-chained |
| `area` uses opaque `tier_<id>` keys, empty months omitted | map ids to names, fill gaps with 0 |
| `order` honours only `asc` | send `asc` or `desc` literally |
| Create/update return `200`, not `201` | do not branch on the status code |
| `status` is `"Request was successfull"`, `message` is `"$message"` | never branch on the body |
| Images live at `/storage/records/…` on `:8000` | build absolute URLs from the API origin |

---

## Acceptance criteria

- [ ] An anonymous visitor can browse the meadow, filter it, and never see an email
- [ ] A user can register, log in, be restored across a hard refresh, and log out
- [ ] `/records`, `/prism`, `/dashboard` are unreachable without a token
- [ ] A user can list, search, filter, sort and paginate their own records
- [ ] A user can open, edit and delete a record — verified against MSW until B2–B5 land
- [ ] The dashboard renders all three charts across all three time ranges, with no
      discontinuities and correctly labelled tier series
- [ ] Full keyboard operability and a clean `prefers-reduced-motion` experience
- [ ] `pnpm lint` and `pnpm build` are clean; the test suite passes
- [ ] No console errors on any route, logged in or out

---

## Estimates

| Phase | Hours | Status |
| --- | --- | --- |
| 1 — Backend | 14–18 | done |
| 2 — Frontend foundation | 7–9 | todo |
| 3 — Auth and guards | 3–4 | todo |
| 4 — Meadow | 3–4 | todo |
| 5 — Records | 7–9 | todo |
| 6 — Prism | 4–5 | todo |
| 7 — Dashboard | 6–7 | todo |
| 8 — About and polish | 2–3 | todo |
| 9 — Tests and quality | 4–5 | todo |
| **Total frontend** | **36–46** | |
