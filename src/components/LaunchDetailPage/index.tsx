"use client";

import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/stores/useFavoritesStore";
import ErrorState from "@/components/ErrorState";
import ImageGallery from "@/components/ImageGallery";
import type { Launch, Launchpad, Rocket } from "@/types/spacex";
import {
  fetchLaunchById,
  fetchLaunchpadById,
  fetchRocketById,
} from "@/lib/spacexApi";

interface LaunchDetailPageProps {
  id: string;
}

function formatLaunchDate(dateUtc: string): string {
  const date = new Date(dateUtc);
  if (Number.isNaN(date.getTime())) {
    return dateUtc;
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export default function LaunchDetailPage({ id }: LaunchDetailPageProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const results = useQueries({
    queries: [
      {
        queryKey: ["launch", id],
        queryFn: () => fetchLaunchById(id),
      },
      {
        queryKey: ["rocketForLaunch", id],
        queryFn: async ({ signal }): Promise<Rocket> => {
          const launch = await fetchLaunchById(id, signal);
          return fetchRocketById(launch.rocket, signal);
        },
        enabled: true,
      },
      {
        queryKey: ["launchpadForLaunch", id],
        queryFn: async ({ signal }): Promise<Launchpad> => {
          const launch = await fetchLaunchById(id, signal);
          return fetchLaunchpadById(launch.launchpad, signal);
        },
        enabled: true,
      },
    ],
  });

  const [launchResult, rocketResult, launchpadResult] = results;

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-6 w-40 animate-pulse rounded-full bg-zinc-800/80" />
        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:gap-6">
          <div className="space-y-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4">
            <div className="h-5 w-52 animate-pulse rounded-full bg-zinc-800/80" />
            <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-900/80" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full animate-pulse rounded-full bg-zinc-900/80" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-zinc-900/80" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-zinc-900/80" />
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4">
            <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-800/80" />
            <div className="h-3 w-40 animate-pulse rounded-full bg-zinc-900/80" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-zinc-900/80" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !launchResult.data) {
    const errorMessage =
      (launchResult.error as Error | undefined)?.message ??
      (rocketResult.error as Error | undefined)?.message ??
      (launchpadResult.error as Error | undefined)?.message;

    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => {
          results.forEach((result) => result.refetch());
        }}
      />
    );
  }

  const launch: Launch = launchResult.data;
  const rocket: Rocket | undefined = rocketResult.data;
  const launchpad: Launchpad | undefined = launchpadResult.data;

  const isLaunchFavorite = isFavorite(launch.id);

  const images = launch.links.flickr.original.length
    ? launch.links.flickr.original
    : launch.links.flickr.small;

  const statusLabel = launch.upcoming
    ? "Upcoming"
    : launch.success === true
      ? "Success"
      : launch.success === false
        ? "Failure"
        : "Unknown";

  const statusColorClass = launch.upcoming
    ? "bg-sky-500/90 text-black"
    : launch.success === true
      ? "bg-emerald-500/90 text-black"
      : launch.success === false
        ? "bg-rose-500/90 text-black"
        : "bg-zinc-700/90 text-zinc-50";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-zinc-400 hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md"
          >
            <span aria-hidden="true" className="translate-y-px text-[0.7rem]">
              ←
            </span>
            <span>Back to launches</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
              {launch.name}
            </h1>
            <Link
              href={`/compare?left=${launch.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-[0.7rem] font-medium text-zinc-200 transition hover:border-sky-500/80 hover:bg-zinc-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <span>Compare</span>
            </Link>
          </div>
          <p className="text-xs text-zinc-400 sm:text-sm">
            {formatLaunchDate(launch.date_utc)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(launch)}
          aria-pressed={isLaunchFavorite}
          aria-label={
            isLaunchFavorite
              ? "Remove launch from favorites"
              : "Add launch to favorites"
          }
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
            isLaunchFavorite
              ? "border-amber-400/70 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
              : "border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-sky-500/80 hover:bg-zinc-800/80"
          }`}
        >
          <span aria-hidden="true">{isLaunchFavorite ? "★" : "☆"}</span>
          <span>{isLaunchFavorite ? "Favorited" : "Favorite"}</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)] sm:gap-6">
        <section
          aria-label="Mission overview"
          className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Mission
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-50">{launch.name}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${statusColorClass}`}
            >
              {statusLabel}
            </span>
          </div>

          {launch.details && (
            <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-line">
              {launch.details}
            </p>
          )}

          <div className="mt-3 space-y-2 text-xs text-zinc-300">
            <p>
              <span className="text-zinc-500">Launch date:</span>{" "}
              <span>{formatLaunchDate(launch.date_utc)}</span>
            </p>
            {launchpad && (
              <p>
                <span className="text-zinc-500">Launchpad:</span>{" "}
                <span>
                  {launchpad.full_name} · {launchpad.locality}, {launchpad.region}
                </span>
              </p>
            )}
            {rocket && (
              <p>
                <span className="text-zinc-500">Rocket:</span>{" "}
                <span>
                  {rocket.name} ({rocket.company})
                </span>
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem]">
            {launch.links.article && (
              <a
                href={launch.links.article}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-zinc-200 transition hover:border-sky-500/80 hover:bg-zinc-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <span>Article</span>
                <span aria-hidden="true" className="text-[0.6rem]">
                  ↗
                </span>
              </a>
            )}
            {launch.links.wikipedia && (
              <a
                href={launch.links.wikipedia}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-zinc-200 transition hover:border-sky-500/80 hover:bg-zinc-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <span>Wikipedia</span>
                <span aria-hidden="true" className="text-[0.6rem]">
                  ↗
                </span>
              </a>
            )}
            {launch.links.webcast && (
              <a
                href={launch.links.webcast}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-zinc-200 transition hover:border-sky-500/80 hover:bg-zinc-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <span>Webcast</span>
                <span aria-hidden="true" className="text-[0.6rem]">
                  ↗
                </span>
              </a>
            )}
          </div>
        </section>

        <section
          aria-label="Vehicle and site"
          className="space-y-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Vehicle & launch site
          </h2>
          {rocket && (
            <div className="space-y-1 rounded-xl bg-zinc-900/60 p-3">
              <p className="text-xs font-semibold text-zinc-100">Rocket</p>
              <p className="text-xs text-zinc-300">
                {rocket.name} · {rocket.company}
              </p>
              <p className="mt-1 text-[0.7rem] text-zinc-400 line-clamp-3">
                {rocket.description}
              </p>
            </div>
          )}
          {launchpad && (
            <div className="space-y-1 rounded-xl bg-zinc-900/60 p-3">
              <p className="text-xs font-semibold text-zinc-100">Launchpad</p>
              <p className="text-xs text-zinc-300">
                {launchpad.full_name} · {launchpad.locality}, {launchpad.region}
              </p>
              <p className="mt-1 text-[0.7rem] text-zinc-400">
                Attempts: {launchpad.launch_attempts.toLocaleString("en-US")} ·
                Successes: {launchpad.launch_successes.toLocaleString("en-US")}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Imagery
            </p>
            <ImageGallery images={images} />
          </div>
        </section>
      </div>

      <section
        aria-label="Mission badge"
        className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40"
      >
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60">
          {launch.links.patch.small ? (
            <Image
              src={launch.links.patch.small}
              alt={`${launch.name} mission patch`}
              fill
              sizes="64px"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
              No patch
            </div>
          )}
        </div>
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-semibold text-zinc-100">Share this launch</p>
          <p className="text-zinc-400">
            Copy the URL from your browser&apos;s address bar to share this mission with
            others.
          </p>
        </div>
      </section>
    </div>
  );
}

