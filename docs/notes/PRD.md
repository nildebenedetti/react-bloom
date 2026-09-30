# Product Requirement Document (PRD) & Technical Specification

Bloom — journaling and milestone tracking.

| | |
| --- | --- |
| Product | Full-stack milestone tracking platform |
| Backend | Laravel 13 REST API — **complete** (`../Laravel/laravel-bloom`) |
| Frontend | React 19 SPA (this repository) |
| Auth | Sanctum personal access tokens (bearer) |
| Status | Backend shipped · frontend not started |

> **Task tracking lives in [`project-planning.md`](./project-planning.md).** This document
> states *what* the product is and *why*. The plan states *how* it gets built.

---

## 1. Executive Summary

Bloom is a full-stack web platform for tracking and visualising personal milestones
(*journaling & milestone tracking*). It pairs a decoupled architecture — a Laravel RESTful
backend and a React Single Page Application — to deliver two distinct experiences:

- a **public, exploratory surface** (the *Blooming Meadow*), an anonymous feed of
  milestones people have chosen to share; and
- an **advanced private suite** for managing, visually exploring, and quantitatively
  analysing one's own achievements.

The product's organising idea is that accomplishments are not rare. They are small,
scattered, and rarely written down. Bloom's job is to make them visible, and to make the
*texture* of a life — not just its peaks — something you can actually see.

---

## 2. Backend & Data Architecture (Laravel)

### 2.1 Relational model

The data architecture supports multidimensional classification of every milestone. A record
is classified along **three independent axes** — what area of life, how big, and how it
felt — plus a visibility flag that splits the product into its two surfaces.

- **`Record`** — the core aggregate, one journal entry or milestone.
  - **Attributes:** `id`, `title`, `description`, `image_path`, `image_alt`, `date`,
    `visibility`, `category_id`, `tier_id`, `user_id`, `timestamps`.
- **`Category`** *(1:N with Record)* — the area of life the milestone belongs to.
  - Seeded with 12: Career, Studies, Bonds, Sports, Cooking, Crafting, Wellness, Travel,
    Finance, Languages, Culture, Promises.
- **`Tier`** *(1:N with Record)* — the magnitude of the achievement, ordered by
  significance. Seeded with 4: small win → solid step → major milestone → epic
  breakthrough.
- **`Emotion`** *(N:N with Record via the `emotion_record` pivot)* — the emotional
  spectrum attached to the milestone. A record carries several at once.
  - Seeded with 7, each with a generated hex colour: Proud, Relieved, Excited,
    Determined, Grateful, Grounded, Cherished.

Keeping all three taxonomies normalised means a record references a category and a tier by
foreign key and carries many emotions through an explicit pivot, rather than storing
free-text labels that could not be aggregated.

### 2.2 Visibility as the pivot between the two surfaces

Every record carries `public` or `private`. This single flag is the hinge of the whole
product: `public` records are the Meadow, `private` records belong only to their author.
It is modelled as a first-class enum (`RecordVisibility`), not a loose string.

### 2.3 API surface

The API is the only contract between the two halves. Twelve endpoints under `/api`:

| Group | Endpoints |
| --- | --- |
| Auth | `POST /register`, `POST /login`, `POST /logout`, `GET /user` |
| Public | `GET /blooming-meadow` |
| Records | `GET|POST /records`, `GET|PUT|PATCH|DELETE /records/{id}` |
| Exploration | `GET /prism` |
| Analytics | `GET /dashboard/stats` |

Two deliberate constraints, both load-bearing for the frontend:

- **No taxonomy endpoints.** There is no `GET /api/categories`, `/api/tiers` or
  `/api/emotions`. Category and tier arrive as **names only** — never ids — while the
  create form and every filter need ids. The frontend must therefore either hold its own
  id→name map from the seeded taxonomy or the API must grow read-only taxonomy endpoints.
  Tracked as blocker **B1** in the plan.
- **Analytics arrive pre-aggregated.** `GET /dashboard/stats` returns three datasets
  already shaped for plotting. The browser must never re-aggregate the client's own
  records — that would move private data client-side for no reason and would not scale.

---

## 3. Frontend Architecture & UI/UX System (React)

### 3.1 Design system

- **Palette & state management:** a dual-theme system driven by `ThemeContext`, built on
  cool and blue-dominant tones to favour focus and cognitive engagement:
  - **Dark / metal palette:** cobalt `#1E293B` and silver `#E2E8F0`.
  - **Light / clean palette:** ice white `#F8FAFC` and soft sky blue `#93C5FD`.
  - The choice persists across sessions, so returning users keep their theme.
- **Implementation:** Bootstrap 5.3.8 (already installed) with CSS custom properties for
  theming. No CSS framework is added. The palette is additionally exported as JS
  constants, because CSS variables cannot reach the SVG fills drawn by Recharts.
