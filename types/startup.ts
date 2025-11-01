import type { Startup, Founder } from "@prisma/client";

export type StartupWithFounders = Startup & {
  founders: Founder[];
};

export interface StartupMetrics {
  monthlyRecurringRevenue: number;
  totalRevenue: number;
  totalCustomers: number;
  currency: string;
}

export interface StartupWithMetrics extends StartupWithFounders {
  metrics?: StartupMetrics | null;
  metricsError?: string;
}

export interface CreateStartupInput {
  apiKey: string;
  website?: string;
  founders?: string[]; // Array of X usernames
}

export interface UpdateStartupInput {
  id: string;
  name?: string;
  description?: string;
  apiKey?: string;
  website?: string;
}

export type SortField = "name" | "mrr" | "revenue" | "customers" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface StartupFilters {
  search?: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
}
