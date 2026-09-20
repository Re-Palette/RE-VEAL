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

Node 20+ required. With no environment variables set, the whole prototype runs
on in-repo mock data as a **demo profile** — see *Accounts* below to turn on
real Google sign-in.

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
| Auth | Auth.js v5 (NextAuth) with Google, JWT sessions |
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

The locale lives in a **cookie**, not localStorage, because most of the product
— page headings, filter labels, every match reason — renders on the server. A
client-only locale leaves all of that stuck in English, which is exactly the
bug this layer was rebuilt to fix. The root layout reads the cookie, so the
first paint is already correct; changing language updates client text
immediately and calls `router.refresh()` for the server half.

Three separate concerns:

- **UI chrome** — `dictionary.ts`, 460 keys across `ja / en / ko / zh` with
  `{placeholder}` interpolation. Read via `useI18n()` on the client and
  `await getI18n()` on the server; both return the same `I18n` object, so a
  component is written once regardless of where it renders.
- **Taxonomy** — all 19 enumerations plus skills, interests, city names and
  country names (`labels-enums.ts`, `labels-taxonomy.ts`).
- **User content** — `content.ts` holds translations for the short editorial
  fields that fill cards (headlines, taglines, titles, summaries, budgets,
  city taglines), and `LookupTranslator` resolves against it. Long-form text —
  bios, project overviews, brand stories — stays in its original language and
  says so; that is the text a real translation API exists to handle, and
  connecting one means editing `translator.ts` alone, with this table becoming
  its cache.

Match reasons and narratives are built from templates rather than concatenated
strings, and narrative clauses are whole sentences joined by a locale-specific
separator, since CJK does not join clauses the way English does.

---

## Conversations

Messages are the one part of RE:VEAL that is written as well as read, so they
live behind their own seam rather than inside the seeded catalogue.

```ts
export const messaging: MessagingStore = isSupabaseConfigured
  ? new SupabaseMessagingStore()
  : new SeedMessagingStore();
```

**Without Supabase** the seeded inbox belongs to the demo profile, a signed-in
account starts empty, and the composer echoes what you type while saying
plainly that nothing is being stored. The prototype stays explorable for
anyone who clones the repository.

**With Supabase** threads, participants, read marks and messages live in
Postgres. Sending, opening a conversation from someone's profile, and clearing
an unread badge all go through server actions.

### Set it up

Copy the project URL and the `service_role` secret from *Settings → API Keys*
into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — locally in `.env.local`,
on Vercel in *Project Settings → Environment Variables* — then redeploy.

### Why the service role key, and why that is safe here

Sessions live in an Auth.js JWT rather than Supabase Auth, so there is no
`auth.uid()` for row-level policies to key on. The tables instead have **RLS
enabled with no policies at all**, which denies the anon and publishable keys
outright, and every query runs on the server with the service role key.
Authorisation is explicit: the store checks thread membership before it reads
or writes, and `sendMessageAction` takes the sender from the session rather
than the request, so a crafted call cannot post as someone else.
`src/lib/supabase/server.ts` is marked `server-only`, which turns an accidental
client import into a build error rather than a leaked credential.

### Seeded conversations are materialised, not migrated

The eight seeded conversations stay in the repository. A seed thread is copied
into Postgres — thread row plus participants — the first time someone actually
writes to it, which keeps the foreign key honest without a migration that has
to be re-run every time the seed data changes. Reads merge the two sources;
writes only ever go to the database.

### Still in the cookie

The signed-in profile itself has not moved yet: it still travels in the session
cookie, which is why there is no `members` table. That is the next thing to
move, together with a people directory that can show real accounts — until
then two real accounts cannot find each other to message.

---

## Accounts

Sign-in is **Google only**, through Auth.js v5. There is no password to
forget and no separate sign-up form: the first Google sign-in creates the
account.

### Two modes

**Demo mode** — the default, and what you get with no credentials configured.
Everything works against the seeded profile, nothing is gated, and the sidebar
offers to sign in. This keeps the prototype explorable for anyone who clones
the repo.

**Accounts mode** — active as soon as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
are present. Discovery (home, map, people, brands, projects, events, discover,
learn) stays public; the personal surfaces (`/messages`, `/notifications`,
`/settings`, `/portfolio`, `/profile`) require an account.

### Turning it on

1. **Google Cloud Console** → *APIs & Services* → *Credentials* →
   *Create credentials* → *OAuth client ID* → *Web application*.

2. **Authorised redirect URIs** — required, and the path is fixed by Auth.js:

   ```
   http://localhost:3000/api/auth/callback/google
   https://<your-domain>/api/auth/callback/google
   ```

   Google matches these exactly: scheme, port and trailing slash all count,
   and `127.0.0.1` is not `localhost`.

