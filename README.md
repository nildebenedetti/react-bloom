# Bloom — Frontend

Bloom is a journaling and milestone-tracking platform. This repository is the **React
single-page application**; the backend is a separate Laravel REST API.

The premise is simple: accomplishments are not rare. They are small, scattered, and rarely
written down. Bloom makes them visible, and makes the *texture* of a life — not only its
peaks — something you can actually see, and return to.

The product has two faces:

- **The Blooming Meadow** — a public, anonymous feed of the milestones people chose to
  share. Explorable without an account.
- **The private suite** — write, organise, revisit and measure your own milestones: a
  journal, an image-forward *Prism*, and an analytics dashboard.

The domain metaphor drives the naming: a record is a **bloom**, its emotions are the
**prism** it refracts through, and the shared feed is the **meadow**.

Each record is classified along three independent axes, plus a visibility flag:

| Axis | Meaning | Examples |
| --- | --- | --- |
| **Category** | area of life | Career, Studies, Sports, Cooking, Travel, … |
| **Tier** | magnitude of the achievement | small win → solid step → major milestone → epic breakthrough |
| **Emotions** | how it felt | Proud, Relieved, Excited, Determined, Grateful, … |
| **Visibility** | public or private | the hinge between the Meadow and your journal |

Visibility is decided per record: a **public** record is what readers of the Meadow see, a
**private** one stays in its author's journal.

## Stack

| | |
| --- | --- |
| Framework | React 19 · Vite 8 |
| Routing | React Router 7 |
| Styling | Bootstrap 5.3 + CSS custom properties · CSS Modules · light/dark themes |
| Charts | Recharts |
| Icons | react-bootstrap-icons |
| Backend | Laravel REST API · Sanctum bearer-token auth |
| Language | JavaScript · pnpm |

The SPA is **presentation only**. Validation, aggregation and authorisation belong to the
API — the browser never re-derives what the server already computed.

---

## Architecture

### At a glance

```txt
index.html ── inline script: sets data-bs-theme BEFORE the first paint
   │
main.jsx ──── imports Bootstrap CSS + JS, then ./styles/index.css, mounts <App/>
   │
App.jsx
 └─ ThemeProvider            light / dark, persisted
     └─ BrowserRouter
         └─ AuthProvider    token + user + session bootstrap
             ├─ ScrollToTop     resets scroll on every navigation
             └─ Routes
                 └─ MainLayout          Header · <main> · Footer · ScrollToTopBtn
                     ├─ public routes
                     └─ ProtectedRoute  → private routes
```

Two React contexts carry the only truly global state. Routing is one shell with a nested
guard. Everything else — data fetching, filters, pagination — lives inside the page that
owns it.

### Bootstrapping

- **`index.html`** runs a tiny inline script *before* the stylesheet and before React: it
  reads the stored theme and puts `data-bs-theme` on `<html>`. Without it the browser would
  paint one frame of the wrong palette on every reload. The storage key is shared with
  `ThemeContext` on purpose.
- **`src/main.jsx`** is the entry point and does exactly three things: import the Bootstrap
  CSS, import the Bootstrap JS bundle (navbar collapse, dropdown, modals), import the
  project's single global stylesheet, then mount `<App/>`.

### Global state: the two contexts

| Context | Owns | Notes |
| --- | --- | --- |
| `contexts/ThemeContext.jsx` | the active theme | `light` / `dark`, persisted in `localStorage`; falls back to the OS preference on a first visit |
| `contexts/AuthContext.jsx` | `token`, `user`, `isLoading` | the session: bootstrap, `login`, `register`, `logout` |

- **Theme** is applied with `useLayoutEffect`, which runs after React updates the DOM but
  *before* the browser paints — so the correct palette is already in place at paint time.
- **Auth** validates the stored token once on mount (`GET /user`) and exposes an
  `isLoading` state so the UI can distinguish "still checking" from "signed out". It listens
  for an `auth:unauthorized` window event that the API layer dispatches when a token dies,
  so a session that expires mid-use is cleaned up in one place.

Both are read through a hook: `useTheme()` (in `hooks/useTheme.js`, and it throws if there is
no provider above the component) and `useAuthContext()`.

### Routing and access control

A single route tree, all inside **one** layout:

| Path | View | Access |
| --- | --- | --- |
| `/` | **Home** — hero + the Blooming Meadow feed | public |
| `/about` | **The idea behind Bloom** — the manifesto | public |
| `/login` | Sign in | public |
| `/register` | Create an account | public |
| `/dashboard` | **Analytics** — charts of your own milestone patterns | protected |
| `/my-records` | **Journal** — your records, filters, search, sorting | protected |
| `/my-records/add-new` | New record form | protected |
| `/my-records/:id` | Record detail | protected |
| `/my-records/:id/edit` | Edit record | protected |
| `/emotion-prism` | **Prism** — image-forward gallery | protected |
| `*` | 404 | public |

