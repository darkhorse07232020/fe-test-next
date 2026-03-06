# SpaceX Explorer

A Next.js app for browsing SpaceX launches using the [SpaceX API v4](https://api.spacexdata.com/v4). Browse and filter launches, open mission details with rocket and launchpad info, save favorites (LocalStorage), view analytics charts, and compare two launches side by side.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, React Query, Zustand.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Scripts:** `npm run build` (production build), `npm run start` (run production server), `npm run lint` (ESLint).

---

## What’s in the app

- **Launches** (`/`) — List with server-side pagination (“Load more”), filters (upcoming/past, success/failure, date range), sort, and search by mission name. Virtualized list (react-window) so scrolling stays smooth.
- **Launch detail** (`/launches/[id]`) — Mission info, rocket and launchpad, links (article, Wikipedia, webcast), Flickr image gallery, favorite toggle.
- **Favorites** (`/favorites`) — Saved launches from LocalStorage (Zustand + persist); view and remove.
- **Analytics** (`/analytics`) — Charts: launches per year, success rate over time (Recharts).
- **Compare** (`/compare?left=id&right=id`) — Side-by-side comparison; shareable URL.

---

## Tech and architecture

- **App Router** — Routes live under `src/app/`; layout wraps the app with `QueryProvider` and `Header`.
- **Data** — All SpaceX data via React Query (`src/lib/spacexApi.ts`). List uses `POST /launches/query` with server-side pagination (page + limit); detail uses `GET /launches/:id`, then `GET /rockets/:id` and `GET /launchpads/:id`. Retry only on 429/5xx with backoff.
- **Favorites** — Zustand store in `src/stores/useFavoritesStore.ts` with `persist` to LocalStorage; `useFavorites()` hook for components.
- **UI** — Components under `src/components/<Name>/index.tsx`; Tailwind for styling; loading skeletons, empty and error states with retry.

---

## Notes

- List virtualization uses react-window 1.x so scroll position is kept when you click “Load more”.
- Analytics use a limited recent-launches query, not the full history.
- External image domains (e.g. imgbox, Flickr) are set in `next.config.ts`; add new ones there if needed.
