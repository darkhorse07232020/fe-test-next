import { ChangeEvent } from "react";
import type { LaunchQueryOptions } from "@/types/spacex";

interface LaunchFiltersProps {
  value: LaunchQueryOptions;
  onChange: (next: LaunchQueryOptions) => void;
}

export default function LaunchFilters({ value, onChange }: LaunchFiltersProps) {
  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value: inputValue } = event.target;
    onChange({
      ...value,
      [name]: inputValue,
    });
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value: selectValue } = event.target;
    onChange({
      ...value,
      [name]: selectValue,
    } as LaunchQueryOptions);
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value: dateValue } = event.target;
    onChange({
      ...value,
      [name]: dateValue || undefined,
    });
  };

  return (
    <section
      aria-label="Launch filters"
      className="mb-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 shadow-sm shadow-black/40 sm:mb-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
          >
            Search by mission name
          </label>
          <input
            id="search"
            name="search"
            type="search"
            placeholder="e.g. Starlink"
            value={value.search ?? ""}
            onChange={handleTextChange}
            className="mt-1 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
          />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:max-w-md">
          <div>
            <label
              htmlFor="upcoming"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Time
            </label>
            <select
              id="upcoming"
              name="upcoming"
              value={value.upcoming}
              onChange={handleSelectChange}
              className="mt-1 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            >
              <option value="all">All launches</option>
              <option value="upcoming">Upcoming only</option>
              <option value="past">Past only</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="success"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Result
            </label>
            <select
              id="success"
              name="success"
              value={value.success}
              onChange={handleSelectChange}
              className="mt-1 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            >
              <option value="all">All statuses</option>
              <option value="success">Successful only</option>
              <option value="failure">Failed only</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="startDate"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              From date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={value.startDate ?? ""}
              onChange={handleDateChange}
              className="mt-1 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              To date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={value.endDate ?? ""}
              onChange={handleDateChange}
              className="mt-1 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-zinc-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
            Sort
          </span>
          <div className="mt-1 flex gap-2 text-xs">
            <select
              name="sort"
              value={value.sort}
              onChange={handleSelectChange}
              aria-label="Sort launches"
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-50 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/60"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

