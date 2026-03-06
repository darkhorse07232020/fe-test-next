"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { Launch, Launchpad, Rocket } from "@/types/spacex";
import { fetchLaunchById, fetchLaunchpadById, fetchRocketById } from "@/lib/spacexApi";
import ErrorState from "@/components/ErrorState";

interface CompareLaunchesPageProps {
  initialLeftId?: string;
  initialRightId?: string;
}

interface LaunchBundle {
  launch?: Launch;
  rocket?: Rocket;
  launchpad?: Launchpad;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

function useLaunchBundle(id?: string): LaunchBundle {
  const enabled = Boolean(id);

  const results = useQueries({
    queries: [
      {
        queryKey: ["compare-launch", id],
        queryFn: () => fetchLaunchById(id as string),
        enabled,
      },
      {
        queryKey: ["compare-rocket", id],
        queryFn: async ({ signal }): Promise<Rocket> => {
          const launch = await fetchLaunchById(id as string, signal);
          return fetchRocketById(launch.rocket, signal);
        },
        enabled,
      },
      {
        queryKey: ["compare-launchpad", id],
        queryFn: async ({ signal }): Promise<Launchpad> => {
          const launch = await fetchLaunchById(id as string, signal);
          return fetchLaunchpadById(launch.launchpad, signal);
        },
        enabled,
      },
    ],
  });

  const [launchResult, rocketResult, launchpadResult] = results;

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const error =
    (launchResult.error as Error | undefined) ??
    (rocketResult.error as Error | undefined) ??
    (launchpadResult.error as Error | undefined);

  return {
    launch: launchResult.data,
    rocket: rocketResult.data,
    launchpad: launchpadResult.data,
    isLoading,
    isError,
    error,
  };
}

function formatShortDate(dateUtc: string): string {
  const date = new Date(dateUtc);
  if (Number.isNaN(date.getTime())) {
    return dateUtc;
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export default function CompareLaunchesPage({
  initialLeftId,
  initialRightId,
}: CompareLaunchesPageProps) {
  const router = useRouter();
  const [leftId, setLeftId] = useState(initialLeftId ?? "");
  const [rightId, setRightId] = useState(initialRightId ?? "");

  const leftBundle = useLaunchBundle(leftId || undefined);
  const rightBundle = useLaunchBundle(rightId || undefined);

  const hasAnyError = leftBundle.isError || rightBundle.isError;
  const firstError = leftBundle.error ?? rightBundle.error;

  const statusLabel = (launch?: Launch): string => {
    if (!launch) return "–";
    if (launch.upcoming) return "Upcoming";
    if (launch.success === true) return "Success";
    if (launch.success === false) return "Failure";
    return "Unknown";
  };

  const statusColorClass = (launch?: Launch): string => {
    if (!launch) return "bg-zinc-800/80 text-zinc-300";
    if (launch.upcoming) return "bg-sky-500/90 text-black";
    if (launch.success === true) return "bg-emerald-500/90 text-black";
    if (launch.success === false) return "bg-rose-500/90 text-black";
    return "bg-zinc-700/90 text-zinc-50";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (leftId.trim()) {
      params.set("left", leftId.trim());
    }
    if (rightId.trim()) {
      params.set("right", rightId.trim());
    }

    const query = params.toString();
    router.push(query ? `/compare?${query}` : "/compare");
  };

  const canCompare = Boolean(leftBundle.launch && rightBundle.launch);

  const summary = useMemo(() => {
    if (!canCompare || !leftBundle.launch || !rightBundle.launch) {
      return null;
    }

    const leftDate = new Date(leftBundle.launch.date_utc);
    const rightDate = new Date(rightBundle.launch.date_utc);

    let chronology: string | null = null;
    if (!Number.isNaN(leftDate.getTime()) && !Number.isNaN(rightDate.getTime())) {
      if (leftDate.getTime() < rightDate.getTime()) {
        chronology = `${leftBundle.launch.name} launched earlier than ${rightBundle.launch.name}.`;
      } else if (leftDate.getTime() > rightDate.getTime()) {
        chronology = `${rightBundle.launch.name} launched earlier than ${leftBundle.launch.name}.`;
      } else {
        chronology = "Both launches share the same launch date.";
      }
    }

    return chronology;
  }, [canCompare, leftBundle.launch, rightBundle.launch]);

  if (hasAnyError && !leftBundle.isLoading && !rightBundle.isLoading) {
    return (
      <ErrorState
        title="Unable to load launches for comparison"
        message={firstError?.message}
        onRetry={() => {
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
          Compare launches
        </h1>
        <p className="max-w-2xl text-xs text-zinc-400 sm:text-sm">
          Paste launch IDs from the list or detail views to compare missions side by side.
          The URL includes both IDs, so you can share comparisons easily.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40"
        aria-label="Launch selection for comparison"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="leftId"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Left launch ID
            </label>
            <input
              id="leftId"
              name="leftId"
              value={leftId}
              onChange={(event) => setLeftId(event.target.value)}
              placeholder="e.g. from /launches/[id]"
              className="mt-1 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            />
          </div>
          <div>
            <label
              htmlFor="rightId"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Right launch ID
            </label>
            <input
              id="rightId"
              name="rightId"
              value={rightId}
              onChange={(event) => setRightId(event.target.value)}
              placeholder="e.g. from /launches/[id]"
              className="mt-1 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex items-center rounded-full border border-sky-500/80 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Update comparison URL
          </button>
          <p className="text-[0.7rem] text-zinc-500">
            Tip: use the &ldquo;Compare&rdquo; link on any launch card or detail page to
            prefill one side.
          </p>
        </div>
      </form>

      <section
        aria-label="Side-by-side launch comparison"
        className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-6">
          {[leftBundle, rightBundle].map((bundle, index) => {
            const label = index === 0 ? "Left launch" : "Right launch";
            const selectedId = index === 0 ? leftId : rightId;
            const side = index === 0 ? "Left" : "Right";
            const isLoading = bundle.isLoading && selectedId.trim().length > 0;

            return (
              <div
                key={side}
                className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3"
              >
                <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-400">
                  {label}
                </p>
                {isLoading && (
                  <div className="space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-zinc-800/80" />
                    <div className="h-3 w-24 animate-pulse rounded-full bg-zinc-900/80" />
                    <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-900/80" />
                  </div>
                )}
                {!isLoading && !bundle.launch && (
                  <p className="text-[0.7rem] text-zinc-500">
                    Enter a valid launch ID and update the comparison URL to see details here.
                  </p>
                )}
                {!isLoading && bundle.launch && (
                  <div className="space-y-3 text-xs text-zinc-300">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-50">
                          {bundle.launch.name}
                        </p>
                        <p className="mt-0.5 text-[0.7rem] text-zinc-400">
                          {formatShortDate(bundle.launch.date_utc)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${statusColorClass(bundle.launch)}`}
                      >
                        {statusLabel(bundle.launch)}
                      </span>
                    </div>
                    <div className="space-y-1 text-[0.7rem]">
                      <p>
                        <span className="text-zinc-500">Date:</span>{" "}
                        <span>{formatShortDate(bundle.launch.date_utc)}</span>
                      </p>
                      <p>
                        <span className="text-zinc-500">Rocket:</span>{" "}
                        <span>
                          {bundle.rocket
                            ? `${bundle.rocket.name} · ${bundle.rocket.company}`
                            : "Unknown"}
                        </span>
                      </p>
                      <p>
                        <span className="text-zinc-500">Launchpad:</span>{" "}
                        <span>
                          {bundle.launchpad
                            ? `${bundle.launchpad.full_name} · ${bundle.launchpad.locality}, ${bundle.launchpad.region}`
                            : "Unknown"}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {summary && (
          <p className="mt-4 text-[0.7rem] text-zinc-400">
            {summary}
          </p>
        )}
      </section>
    </div>
  );
}