- **Motion & animation layer:** **Framer Motion** drives state transitions, view changes,
  filter micro-interactions, and staggered fade-ins on card grids. All motion is disabled
  under `prefers-reduced-motion`.

### 3.2 Two surfaces, two shells

The product's split is reflected in the layout system. Public pages use a light
`MainLayout`; the private suite uses a dashboard shell with a navigation hub. This keeps
the Meadow cheap for a passing visitor — they never download the private chrome.

---

## 4. Functional Specifications & View Architecture

### 4.1 Public area (guest view)

**The Blooming Meadow** — a global feed, explorable without an account.

- **Layout:** a dynamic grid, ordered newest to oldest by *posting* order.
- **Purpose:** the community component. Its job is to show an anonymous visitor that
  other people are also recording small wins, which is the entire argument for the
  product.
- **Privacy requirement:** the endpoint currently returns each author's email address to
  anonymous callers. The UI **must not render it**. Tracked as **B6**.
- **Browse affordance:** the feed is long and image-heavy, so it loads progressively rather
  than all at once.

### 4.2 Auth layer & routing guards

- **Login / registration screens:** dedicated forms for credential management.
- **ProtectedRoute & GuestRoute:** routing-level wrappers that restrict the registered
  sections and drive session redirects. A guest who deep-links into a private route is
  returned to login and afterwards delivered to the page they originally wanted.
- **Session restoration:** on a hard refresh the app revalidates a stored token against
  the API rather than assuming the session is valid or invalid.

### 4.3 Authenticated workspace ("My Milestones")

The private area is introduced by a **dynamic header and navigation hub** carrying
contextual motivational copy and quick-navigation modules to the four main views.

#### 1. Standard Journal View (`/records`)

- **Display:** a grid of cards in a classic editorial layout.
- **Interaction:** selecting a card routes to the detail page (`/records/:id`).
- **Filtering & data-manipulation engine:**
  - **Combined filters (dropdown / chips):** by *category*, *tier* and *emotion*. Filters
    combine, and the active set is reflected in the URL so a filtered view is shareable.
  - **Search engine:** real-time input with debounce, matching on the record title.
  - **Sorting:** ascending or descending chronological order on `date`.
- **Full CRUD:** a record can be created, opened, edited and deleted, with an optional
  image and alt text. The form's validation mirrors the server's rules exactly, so the
  user is never told a request failed for a reason they could have been warned about
  first.

#### 2. Prism (Gallery View) (`/prism`)

> *"Explore your milestones through the spectrum of emotions."*

- **UX paradigm:** a visual and emotional approach inspired by photographic portfolios,
  designed for reflective exploration rather than scanning.
- **Display:** minimal cards with a high-resolution image foregrounded, and the title
  revealed as an overlay on hover **or keyboard focus** — never hover alone, or the
  content is unreachable without a mouse.
- **Filtering engine:** horizontal navigation based **exclusively on emotions**. Selecting
  an emotion (*Proud*) instantly isolates every milestone carrying that feeling.
- **Note:** this view is emotion-only by design. The API accepts no search, category or
  tier filter here, and the UI must not imply otherwise.

#### 3. Analytics & Performance Dashboard (`/dashboard`)

- **Purpose:** quantitative analysis of the user's own milestones and visual reporting on
  personal performance (*business-metric UX*).
- **Data visualisation (Recharts):**
  - **Spider / radar chart:** distribution of the emotions experienced. The emotion set is
    fixed, so the shape of the radar is meaningful in a way a bar chart would not be.
  - **Pie / donut chart:** share of milestones by professional / personal category.
  - **Area / trend chart:** entry velocity with monthly peak tracking (*velocity peak
    analysis*), stacked by tier.
- **Responsive layout:** adaptive containers via `<ResponsiveContainer />`, with
  interactive charts and custom tooltips.

#### 4. About Us / Platform Manifesto (`/about`)

- A structured editorial layout presenting the mission, the philosophy of tracking *small
  wins*, and the platform's core values.

---

## 5. Design principles

1. **Small wins, not achievements.** The product's premise is that most of a life is made
   of unremarkable, uncounted moments. The tier scale starts at *small win* deliberately:
   the lowest rung is the point, not an afterthought.
2. **Emotion is a first-class dimension, not metadata.** Two milestones of equal size can
   feel completely different. The Prism exists to make that difference explorable.
3. **Private by default.** A record is `private` unless its author chooses otherwise.
   Sharing must be an explicit act.
4. **Public surface stays cheap.** A visitor browsing the Meadow should not pay for the
   dashboard's complexity.
5. **The server owns the data.** Aggregation, validation and authorisation belong to the
   API. The SPA presents; it does not re-derive.
6. **Never trade correctness for polish.** A leaked email, an unreadable chart axis, or a
   form that fails for a reason the user was never shown is a defect, not a rough edge.
