import Image from "next/image";
import Link from "next/link";
import { memo, useMemo } from "react";
import type { Launch } from "@/types/spacex";

interface LaunchCardProps {
  launch: Launch;
  isFavorite: boolean;
  onToggleFavorite: (launch: Launch) => void;
}

function formatLaunchDate(dateUtc: string): string {
  const date = new Date(dateUtc);
  if (Number.isNaN(date.getTime())) {
    return dateUtc;
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function LaunchCardComponent({ launch, isFavorite, onToggleFavorite }: LaunchCardProps) {
  const statusLabel = useMemo(() => {
    if (launch.upcoming) {
      return "Upcoming";
    }
    if (launch.success === true) {
      return "Success";
    }
    if (launch.success === false) {
      return "Failure";
    }
    return "Unknown";
  }, [launch.success, launch.upcoming]);

  const statusColorClass = useMemo(() => {
    if (launch.upcoming) {
      return "bg-sky-500/90 text-black";
    }
    if (launch.success === true) {
      return "bg-emerald-500/90 text-black";
    }
    if (launch.success === false) {
      return "bg-rose-500/90 text-black";
    }
    return "bg-zinc-700/90 text-zinc-50";
  }, [launch.success, launch.upcoming]);

  const formattedDate = useMemo(() => formatLaunchDate(launch.date_utc), [launch.date_utc]);

  return (
    <article className="group relative flex gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 shadow-sm shadow-black/40 transition hover:border-sky-500/70 hover:bg-zinc-900/70 focus-within:ring-2 focus-within:ring-sky-500/70">
      <div className="relative mt-1 h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900">
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
            No image
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight text-zinc-50">
              {launch.name}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">{formattedDate}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${statusColorClass}`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/launches/${launch.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 rounded-md"
            >
              <span>View details</span>
              <span aria-hidden="true" className="translate-y-px text-[0.6rem]">
                ↗
              </span>
            </Link>
            <Link
              href={`/compare?left=${launch.id}`}
              className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-zinc-400 hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md"
            >
              <span>Compare</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(launch)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isFavorite
                ? "border-amber-400/70 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                : "border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-sky-500/80 hover:bg-zinc-800/80"
            }`}
          >
            <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
            <span>{isFavorite ? "Favorited" : "Favorite"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

const LaunchCard = memo(LaunchCardComponent);

export default LaunchCard;

