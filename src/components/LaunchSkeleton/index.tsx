export default function LaunchSkeleton() {
  return (
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
  );
}

