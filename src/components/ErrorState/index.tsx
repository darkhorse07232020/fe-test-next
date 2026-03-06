interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We could not load this data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-800/80 bg-rose-950/40 px-6 py-8 text-center">
      <h2 className="text-sm font-semibold tracking-tight text-rose-100">{title}</h2>
      <p className="max-w-md text-xs text-rose-200/80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center rounded-full border border-rose-500 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          Try again
        </button>
      )}
    </section>
  );
}

