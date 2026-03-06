interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/40 px-6 py-10 text-center">
      <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
      <p className="mt-2 max-w-md text-xs text-zinc-400">{message}</p>
    </section>
  );
}

