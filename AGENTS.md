# AGENTS.md — wheretheystand-client

Guidance for AI agents working in this repository.

## What this is

**WhereTheyStand** is a New Zealand political transparency site: MPs, parties, bills, votes, electorates, parliaments, and (in a future state) live election results. This repo is the **public-facing Nuxt frontend**. It is deployed at [wheretheystand.nz](https://wheretheystand.nz).

The Django REST API lives in a separate repo: [wheretheystand-django](https://github.com/jamescmacey/wheretheystand-django). Most entity data comes from that API; this client renders it.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Nuxt 4 (Vue 3, TypeScript) |
| UI | [@nuxt/ui](https://ui.nuxt.com) v4 + Tailwind CSS v4 |
| State | Composables + `useState` (Pinia is installed but unused) |
| Content | `@nuxt/content` v3 (D1 in production) |
| Search | Algolia via `@nuxtjs/algolia` + `vue-instantsearch` |
| Maps | `nuxt-mapbox` |
| Hosting | Cloudflare Workers (`nitro.preset: cloudflare_module`) |

## Repository layout

```
pages/           File-based routes (public site + /console admin)
layouts/         default (site chrome), console (staff UI), elections (results UI)
components/      Domain-grouped Vue components
  app/           Header, footer, banners, logo
  console/       Admin workbook ingestion UI
  elections/     Live results components
  search/        Algolia result cards
  w-content/     Reusable list/pagination primitives (kebab-case filenames)
composables/     Shared logic (API, SEO, auth, pagination, etc.)
types/           TypeScript types for API/console models
utils/           Pure helpers (dates, colours, formatting)
middleware/      Global + route middleware
content/         Local markdown (reference, blog, changes)
server/          No custom server routes — Nitro serves the built app only
```

### Route map (high level)

| Area | Path prefix | Notes |
|------|-------------|-------|
| Entity detail | `/people/:id`, `/bills/:id`, `/votes/:id`, `/parties/:id`, `/electorates/:id`, `/parliaments/:number` | Parent page fetches entity; child tabs via nested `NuxtPage` |
| List pages | `/people`, `/bills`, `/votes`, `/parties`, `/electorates`, `/parliaments` | Often paginated via `w-content/paginated-content` |
| Elections | `/elections/...` | Gated by `NUXT_PUBLIC_ELECTIONS_ENABLED`; uses `elections` layout |
| Search | `/search` | Client-only (`ssr: false`) |
| Content | `/docs`, `/blog`, `/reference`, `/changes` | Nuxt Content collections |
| Admin console | `/console/...` | Staff-only; Django session auth |

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run dev:reset    # Clear .nuxt cache and restart (use when modules/content act up)
npm run build        # Production build (needs ~4 GB heap; set in package.json)
npm run deploy       # wrangler deploy to Cloudflare
```

### Environment variables

Set in `.env` for local dev. Public runtime config is in `nuxt.config.ts` → `runtimeConfig.public`.

| Variable | Purpose |
|----------|---------|
| `NUXT_PUBLIC_API_BASE` | Public read API, default `https://api.wheretheystand.nz/v2/` |
| `NUXT_PUBLIC_API_ORIGIN` | Django origin for auth/admin, default `https://api.wheretheystand.nz` |
| `NUXT_PUBLIC_SITE_URL` | Canonical site URL for return redirects |
| `NUXT_PUBLIC_ELECTIONS_ENABLED` | `"true"` to expose `/elections` routes |
| `ALGOLIA_*`, `MAPBOX_ACCESS_TOKEN`, `TURNSTILE_SITE_KEY` | Third-party integrations |

For console auth locally, Django must be running and configured to accept cookies from the Nuxt dev origin.

## Architecture

### Public data fetching

Entity pages fetch from the Django v2 API using `$fetch` + `useAsyncData`:

```ts
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const { data, status, error, refresh } = await useAsyncData(
  computed(() => `person-${route.params.id}`),
  () => $fetch(`${apiBase}people/${route.params.id}/`),
)
throwIfEntityNotFound(error, `/people/${route.params.id}`)
```

Conventions:

- API responses use **snake_case** (Django REST). Do not camelize unless there is a clear, local reason.
- Use a stable `useAsyncData` key that includes route params so navigation refetches correctly.
- Call `throwIfEntityNotFound()` after entity detail fetches to render `error.vue` on 404.
- Parent entity pages (`pages/people/[id].vue`, etc.) fetch once and pass data to tab children via `<NuxtPage :person="person" />`.

### SEO

Use `usePageSeo()` on every public page. It sets title (via `app.vue` title template), description, and Open Graph/Twitter meta. Tabbed entity routes can use helpers like `personTabSeoTitle()`.

### UI patterns

- Use **@nuxt/ui** components (`UContainer`, `UCard`, `UEmpty`, `UProgress`, `UButton`, etc.) — do not introduce a second component library.
- Standard loading state: centred `UProgress` inside `UCard`.
- Standard error state: `UEmpty` with a Refresh `UButton` calling `refresh()`.
- Page chrome: `PageHeader` for title/subtitle/colour gradient; site layout wraps with `AppHeader` / `AppFooter` / `AppBanners`.
- Icons: Lucide via Nuxt Icon (`i-lucide-*`).
- Dates: format for **en-NZ** (`Intl.DateTimeFormat('en-NZ', …)` or `date-fns`).
- Brand colours: `theme1` (#349494), `theme2` (#58787f) — see `assets/css/main.css` and `app.config.ts`.

### Pagination

List pages and `w-content/paginated-content` handle Django-style paginated responses (`count`, `next`, `previous`, `results`). Use `usePaginationPageHref` for link-based page navigation.

### Content (markdown)

Collections are defined in `content.config.ts`:

- `reference`, `blog`, `changes` — local files under `content/`
- `docs` — pulled from `wheretheystand-django/docs/*.md` via GitHub source

Query with `queryCollection('docs')` / `queryCollectionNavigation('docs')`. Docs pages are `noindex`.

### Search

`/search` uses Algolia InstantSearch. It **must stay client-only** — SSR on Cloudflare Workers fails with *"Code generation from strings disallowed for this context"*. Do not enable SSR for this route.

### Elections feature flag

`middleware/elections-feature-flag.global.ts` redirects election routes to `/` when `NUXT_PUBLIC_ELECTIONS_ENABLED` is not `"true"`. When adding election-related nav links, gate them the same way (see `pages/people/[id].vue`).

### Legacy URL redirects

`middleware/legacy-entity-redirect.global.ts` 301-redirects old integer IDs (`/bills/123`) to v2 UUIDs via `migration/bills/:id/` and `migration/votes/:id/` API endpoints.

## Admin console (`/console`)

Staff-only area for data ingestion (workbooks, system events). Key points:

- Auth is **Django session cookies on the API origin** — not Nuxt auth.
- `middleware/auth-console.ts` checks staff session **client-side only** (`import.meta.server` returns early; cookies are not forwarded on SSR).
- Use `useAdminApi()` for credentialed requests (includes CSRF for mutating methods). Use `useAdminSession()` for session state.
- Console `useAsyncData` calls that need cookies should pass `{ server: false }`.
- Console pages use `layout: 'console'`, `middleware: 'auth-console'`, and `robots: false`.
- API paths for admin often start at the origin root (e.g. `v2/workbooks/`), not `apiBase`.

Do not assume console flows work during SSR or in tests without a browser cookie context.

## Deployment

- Built with `npm run build`; deployed via Wrangler (`wrangler.jsonc`).
- Nuxt Content uses **Cloudflare D1** (`binding: DB`) in production.
- Prerender crawl is disabled (`crawlLinks: false`); the app is SSR on Workers.
- `/search` and `/contact` have `routeRules` SSR disabled at the Nitro level too.

## Coding guidelines for agents

1. **Minimize scope** — Match existing patterns in the nearest similar file. Do not refactor unrelated code.
2. **Reuse composables** — Check `composables/` before adding new API or auth logic.
3. **Prefer @nuxt/ui** — Look up Nuxt UI v4 docs for component props rather than hand-rolling markup.
4. **Type new models** — Add shared types under `types/` when they are used in more than one file.
5. **Keep components domain-scoped** — `components/console/` for admin, `components/elections/` for results, etc.
6. **No new server routes** unless there is a strong reason; this app is primarily a client of the Django API.
7. **Do not commit** unless explicitly asked.
8. **Backend changes** — If an endpoint or field is missing, note that the change belongs in `wheretheystand-django`, not here.

## User-facing writing and grammar

Use this section when the agent writes copy that a visitor or staff user will read: page titles, descriptions, empty states, error messages, toasts, button labels, help text, banners, markdown in `content/`, and SEO meta.

### Scope

| Audience | Where it appears | Tone |
|----------|------------------|------|
| Public site | Pages, `UEmpty`, `PageHeader`, `content/` | Informative, neutral, accessible |
| Admin console | `/console`, toasts, form labels | Direct and functional; still professional |
| SEO / social | `usePageSeo`, Open Graph | Factual; no clickbait |

### Your style guide

**Voice and tone**

- Calm and factual; never partisan or editorial
- Plain language for a general NZ audience, not parliamentary insiders
- Confident but not promotional.

There is no need for click bait or hyperbolic SEO optimisation.  It does not matter how many people access WhereTheyStand, because it is not a money making endeavour.  The goal is to show up in search results where the site has relevant information and not promise information that the site does not have.

**Grammar and spelling**

- Use New Zealand English.  This includes terminology and spelling.
- Use active voice wherever possible.
- Avoid contractions.
- Use an en-dash to show a range of numbers eg 5–10.
- Use a space either side of an em-dash.
- Em-dashes should be used sparingly for asides.
- Avoid exclamation points.
- Do not use full stops in "eg" or "ie".
- There is no "we": WhereTheyStand is a site maintained by only one person.  Do not use "we".  You should also avoid using "I" if possible.

**Capital letters and terminology**
- Use "bills" or "a bill" when referring to bills in general.  Use a capital ("the Bill") when referring to a specific bill.
- Use "enactments" when referring to acts of Parliament generally.  Use a capital ("the Act") when referring to a specific enactment.
- When describing something as "parliamentary" we use a lowercase p.
- When referring to Royal assent, Royal always begins with a capital R.
- Someone is a "member of Parliament" not a "Member of Parliament".  After the first reference use "member"/"members" rather than "MP"/"MPs" unless the context requires using the latter.
- Use sentence case for headinsg.
- UI buttons and nav labels: match nearby UI (existing pattern is short, sentence-style labels).

**Numbers and dates**

- Dates shown to users: **en-NZ** long form (eg 7 June 2026), consistent with existing pages.
- Use commas in large numbers (e.g. 1,234).
- Use 12-hour clock in the following format: 4.32 pm.  Note the space between the am/pm indicator, that the indicator is in lowercase, and does not contain full stops.
- When using dates in combination with time, the time should come after eg 7 June 2026 at 4.32 pm.
- Spell out numbers one to nine; use numerals from 10 upward.
- Where numbers are spelt out in a range, use " to " or " through " rather than an en-dash.  

### Patterns already used in this repo

Follow these unless your style guide above says otherwise:

- **Error titles** — Short, specific: `Error loading timeline`, `Could not delete workbook`.
- **Error descriptions** — One sentence, actionable where possible: `An error occurred while loading the timeline. Please try again.`
- **Empty states** — State what is missing, not whose fault it is: `No timeline found for this person.`
- **Toasts (success)** — Past tense, brief: `Workbook deleted`, `File uploaded`.
- **Toasts (failure)** — `Could not …` + `Please try again.` for generic errors.
- **Loading** — `Loading…` or `Loading timeline…` (ellipsis on generic waits).
- **Buttons** — Verb-first: `Refresh`, `Sign out`, `Retry`.
- **SEO descriptions** — Factual summary, ideally under 160 characters (`usePageSeo` trims longer text).

### Examples

| Avoid | Prefer |
|-------|--------|
| "Oops! Something went wrong!!!" | "An error occurred while loading this page. Please try again." |
| "This MP shamefully voted against the bill" | "Voted against the … Bill." |
| "Click here to learn more" | "Learn more about urgency" (descriptive link text) |
| "Utilise the search functionality" | "Search by name" |

### Before shipping user-facing copy

1. Read it aloud — if it sounds like marketing or an opinion column, rewrite.
2. Check names, dates, and titles against API data or official sources.
3. Match the length of similar UI nearby (don't write a paragraph where a label is expected).
4. For public explanatory content, prefer linking to Parliament or legislation.govt.nz over paraphrasing procedure.

Never insert links to external sites (like Parliament) that you have generated the URL for yourself.  Most URLs to static pages will be in the format `https://links.wheretheystand.nz/<slug>` to enable easy modification if redirects change, and better tracking.

## When to touch wheretheystand-django instead

- New or changed REST endpoints, serializers, or permissions
- Console workbook pipeline logic, ingestion recipes, or file processing
- Docs content source files (`docs/*.md` in the Django repo)
- Auth, CSRF, or session configuration
- Database models and migrations

## Common pitfalls

| Pitfall | Why |
|---------|-----|
| SSR for `/search` or InstantSearch | Breaks on Cloudflare Workers |
| Admin API calls during SSR | Browser cookies are not available |
| Forgetting `throwIfEntityNotFound` | 404s show inline error UI instead of proper error page |
| Hard-coding `https://api.wheretheystand.nz` | Use `useRuntimeConfig().public.apiBase` / `apiOrigin` |
| Enabling elections UI without the env flag | Routes redirect to home |
| Editing `docs` in this repo | Docs collection pulls from the Django repo |
| Large unfocused diffs in `pages/bills/[id].vue` | That file has heavy display mapping; extend carefully |

## Key files to read first

| Task | Start here |
|------|------------|
| New entity page | `pages/people/[id].vue` + a tab child under `pages/people/[id]/` |
| New list page | `pages/bills/index.vue` or `components/w-content/paginated-content.vue` |
| New console feature | `composables/useAdminApi.ts`, `layouts/console.vue`, `pages/console/` |
| SEO | `composables/usePageSeo.ts`, `app.vue` |
| Content page | `pages/docs/[contentSlug].vue`, `content.config.ts` |
| Config / feature flags | `nuxt.config.ts` |
| Styling / theme | `assets/css/main.css`, `app.config.ts` |
