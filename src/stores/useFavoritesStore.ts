"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FavoriteLaunch, Launch } from "@/types/spacex";

interface FavoritesState {
  favorites: FavoriteLaunch[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (launch: Launch) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isFavorite: (id: string) => get().favorites.some((fav) => fav.id === id),
      toggleFavorite: (launch: Launch) =>
        set((state) => {
          const exists = state.favorites.some((fav) => fav.id === launch.id);

          if (exists) {
            return {
              favorites: state.favorites.filter((fav) => fav.id !== launch.id),
            };
          }

          const nextFavorite: FavoriteLaunch = {
            id: launch.id,
            name: launch.name,
            date_utc: launch.date_utc,
            success: launch.success,
            upcoming: launch.upcoming,
            rocket: launch.rocket,
            launchpad: launch.launchpad,
            patchSmall: launch.links.patch.small,
          };

          return {
            favorites: [...state.favorites, nextFavorite],
          };
        }),
    }),
    {
      name: "spacex-explorer-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useFavorites() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return { favorites, isFavorite, toggleFavorite };
}

