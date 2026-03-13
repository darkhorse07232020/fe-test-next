"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Launch } from "@/types/spacex";
import { fetchLaunchesForAnalytics } from "@/lib/spacexApi";
import ErrorState from "@/components/ErrorState";

interface YearStats {
  year: string;
  launches: number;
  successes: number;
  failures: number;
  successRate: number;
}

function computeYearStats(launches: Launch[]): YearStats[] {
  const byYear = new Map<string, { launches: number; successes: number; failures: number }>();

  launches.forEach((launch) => {
    const date = new Date(launch.date_utc);
    const year = Number.isNaN(date.getTime()) ? "Unknown" : String(date.getUTCFullYear());

    const entry = byYear.get(year) ?? { launches: 0, successes: 0, failures: 0 };
    entry.launches += 1;
    if (launch.success === true) {
      entry.successes += 1;
    }
    if (launch.success === false) {
      entry.failures += 1;
    }
    byYear.set(year, entry);
  });

  const years = Array.from(byYear.entries())
    .map(([year, stats]) => {
      const successRate =
        stats.launches === 0 ? 0 : (stats.successes / stats.launches) * 100;
      return {
        year,
        launches: stats.launches,
        successes: stats.successes,
        failures: stats.failures,
        successRate: Number(successRate.toFixed(1)),
      };
    })
    .sort((a, b) => a.year.localeCompare(b.year));

  return years;
}

export default function LaunchAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["launches-analytics"],
    queryFn: () => fetchLaunchesForAnalytics({ limit: 300 }),
  });

  const yearStats = useMemo(
    () => (data ? computeYearStats(data) : []),
    [data],
  );

  const totalLaunches = data?.length ?? 0;
  const totalSuccesses =
    data?.filter((launch) => launch.success === true).length ?? 0;
  const totalFailures =
    data?.filter((launch) => launch.success === false).length ?? 0;
  const overallSuccessRate =
    totalLaunches === 0 ? 0 : Number(((totalSuccesses / totalLaunches) * 100).toFixed(1));

  if (isError) {
    return (
      <ErrorState
        title="Unable to load analytics"
        message={(error as Error | undefined)?.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
          Launch analytics
        </h1>
        <p className="max-w-2xl text-xs text-zinc-400 sm:text-sm">
          High-level view of recent SpaceX launches. Data is based on the most recent launches
          returned by the public API.
        </p>
        <p className="text-[0.7rem] text-zinc-500">
          {totalLaunches.toLocaleString("en-US")} launches ·{" "}
          {overallSuccessRate.toLocaleString("en-US")}%
          {" "}
          success rate · last {yearStats.length} year
          {yearStats.length === 1 ? "" : "s"}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] sm:gap-6">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Launches per year
          </h2>
          <p className="mb-3 mt-1 text-[0.7rem] text-zinc-500">
            Bars show total launches per calendar year.
          </p>
          <div className="h-64">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                Loading chart…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    tickLine={false}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    tickLine={false}
                    axisLine={{ stroke: "#3f3f46" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #3f3f46",
                      borderRadius: "0.75rem",
                      fontSize: "0.7rem",
                    }}
                    labelStyle={{ color: "#e4e4e7" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.7rem", color: "#a1a1aa" }}
                  />
                  <Bar dataKey="launches" name="Launches" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Success vs failure
            </h2>
            <p className="mb-3 mt-1 text-[0.7rem] text-zinc-500">
              Aggregate success rate across the loaded launches.
            </p>
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-emerald-400">
                  {overallSuccessRate.toLocaleString("en-US")}
                  <span className="text-sm text-zinc-400">%</span>
                </p>
                <p className="text-[0.7rem] text-zinc-500">
                  {totalSuccesses.toLocaleString("en-US")} successes ·{" "}
                  {totalFailures.toLocaleString("en-US")} failures
                </p>
              </div>
              <div className="h-16 flex-1 rounded-full bg-zinc-900/70 p-1">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-400 to-sky-500 transition-all"
                  style={{ width: `${overallSuccessRate}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-sm shadow-black/40">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Yearly success rate
            </h2>
            <p className="mb-3 mt-1 text-[0.7rem] text-zinc-500">
              Line chart of success rate by year (percentage of successful launches).
            </p>
            <div className="h-40">
              {isLoading ? (
                <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                  Loading chart…
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#a1a1aa" }}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46" }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #3f3f46",
                        borderRadius: "0.75rem",
                        fontSize: "0.7rem",
                      }}
                      labelStyle={{ color: "#e4e4e7" }}
                      formatter={(value) => [`${value ?? 0}%`, "Success rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      name="Success rate"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 2, strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

