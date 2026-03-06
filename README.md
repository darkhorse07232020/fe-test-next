# SpaceX Explorer

A Next.js app for browsing SpaceX launches using the [SpaceX API v4](https://api.spacexdata.com/v4). Browse and filter launches, open mission details with rocket and launchpad info, save favorites (LocalStorage), view analytics charts, and compare two launches side by side.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, React Query, Zustand.

---

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Scripts:** `npm run build` (production build), `npm run start` (run production server), `npm run lint` (ESLint).

---

## Environment

The SpaceX API base URL is configured via an environment variable so it can be overridden per environment:

- `NEXT_PUBLIC_SPACEX_API_BASE` — default: `https://api.spacexdata.com/v4`

For local development, copy `.env.template` to `.env.local` (or create `.env.local`) and set the value if you need a different endpoint:

```bash
NEXT_PUBLIC_SPACEX_API_BASE=https://api.spacexdata.com/v4
```

Restart `npm run dev` after changing env vars.

---

## What’s in the app

- **Launches** (`/`) — List with server-side pagination (“Load more”), filters (upcoming/past, success/failure, date range), sort, and search by mission name. Virtualized list (react-window) so scrolling stays smooth.
- **Launch detail** (`/launches/[id]`) — Mission info, rocket and launchpad, links (article, Wikipedia, webcast), Flickr image gallery, favorite toggle.
- **Favorites** (`/favorites`) — Saved launches from LocalStorage (Zustand + persist); view and remove.
- **Analytics** (`/analytics`) — Charts: launches per year, success rate over time (Recharts).
- **Compare** (`/compare?left=id&right=id`) — Side-by-side comparison; shareable URL.

---

## Architecture decisions

- **App vs Pages Router**: Uses the **App Router** (`src/app`) for nested layouts and modern Next.js patterns. Pages Router would also work here, but App Router keeps routes, layouts, and data hooks cleaner for future expansion.
- **Data fetching: React Query vs SWR/custom**: React Query handles caching, dedupe, background refresh, infinite queries, and retry/backoff out of the box. SWR would be similar, but React Query’s infinite-query support and devtools made it the better fit. Fetching is centralized in `src/lib/spacexApi.ts`.
- **State management**: Only cross-page client state is favorites, implemented with **Zustand + persist** in `src/stores/useFavoritesStore.ts` (no React Context).
- **UI composition**: Reusable components under `src/components/<Name>/index.tsx`, Tailwind CSS v4 for styling, and a shared header/layout in `src/app/layout.tsx`.

---

## SpaceX API usage (queries & pagination)

- **Base**: `process.env.NEXT_PUBLIC_SPACEX_API_BASE` (defaults to `https://api.spacexdata.com/v4`).
- **Launch list**: `POST /launches/query`
  - Query fields: `upcoming` (true/false), `success` (true/false), `date_utc` (`$gte`/`$lte` for range), `name` (regex for search).
  - Options: `page`, `limit` (e.g. 20), `sort` (date/name), `select` for the minimal fields used in the list.
  - Implemented via React Query `useInfiniteQuery`, using `hasNextPage`/`nextPage` from the response to drive “Load more”.
- **Launch detail**: `GET /launches/:id` plus `GET /rockets/:id` and `GET /launchpads/:id` based on IDs in the launch.
- **Analytics**: A bounded `/launches/query` fetch (limited recent launches) to compute yearly counts and success rates.

---

## Performance and accessibility considerations

- **Performance**
  - Virtualized launch list with `react-window` 1.x (`FixedSizeList`) + `react-virtualized-auto-sizer` so only visible rows render; scroll position is preserved when “Load more” appends items.
  - React Query caching for list pages and individual entities; reasonable `staleTime` and refetch on focus/reconnect to avoid unnecessary network calls.
  - Derived values (formatted dates, status badges) and heavier UI pieces are memoized to reduce re-renders.
- **Accessibility**
  - Semantic structure: landmarks (`header`, `main`, `section`), descriptive headings, and proper lists.
  - Labeled controls for filters/search/date range; ARIA used where appropriate (`aria-pressed` for favorite buttons, `aria-current` for active nav links).
  - Clear loading, empty, and error states with retry affordances; focus styles visible on interactive elements.

---

## Tradeoffs and next steps

- **Client-side fetching only**: All data is loaded via React Query in client components. This simplifies the app but makes the first load dependent on JS + network. With more time, I can add server-side prefetch and React Query hydration for better SEO and faster first paint.
- **Analytics data slice**: Analytics charts use a limited recent-launches query rather than the full SpaceX history for simplicity and to avoid heavy initial requests. I can introduce multiple queries or a small backend to aggregate richer stats.
- **Virtualization version**: `react-window` 1.x was chosen because it keeps scroll position stable when appending rows. A future upgrade to 2.x is possible if its behavior aligns better with this UX.

---

## Known limitations / TODOs

- Analytics are based on a limited recent-launches query, not the full dataset.
- No server-side rendering/hydration of API data; everything is fetched on the client.
- Compare page relies on valid launch IDs in the URL; there is no autocomplete or search-picker for selection.
- External image hosts (e.g. imgbox, Flickr) must be allowed in `next.config.ts` for `next/image`; new hosts need config updates.
