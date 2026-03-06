"use client";

import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFavorites } from "@/stores/useFavoritesStore";
import LaunchFilters from "@/components/LaunchFilters";
import LaunchList from "@/components/LaunchList";
import ErrorState from "@/components/ErrorState";
import type { Launch, LaunchQueryOptions } from "@/types/spacex";
import { fetchLaunchesPage } from "@/lib/spacexApi";

const PAGE_SIZE = 20;

const DEFAULT_FILTERS: LaunchQueryOptions = {
  upcoming: "all",
  success: "all",
  sort: "date_desc",
  search: "",
  startDate: undefined,
  endDate: undefined,
};

export default function LaunchesPage() {
  const [filters, setFilters] = useState<LaunchQueryOptions>(DEFAULT_FILTERS);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const queryKey = useMemo(
    () => ["launches", filters] as const,
    [filters],
  );

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchLaunchesPage({
        pageParam: typeof pageParam === "number" ? pageParam : 1,
        pageSize: PAGE_SIZE,
        options: filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage && lastPage.nextPage ? lastPage.nextPage : undefined,
  });

  const launches: Launch[] = useMemo(
    () => data?.pages.flatMap((page) => page.launches) ?? [],
    [data],
  );

  const handleFiltersChange = (next: LaunchQueryOptions) => {
    setFilters(next);
  };

  const launchesCountLabel =
    launches.length === 0
      ? "No launches"
      : `${launches.length.toLocaleString("en-US")} launch${
          launches.length === 1 ? "" : "es"
        } loaded`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
          SpaceX launches
        </h1>
        <p className="max-w-2xl text-xs text-zinc-400 sm:text-sm">
          Explore past and upcoming SpaceX missions. Filter by status and date, sort, and bookmark
          your favorite launches.
        </p>
        <p className="text-[0.7rem] text-zinc-500">
          {launchesCountLabel} · {favorites.length.toLocaleString("en-US")} favorite
          {favorites.length === 1 ? "" : "s"}
        </p>
      </header>

      <LaunchFilters value={filters} onChange={handleFiltersChange} />

      {isError ? (
        <ErrorState
          message={(error as Error | undefined)?.message ?? undefined}
          onRetry={() => refetch()}
        />
      ) : (
        <LaunchList
          launches={launches}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={Boolean(hasNextPage)}
          onLoadMore={() => fetchNextPage()}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

