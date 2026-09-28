# Bloom — Frontend

> **Status: work in progress.** This README describes the intended shape of the app. The
> code is still being built, so some sections describe plans rather than what currently
> runs. It will be updated as the implementation lands.

Bloom is a journaling and milestone tracking platform. This repository is the **React
single page application** that consumes the Laravel API; the backend lives in a separate
repository.

The premise of the product is simple: accomplishments are not rare, they are small,
scattered, and rarely written down. Bloom makes them visible, and makes the *texture* of a
life — not just its peaks — something you can actually see.

---

## What this SPA is

A decoupled frontend that turns the Bloom API into two distinct experiences:

- **A public surface** — the *Blooming Meadow*, a feed of milestones people have
  chosen to share. Explorable without an account.
- **A private suite** — for writing, organising, visually exploring and quantitatively
  analysing your own milestones.

The domain metaphor drives the naming: a record is a **bloom**, its emotions are the
**prism** it refracts through, and the public feed is the **meadow**.

Each record is classified along three independent axes, plus a visibility flag:

| Axis | Meaning | Examples |
| --- | --- | --- |
| **Category** | area of life | Career, Studies, Sports, Cooking, Travel, … |
| **Tier** | magnitude of the achievement | small win → solid step → major milestone → epic breakthrough |
| **Emotions** | how it felt | Proud, Relieved, Excited, Determined, Grateful, … |
| **Visibility** | public or private | the hinge between the Meadow and your journal |

### Stack

| | |
| --- | --- |
| Framework | React 19 · Vite 8 |
| Routing | React Router 7 |
| Styling | Bootstrap 5.3 + CSS custom properties, light/dark themes |
| Charts | Recharts |
| Motion | Framer Motion |
| Backend | Laravel 13 REST API · Sanctum bearer token auth |
| Language | JavaScript · pnpm |

The SPA is presentation only. Validation, aggregation and authorisation belong to the
API — the browser never re-derives what the server already computed.

---

## Getting started

### Requirements

Node 20+ and pnpm 9+. The Laravel API is a separate project; to see real data you also
need it running (see its own README).

### Setup

```sh
pnpm install
cp .env.example .env      # when available — see "Configuration" below
```

### Run the dev server

```sh
pnpm dev        # http://localhost:5173
```

### Other scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | start the Vite dev server |
| `pnpm build` | production build into `dist/` |
| `pnpm preview` | serve the production build locally |
| `pnpm lint` | run ESLint |

### Configuration

Environment variables are read through Vite's `VITE_` prefix and must never be hardcoded
in the source. The base URL of the API is the only one required for now:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

### Working against the API

Run the two processes side by side:

```sh
# in the Laravel repository
php artisan serve            # http://localhost:8000

# here
pnpm dev                    # http://localhost:5173
```

The API ships seeded accounts (an `admin` and a `user`), plus 12 categories, 4 tiers and
7 emotions. See `docs/notes/laravel-bloom-readme.md` for credentials and the exact setup.

---

## Views

The routing is split into a public shell and a private dashboard shell, so a visitor
browsing the Meadow never downloads the complexity of the dashboard.

| Path | View | Access |
| --- | --- | --- |
| `/` | redirects to `/meadow` | public |
| `/meadow` | **Blooming Meadow** — grid of shared milestones, newest first, filterable and paginated | public |
| `/about` | **Platform manifesto** — the small-wins philosophy and the bloom/prism/meadow metaphor | public |
| `/login` | **Sign in** | guests only |
| `/register` | **Create an account** | guests only |
| `/records` | **Journal** — card grid of your milestones, with search, filters and sorting | protected |
| `/records/new` | **New record** form | protected |
| `/records/:id` | **Record detail** | owner only |
| `/records/:id/edit` | **Edit record** | owner only |
| `/prism` | **Prism** — image-forward gallery filtered by emotion | protected |
| `/dashboard` | **Analytics** — charts of your own milestone patterns | protected |
| `*` | **404** | public |

### The four main views

**Blooming Meadow** (`/meadow`) — the community surface. A responsive grid of cards,
ordered newest to oldest, loading progressively as the user scrolls. Anonymous visitors
can filter by category and emotion.

**Journal** (`/records`) — the working view. Full CRUD over your own records, plus a
filtering engine combining category, tier and emotion, a debounced real-time title
search, chronological sorting and pagination. Filter state lives in the URL, so a filtered
view is shareable and survives a refresh. The create/edit form mirrors the server's
validation rules exactly.

**Prism** (`/prism`) — a reflective gallery rather than a scanning tool. Image-forward
minimal cards, titles revealed on hover *or* keyboard focus, filtered through a horizontal
rail of emotions. Deliberately emotion-only: no search, no category, no tier.

**Analytics dashboard** (`/dashboard`) — quantitative self-reporting over a selectable
time range: a radar chart of the emotions you felt, a donut chart of the balance between
life areas, and a stacked area chart of entry velocity per month by tier. The data
arrives pre-aggregated from the API and is rendered as-is.

---

## Project structure

```txt
src/
├── api/            # client layer: fetch wrapper, token store, one module per endpoint
├── components/     # reusable components, ui/ for primitives
├── contexts/       # React contexts (theme, auth)
├── hooks/          # custom hooks (useTheme, useAuth, …)
├── layouts/        # MainLayout (public) and DashboardLayout (private)
├── pages/          # one page = one file
├── styles/         # global styles, theme tokens, exported palette constants
└── utils/          # pure helpers
```

## Design principles

1. **Small wins, not achievements.** The tier scale starts at *small win* deliberately.
2. **Emotion is a first-class dimension,** not metadata.
3. **Private by default.** Sharing must be an explicit act.
4. **The public surface stays cheap.**
5. **The server owns the data.** The SPA presents; it does not re-derive.
6. **Never trade correctness for polish.**

---

## Further documentation

| Document | Contents |
| --- | --- |
| [`docs/notes/PRD.md`](./docs/notes/PRD.md) | what the product is and why, plus the full functional spec |
| [`docs/notes/project-planning.md`](./docs/notes/project-planning.md) | how it gets built: phases, tasks, API contract |
| [`docs/notes/laravel-bloom-readme.md`](./docs/notes/laravel-bloom-readme.md) | the backend: data model, endpoints, setup |