`MainLayout` is the shell every page is rendered into (via `<Outlet/>`): the fixed glass
header, a flex-growing `<main>`, the footer and the scroll-to-top button.

**`ProtectedRoute`** is a *layout route*, not a wrapper per page — it renders `<Outlet/>`
when a token exists and otherwise redirects to `/login`. Adding a private page means nesting
it under the guard, and nothing else. While the session is still being checked it renders a
"checking current session…" placeholder, so a protected page never flashes for a visitor who
is actually signed in.

### Views

**Home** (`/`) — the public surface. A hero banner greets the visitor, followed by *The
Blooming Meadow*: a responsive card grid of public records, newest first as ordered by the
API, loaded one page at a time behind a **Show More** button. Opening a card shows the
record in a modal, so browsing the feed never leaves the page. A call-to-action at the
bottom invites guests to register, or members to open their dashboard.

**Journal** (`/my-records`) — the working view: full CRUD over your own records. Filters are
chips for **category** and **tier** (multi-select, with an "All" reset), a submitted title
**search**, and a **date sort** toggle. Selecting a filter, searching or sorting resets
pagination to page 1 and refetches; results are appended page by page via Show More. The
create/edit form mirrors the server's validation rules and surfaces per-field errors
returned by the API.

**Prism** (`/emotion-prism`) — a reflective gallery rather than a scanning tool.
Image-forward cards with the title and date laid over the picture, filtered by a chip rail
of **emotions** and re-ordered newest-first or oldest-first. Deliberately emotion-only: no
search, no category, no tier.

**Record detail** (`/my-records/:id`) — the full record, rendered by the same component the
feed's modal uses, plus Edit and a Delete that asks for confirmation in a styled modal
rather than a native `confirm()`.

**Analytics** (`/dashboard`) — quantitative self-reporting over a selectable time range
(*All time* / *Last 6 months*), fed by one pre-aggregated API response: a radar of the
emotions you felt, a donut of the balance between life areas, and a stacked area chart of
entry velocity per month by tier. The data arrives aggregated and is rendered as-is.

**About** (`/about`) — the manifesto: the *small wins* philosophy and the *pause · validate ·
rest* pillars, in a static editorial layout that needs no data at all.

### Talking to the API

The whole client layer is one module, [`src/utils/api.js`](./src/utils/api.js). It owns:

