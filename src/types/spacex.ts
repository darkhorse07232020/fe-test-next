export interface LaunchLinks {
  patch: {
    small: string | null;
    large: string | null;
  };
  webcast: string | null;
  article: string | null;
  wikipedia: string | null;
  flickr: {
    small: string[];
    original: string[];
  };
}

export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  upcoming: boolean;
  details: string | null;
  rocket: string;
  launchpad: string;
  links: LaunchLinks;
}

export interface LaunchQueryOptions {
  upcoming: "all" | "upcoming" | "past";
  success: "all" | "success" | "failure";
  startDate?: string;
  endDate?: string;
  search?: string;
  sort: "date_desc" | "date_asc" | "name_asc" | "name_desc";
}

export interface LaunchQueryResponse {
  docs: Launch[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface Rocket {
  id: string;
  name: string;
  type: string;
  company: string;
  description: string;
  active: boolean;
  stages: number;
  boosters: number;
  cost_per_launch: number;
  success_rate_pct: number;
  first_flight: string;
}

export interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  launch_attempts: number;
  launch_successes: number;
  status: string;
}

export interface FavoriteLaunch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  upcoming: boolean;
  rocket: string;
  launchpad: string;
  patchSmall: string | null;
}

