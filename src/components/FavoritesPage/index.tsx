"use client";

import LaunchCard from "@/components/LaunchCard";
import EmptyState from "@/components/EmptyState";
import { useFavorites } from "@/stores/useFavoritesStore";

export default function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const hasFavorites = favorites.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
          Favorite launches
        </h1>
        <p className="max-w-2xl text-xs text-zinc-400 sm:text-sm">
          Bookmarked launches are stored in your browser, so they stay available even if you go
          offline.
        </p>
        <p className="text-[0.7rem] text-zinc-500">
          {favorites.length.toLocaleString("en-US")} launch
          {favorites.length === 1 ? "" : "es"} in favorites
        </p>
      </header>

      {!hasFavorites && (
        <EmptyState
          title="No favorites yet"
          message="Browse the launches list and use the star button to bookmark missions you care about."
        />
      )}

      {hasFavorites && (
        <section className="space-y-3 rounded-2xl border border-zinc-800/80 bg-black/40 p-4">
          <div className="grid gap-3">
            {favorites.map((fav) => (
              <LaunchCard
                key={fav.id}
                launch={{
                  id: fav.id,
                  name: fav.name,
                  date_utc: fav.date_utc,
                  success: fav.success,
                  upcoming: fav.upcoming,
                  rocket: fav.rocket,
                  launchpad: fav.launchpad,
                  links: {
                    patch: {
                      small: fav.patchSmall,
                      large: fav.patchSmall,
                    },
                    webcast: null,
                    article: null,
                    wikipedia: null,
                    flickr: {
                      small: [],
                      original: [],
                    },
                  },
                }}
                isFavorite={isFavorite(fav.id)}
                onToggleFavorite={(launch) => toggleFavorite(launch)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

