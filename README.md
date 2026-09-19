# RE:VEAL

**Beauty Connects the World.**
美容を通して、まだ見ぬ可能性を、共に見つける。

RE:VEAL is a global beauty ecosystem — not a beauty version of Instagram. The
product is built around one loop:

```
DISCOVER → MATCH → CONNECT → CREATE → PORTFOLIO → OPPORTUNITY
```

When someone opens RE:VEAL, the question it answers is *who can I meet, what
can we build, which project can I join* — not *what can I look at*. The core
experience is **GLOBAL MAP × MATCH × PROJECT**.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also runs the TypeScript check)
npm start
npm run typecheck  # tsc --noEmit
```

Node 20+ required. No environment variables, no external services: the whole
prototype runs on in-repo mock data.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, React 19 |
| Language | TypeScript, `strict` |
| Styling | Tailwind CSS v4 (CSS-first tokens in `src/app/globals.css`) |
| Components | shadcn/ui-style primitives built on Radix |
| Icons | Lucide |
| Map | In-house SVG engine behind a swappable contract |
| Data | Mock `DataSource`, shaped for Supabase / PostgreSQL |

---

## Architecture

Everything is organised around four seams, each of which exists so a real
backend, a real model or a real map provider can be dropped in later without
touching the pages that use them.

### 1. Data — `src/lib/data-source/`

```ts
export const db: DataSource = new MockDataSource();
```

`DataSource` (`types.ts`) is the only way the UI reads data. Every method is
`async` even though the mock is synchronous, so a `SupabaseDataSource` is a
change to `index.ts` alone. **No component imports mock data directly.**

The domain model lives in `src/lib/types.ts` and covers `User`, `Profile`,
`Skill`, `Interest`, `Country`, `City`, `Brand`, `Project`, `ProjectMember`,
`Event`, `Post`, `PortfolioItem`, `Match`, `Connection`, `Message`,
`Notification`, `Application`, `Opportunity`, `Course` and the taxonomies
behind them. Entities hold foreign keys as ids rather than nested objects, and
anything denormalised for the UI lives in a separate `*View` type — so the
model maps onto relational tables without rework.

Mock data sits in `src/lib/data/` (40 people, 17 brands, 16 projects, 18
events, 34 cities, courses, portfolio pieces, threads and notifications), each
file authored as a compact seed shape and expanded through a builder, so
derived numbers stay deterministic between renders.

### 2. Matching — `src/lib/match/`

`engine.ts` scores people, brands, projects, events and cities against the
viewer's profile. It is deliberately a set of explicit additive rules rather
than one opaque similarity number, because **RE:VEAL always has to answer "why
did this match?" on screen.** Every rule that fires contributes both points and
a typed `MatchReason` the UI renders.

Signals: skills (shared *and* complementary), beauty category, city and target
cities, shared languages, interests, experience level, availability, stated
goals, and whether both sides are open to the same kind of collaboration.

Rules score proportionally to what the *target* asks for, not to the viewer's
own breadth — otherwise a narrow target scores full marks against everybody and
the top of the scale collapses. In the current dataset that puts the strongest
matches at 92–96 with medians in the 60s–80s and nothing pinned at the ceiling.

`interpret.ts` turns natural language into an `Intent` (cities, countries,
categories, roles, entity kinds) in Japanese, English, Korean and Chinese. It
is a keyword matcher today, behind an `Interpreter` interface an LLM call
implements.

`/api/match` composes the two. Its request and response shapes are already the
ones a model-backed implementation needs, so connecting an LLM is a change
inside that one route.

### 3. Map — `src/components/map/`

`<WorldMap>` is the only thing pages import. It picks an engine; `SvgWorldMap`
is the current one, and a Mapbox or Google Maps engine only has to satisfy
`MapEngineProps`.

The geometry is pre-computed at build time (`npm run generate:map`) from
Natural Earth data into `src/lib/geo/world-shapes.ts`, so the runtime has no
geo dependency and no tile requests. The projection is plain equirectangular in
two lines of arithmetic (`src/lib/geo/projection.ts`), shared by the generator
and by marker placement — which means marker positions and country outlines can
never drift apart.

Interaction: pointer pan, wheel zoom, two-finger pinch, region framing, and
finger-sized hit targets on every marker. Marker weight follows the active
filters, so the map is the query result rather than an illustration.

### 4. Translation & i18n — `src/lib/i18n/`

Two separate concerns, deliberately:

- **UI chrome** — a static `ja / en / ko / zh` dictionary behind `useI18n()`.
- **User content** — a `Translator` interface. `PassthroughTranslator` marks
  text as translated without altering it, which is honest about what is
  happening while keeping the whole interaction (notice, "show original"
  toggle, attribution) built and testable. Connecting a translation API means
  editing `translator.ts` only.

---

## Routes

| Route | What it is |
| --- | --- |
| `/` | Personalised dashboard: hero, live map, Your Match tabs, recommended cities, activity |
| `/discover` | Finite editorial categories plus rails back to people, brands and projects |
| `/map` | Global Map — audience, category and region filters, city panel, match reasoning |
| `/match` | Beauty Collaboration Matching, with AI Match |
| `/people`, `/people/[id]` | Directory and Global Beauty Portfolio profile |
| `/brands`, `/brands/[id]` | Directory and brand page with Creators Wanted |
| `/projects`, `/projects/[id]` | Directory and project page with role slots, timeline, applications |
| `/events`, `/events/[id]` | Directory with map, and event page |
| `/learn`, `/learn/[id]` | Course catalogue and course page |
| `/portfolio` | Your record of work in the industry |
| `/messages` | Direct, group, project and brand threads |
| `/notifications`, `/settings`, `/profile` | Personal surfaces |
| `/api/search`, `/api/match` | The two server boundaries the client talks to |

---

## Design system

Bright, clean, premium — never a single-pink beauty site, never dark, never
cyberpunk. Tokens live in `src/app/globals.css`:

- **Ink** — deep navy, carries all type and line work
- **Surfaces** — white, canvas, pearl
- **Accents** — lavender, pale blue, blush, mint, gold
- Cards are white *plus* a whisper of gradient (`card-sheen`), never flat
- `glass` / `glass-strong` for the translucent chrome
- Soft, lavender-tinted elevation; generous radii; no neon

RE:VEAL ships **no stock photography**. Every avatar, cover and thumbnail is a
deterministic gradient derived from the entity's seed (`src/lib/visual.ts`), so
the product reads as one designed system — and a real image can replace any of
them later with zero layout shift.

**Responsive:** desktop-first, tuned for 1440px and 1920px. The sidebar
collapses into a top-bar drawer plus a five-item bottom navigation below
`lg`. Verified free of horizontal overflow at 390 / 834 / 1440 / 1920.

---

## What is real and what is mocked

**Real, working behaviour:** routing and deep links, global search (⌘K) over
eight entity types, every filter / sort / tab on every listing, map pan-zoom
and city selection, AI Match including multilingual intent extraction, match
scoring and reasoning throughout, connect and apply flows, message composing,
notification read state, language switching, translation toggles.

**Mocked:** persistence. Connecting, applying, sending and saving are local
state; they survive interaction but not a reload. Each sits behind a component
boundary that becomes a server action unchanged.

**Not built:** authentication, file uploads, payments, real-time transport.

---

## Extending it

- **Supabase** — implement `DataSource`, swap the binding in
  `src/lib/data-source/index.ts`.
- **An LLM for matching** — implement `Interpreter`, or replace the body of
  `/api/match`. `MatchResult` does not change.
- **Mapbox / Google Maps** — implement `MapEngineProps`, swap the engine in
  `src/components/map/world-map.tsx`.
- **A translation API** — implement `Translator` in `src/lib/i18n/translator.ts`.
- **More languages** — add the code to `LANGUAGES` and fill in
  `src/lib/i18n/dictionary.ts`; TypeScript will list every string that needs one.
