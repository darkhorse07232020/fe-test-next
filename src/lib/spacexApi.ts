import { Launch, LaunchQueryOptions, LaunchQueryResponse, Launchpad, Rocket } from "@/types/spacex";

const SPACEX_API_BASE =
  process.env.NEXT_PUBLIC_SPACEX_API_BASE;

interface FetchLaunchesParams {
  pageParam?: number;
  pageSize?: number;
  options: LaunchQueryOptions;
  signal?: AbortSignal;
}

export interface LaunchesPageResult {
  launches: Launch[];
  page: number;
  hasNextPage: boolean;
  nextPage: number | null;
  totalDocs: number;
}

function buildLaunchQueryBody({
  pageParam = 1,
  pageSize = 20,
  options,
}: FetchLaunchesParams): unknown {
  const query: Record<string, unknown> = {};

  if (options.upcoming === "upcoming") {
    query.upcoming = true;
  } else if (options.upcoming === "past") {
    query.upcoming = false;
  }

  if (options.success === "success") {
    query.success = true;
  } else if (options.success === "failure") {
    query.success = false;
  }

  if (options.startDate || options.endDate) {
    const dateQuery: Record<string, string> = {};
    if (options.startDate) {
      dateQuery.$gte = options.startDate;
    }
    if (options.endDate) {
      dateQuery.$lte = options.endDate;
    }
    query.date_utc = dateQuery;
  }

  if (options.search && options.search.trim().length > 0) {
    query.name = {
      $regex: options.search.trim(),
      $options: "i",
    };
  }

  const sort: Record<string, 1 | -1> = {};

  switch (options.sort) {
    case "name_asc":
      sort.name = 1;
      break;
    case "name_desc":
      sort.name = -1;
      break;
    case "date_asc":
      sort.date_utc = 1;
      break;
    case "date_desc":
    default:
      sort.date_utc = -1;
  }

  return {
    query,
    options: {
      page: pageParam,
      limit: pageSize,
      sort,
      select: [
        "id",
        "name",
        "date_utc",
        "success",
        "upcoming",
        "rocket",
        "launchpad",
        "links.patch.small",
      ],
    },
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = `SpaceX API error: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function fetchLaunchesPage(params: FetchLaunchesParams): Promise<LaunchesPageResult> {
  const body = buildLaunchQueryBody(params);

  const response = await fetch(`${SPACEX_API_BASE}/launches/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  const data = await handleResponse<LaunchQueryResponse>(response);

  return {
    launches: data.docs,
    page: data.page,
    hasNextPage: data.hasNextPage,
    nextPage: data.nextPage,
    totalDocs: data.totalDocs,
  };
}

export async function fetchLaunchById(id: string, signal?: AbortSignal): Promise<Launch> {
  const response = await fetch(`${SPACEX_API_BASE}/launches/${id}`, {
    signal,
  });

  return handleResponse<Launch>(response);
}

export async function fetchRocketById(id: string, signal?: AbortSignal): Promise<Rocket> {
  const response = await fetch(`${SPACEX_API_BASE}/rockets/${id}`, {
    signal,
  });

  return handleResponse<Rocket>(response);
}

export async function fetchLaunchpadById(id: string, signal?: AbortSignal): Promise<Launchpad> {
  const response = await fetch(`${SPACEX_API_BASE}/launchpads/${id}`, {
    signal,
  });

  return handleResponse<Launchpad>(response);
}

interface FetchAnalyticsLaunchesParams {
  limit?: number;
  signal?: AbortSignal;
}

export async function fetchLaunchesForAnalytics(
  params: FetchAnalyticsLaunchesParams = {},
): Promise<Launch[]> {
  const limit = params.limit ?? 300;

  const body = {
    query: {},
    options: {
      sort: {
        date_utc: 1 as const,
      },
      limit,
      select: ["id", "name", "date_utc", "success"],
    },
  };

  const response = await fetch(`${SPACEX_API_BASE}/launches/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: params.signal,
  });

  const data = await handleResponse<LaunchQueryResponse>(response);
  return data.docs;
}