3. **Authorised JavaScript origins** — *not* required here. Sign-in runs as a
   server action and the code-for-token exchange happens on the server, so no
   browser-side Google SDK is involved. Add the origins anyway if you plan to
   introduce One Tap later; they are harmless.

   ```
   http://localhost:3000
   https://<your-domain>
   ```

4. Copy `.env.example` to `.env.local` and fill in the client ID and secret.

5. Generate a session-signing secret:

   ```bash
   npx auth secret          # or: openssl rand -base64 32
   ```

6. Check the result before starting the app:

   ```bash
   npm run check:auth                              # local only
   npm run check:auth -- https://your-domain       # plus a deployment
   ```

   It reads the same `.env` files Next.js reads, names anything missing or
   malformed, and prints the exact origins and redirect URIs to paste into the
   console. It masks secret values rather than echoing them.

On Vercel, set the same three variables in *Project Settings → Environment
Variables* and redeploy. RE:VEAL requests only `openid profile email`, so
Google returns a name, an email address and a profile picture — nothing else,
and nothing is posted on the user's behalf.

### When it does not work

| What you see | What it means |
| --- | --- |
| The sign-in page still says demo mode | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` did not reach the process. Restart `npm run dev` — env files are read at boot — and run `npm run check:auth`. |
| `redirect_uri_mismatch` | The callback URL is not registered under *Authorised redirect URIs* on the OAuth client. It must match character for character, including `http` vs `https`, the port, and no trailing slash. Registering only the JavaScript origin is not enough. |
| `UntrustedHost` | The request host is not trusted. `trustHost: true` covers this; if a proxy rewrites `Host`, pin `AUTH_URL` to the site origin (no `/api/auth`). |
| `Configuration` on `/signin` | Usually a missing or too-short `AUTH_SECRET`. |
| `access_blocked` / app not verified | The OAuth consent screen is in *Testing*. Add the account under *Audience → Test users*, or publish the app. |
| Signed in, but bounced back to `/onboarding` | Expected until the profile is completed — matching needs it. |

### Sign-up collects a profile, because matching needs one

A Google account gives a name; it cannot say what someone makes or who they
want to make it with. Every match score is built from role, city, beauty
categories, skills and what the person is open to, so first sign-in goes
through `/onboarding` to collect those. Middleware holds a half-finished
account there until it is done — an un-onboarded profile would score every
match at the floor and the product would look broken.

### Where the profile lives

There is no database yet, so the profile travels in the **encrypted session
cookie** (`session: { strategy: "jwt" }`). That is stateless, survives across
serverless instances, and needs no infrastructure — but it also means a profile
is only as durable as the cookie, and it is the first thing that should move
when Supabase lands. The seam is `src/lib/auth/viewer.ts`:

```ts
export async function getViewer(): Promise<Viewer>   // "demo" | "member"
```

Everything viewer-relative — match scores, messages, notifications,
connections — resolves through it, so moving accounts into a database is a
change to that file and `DataSource`, not to any page.

A signed-in account starts genuinely empty: no followers, no inbox, no
portfolio. Inventing numbers for a new user is the one dishonest thing this
product could do, so it does not.

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
| `/signin`, `/onboarding` | Google sign-in and first-run profile setup |
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
notification read state, and language switching across the entire interface —
chrome, taxonomy, match reasoning, dates and card-level content.

**Persisted, once Supabase is configured:** conversations. Threads,
participants, read marks and messages are in Postgres; sending, opening a
conversation from a profile and clearing an unread badge are server actions.
See *Conversations* above.

**Mocked:** the rest of persistence. Connecting, applying and saving are local
state; they survive interaction but not a reload. Each sits behind a component
boundary that becomes a server action unchanged.

**Not built:** file uploads, payments, and real-time transport — a new message
appears on the next load, not the instant it is sent. Accounts are real but
their profiles still live in the session cookie, so two real accounts cannot
yet find each other to message.

---

## Extending it

- **Supabase** — implement `DataSource`, swap the binding in
  `src/lib/data-source/index.ts`. Move the member profile out of the session at
  the same time: `getViewer()` then loads a row by account id.
- **An LLM for matching** — implement `Interpreter`, or replace the body of
  `/api/match`. `MatchResult` does not change.
- **Mapbox / Google Maps** — implement `MapEngineProps`, swap the engine in
  `src/components/map/world-map.tsx`.
- **A translation API** — implement `Translator` in `src/lib/i18n/translator.ts`.
- **More languages** — add the code to `LANGUAGES`, then fill in
  `dictionary.ts`, `labels-enums.ts` and `labels-taxonomy.ts`; TypeScript lists
  every entry that still needs one.