- **`fetchData(endpoint, options)`** — the single `fetch` wrapper. It resolves the base URL
  from `VITE_API_URL`, attaches the bearer token, serialises an `options.params` object into
  a query string (arrays become Laravel's `key[]`), sets JSON headers when a body is
  present, and unwraps the API's `{ status, message, data }` envelope so callers work with
  the payload directly.
- **`ENDPOINTS`** — the one map of public and private routes. Pages never hardcode a path.
- **`mediaUrl(path)`** — builds the absolute URL of a stored image. Images are not served
  under `/api`: they live on the public disk, so the URL is derived from the API's *origin*
  plus `/storage`. It returns `null` when there is nothing to show, which is the caller's
  cue to fall back to a placeholder.
- **token storage** — `getStoredToken` / `setStoredToken` / `clearStoredToken`. Reads and
  writes go through one door so a malformed value in storage is treated as *no* token rather
  than shipped to the server.

Errors are normalised: a failed response throws an `Error` carrying `status` and the raw
body, so a page can show the message and, for forms, the per-field `errors` the API returns.
A `401` on an authenticated request clears the token and fires `auth:unauthorized`. Requests
that must not participate in session bookkeeping — `login`, `register` — opt out with
`anonymous: true`, so a mistyped password is a failed attempt, not an expired session.

### The data-loading pattern

Every page follows the same shape, which keeps new pages predictable:

1. the page owns its data with `useState` (`records`, `isLoading`, `errorMsg`, `page`,
   `hasMore`);
2. a `useEffect` fetches through `fetchData` whenever the inputs change — page number,
   filters, search term, sort order;
3. the effect guards against races with a `cancelled` flag, so a response that arrives after
   a newer request started (or after unmount) is dropped instead of overwriting fresh state;
4. **page 1 replaces** the list, any later page **appends** — which is what makes Show More
   work with no extra state machine.

There is no global data store: state is as local as it can be, and shared only through the
two contexts. Components that *present* data (`MeadowCard`, `RecordDetailBody`, the charts)
receive it as props and stay pure.

### Directory layout

```txt
src/
├── App.jsx                 # provider tree + route table
├── main.jsx                # bootstrap: Bootstrap, global stylesheet, mount
│
├── contexts/               # global state: ThemeContext, AuthContext
├── hooks/                  # useTheme, useScrollToTop
├── routes/                 # ProtectedRoute — the layout-route guard
├── layouts/                # MainLayout — the header/main/footer shell
│
├── pages/                  # one route = one file (+ its .module.css)
│
├── components/
│   ├── Header.jsx          # navbar: brand, nav, auth menu, theme toggle
│   ├── Footer.jsx
│   ├── PersonalNav.jsx     # links between the private pages
│   ├── ScrollToTop.jsx     # scroll reset on navigation
│   ├── ScrollToTopBtn.jsx  # floating "back to top" orb
│   ├── cards/              # MeadowCard, PrismCard
│   ├── charts/             # CategoryPieChart, EmotionsRadarChart, VelocityImpactAreaChart
│   ├── records/            # RecordModal (host), RecordDetailBody (presentation)
│   └── utils/              # domain data maps + helpers: categories, tier, emotions, date, images
│
├── utils/
│   └── api.js              # the entire client layer
│
└── styles/
    ├── index.css           # the only stylesheet imported — declares cascade order
    ├── base.css            # element defaults
    ├── components.css      # app primitives + utilities
    └── theme/tokens.css    # every design token, light + dark
```

`components/utils/` holds the **domain vocabulary the UI renders from** — the 12 categories
with their palettes, the 4 tiers with their icons, the 7 emotions, date formatting, the
record-image placeholders, and the month-range helper the velocity chart fills gaps with.
It is data and pure helpers, not components; keeping it in one place means a card, a form
and a chart all read the same definition.

### Styling and theming

The styling is the app's most deliberate layer, and it is built so that **a component is
written once** and works in both themes.

- **[`styles/index.css`](./src/styles/index.css)** is the only stylesheet the app imports.
  Its one job is the cascade order: `theme/tokens.css` → `base.css` → `components.css`, with
  the reduced-motion block last so it can override hover rules. Vite inlines the imports at
  build time, so the shipped CSS is one file.
- **`theme/tokens.css`** declares *only* custom properties — no selectors, no component
  rules. It has three parts: theme-independent global tokens (radii, durations, header
  height), the **light** palette, and the **dark** palette, kept side by side so a token
  missing from one is visible at a glance. Two families live here: the **bridge** tokens
  that remap Bootstrap's own `--bs-*` variables, and the **semantic** `--bloom-*` tokens
  that describe what the product looks like.
- **`base.css`** sets element defaults: the page canvas, the offset that keeps `<body>`
  clear of the fixed navbar, the global focus fallback, and the colour cross-fade used when
  the theme switches.
- **`components.css`** holds the app's own primitives — `.btn-action` and its variants, the
  glass surfaces (`.glass-bar`, `.glass-card`), `.surface-card`, the auth panel, the chart
  and legend rules — plus a small set of utilities. Every value here is a token: no raw hex,
  and no `if (dark)` anywhere.

The theme is switched by a single attribute, `data-bs-theme="light|dark"` on `<html>`. A
component never asks which theme is active; it references a semantic token, and the token
block decides what that means in each theme.

**Per-component styles** live next to the component that owns them, as
`*.module.css` (`MeadowCard.module.css`, `RecordModal.module.css`, …). CSS Modules scope the
class names, so component-internal selectors never leak into the global sheet.

**Charts are the one deliberate exception.** Recharts draws SVG, and an SVG `fill` cannot
read a CSS custom property — so the chart palettes are exported as JavaScript
(`components/utils/categories.js`, `tier.js`, `emotions.js`) and picked from the *live* theme
through `useTheme()`, which keeps every chart in step with the palette currently on screen.

---

## Getting started

### Requirements

Node 20+ and pnpm 9+. The Laravel API is a separate project; to see real data you also need
it running (see its own README).

### Setup

```sh
pnpm install
cp .env.example .env
```

The only variable the SPA needs is the API base URL:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

That one variable also locates uploaded images, which are **not** served under `/api` but
from the site root under `/storage` — always build media URLs with `mediaUrl()` rather than
by hand. See [`docs/notes/api-media-urls.md`](./docs/notes/api-media-urls.md).

### Run the dev server

```sh
pnpm dev        # http://localhost:5173
```

### Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | start the Vite dev server |
| `pnpm build` | production build into `dist/` |
| `pnpm preview` | serve the production build locally |
| `pnpm lint` | run ESLint |

### Working against the API

Run the two processes side by side:

```sh
# in the Laravel repository
php artisan serve            # http://localhost:8000

# here
pnpm dev                     # http://localhost:5173
```

The API ships seeded accounts (an `admin` and a `user`), plus 12 categories, 4 tiers and
7 emotions. See [`docs/notes/laravel-bloom-readme.md`](./docs/notes/laravel-bloom-readme.md)
for credentials and the exact setup.

