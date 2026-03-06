import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import type { Launch } from "@/types/spacex";
import LaunchCard from "@/components/LaunchCard";

interface LaunchListProps {
  launches: Launch[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (launch: Launch) => void;
}

interface ItemData {
  launches: Launch[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (launch: Launch) => void;
}

function Row({ index, style, data }: ListChildComponentProps<ItemData>) {
  const launch = data.launches[index];

  return (
    <div style={style} className="px-0.5 py-1">
      <LaunchCard
        launch={launch}
        isFavorite={data.isFavorite(launch.id)}
        onToggleFavorite={data.onToggleFavorite}
      />
    </div>
  );
}

export default function LaunchList({
  launches,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  isFavorite,
  onToggleFavorite,
}: LaunchListProps) {
  const hasLaunches = launches.length > 0;

  return (
    <section aria-label="Launch results" className="space-y-4">
      <div className="h-[60vh] min-h-[320px] rounded-2xl border border-zinc-800/80 bg-black/40">
        {isLoading && (
          <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index}>
                {/* Reuse skeleton structure without importing to keep dependency small */}
                <div className="flex gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/80 p-4 shadow-sm shadow-black/40">
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-zinc-800/80" />
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="mt-1 flex-1 space-y-2">
                        <div className="h-3 w-40 animate-pulse rounded-full bg-zinc-800/80" />
                        <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-900/80" />
                      </div>
                      <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800/80" />
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-800/80" />
                      <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-800/80" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && hasLaunches && (
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                itemCount={launches.length}
                itemSize={112}
                itemData={{
                  launches,
                  isFavorite,
                  onToggleFavorite,
                }}
                className="outline-none"
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        )}
        {!isLoading && !hasLaunches && (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-zinc-400">
            No launches match the current filters.
          </div>
        )}
      </div>
      {hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="inline-flex items-center rounded-full border border-sky-500/80 bg-sky-500/10 px-6 py-1.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            {isFetchingNextPage ? "Loading more…" : "Load more launches"}
          </button>
        </div>
      )}
    </section>
  );
}

