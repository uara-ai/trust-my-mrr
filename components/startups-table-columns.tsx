"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { StartupWithMetrics } from "@/types/startup";
import { getGoogleFavicon } from "@/lib/favicon";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const columns: ColumnDef<StartupWithMetrics>[] = [
  {
    id: "rank",
    header: () => <div className="text-center">#</div>,
    cell: ({ row, table }) => {
      // Get the sorted rows to determine rank
      const sortedRows = table.getSortedRowModel().rows;
      const rank = sortedRows.findIndex((r) => r.id === row.id) + 1;

      return (
        <div className="text-center font-medium text-zinc-600 dark:text-zinc-400">
          {rank}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Startup
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startup = row.original;

      // Determine which logo to use: Stripe logo or favicon from website
      const logoUrl =
        startup.logo ||
        (startup.website ? getGoogleFavicon(startup.website, 40) : null);

      return (
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={startup.name}
              className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 items-center justify-center"
            style={{ display: logoUrl ? "none" : "flex" }}
          >
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {startup.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {startup.name}
            </span>
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 flex items-center gap-1 truncate"
              >
                {startup.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "founders",
    header: () => <div>Founders</div>,
    cell: ({ row }) => {
      const startup = row.original;

      if (startup.founders.length === 0) {
        return (
          <span className="text-sm text-zinc-400 dark:text-zinc-500">—</span>
        );
      }

      return (
        <div className="flex flex-col gap-2">
          {startup.founders.map((founder) => (
            <div key={founder.id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage
                  src={`https://unavatar.io/x/${founder.x_username}`}
                  alt={founder.x_username}
                />
                <AvatarFallback className="text-[10px]">
                  {founder.x_username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <a
                href={`https://x.com/${founder.x_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                @{founder.x_username}
              </a>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "revenue",
    accessorFn: (row) => row.metrics?.totalRevenue || 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Total Revenue
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startup = row.original;
      if (startup.metricsError) {
        return (
          <span className="text-sm text-red-600 dark:text-red-400">Error</span>
        );
      }
      if (!startup.metrics) {
        return <span className="text-sm text-zinc-400">Loading...</span>;
      }
      return (
        <div className="font-semibold text-zinc-900 dark:text-zinc-50">
          {formatCurrency(
            startup.metrics.totalRevenue,
            startup.metrics.currency
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.metrics?.totalRevenue || 0;
      const b = rowB.original.metrics?.totalRevenue || 0;
      return a - b;
    },
  },
  {
    id: "mrr",
    accessorFn: (row) => row.metrics?.monthlyRecurringRevenue || 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          MRR
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startup = row.original;
      if (startup.metricsError) {
        return (
          <span className="text-sm text-red-600 dark:text-red-400">Error</span>
        );
      }
      if (!startup.metrics) {
        return <span className="text-sm text-zinc-400">Loading...</span>;
      }
      return (
        <div className="font-semibold text-zinc-900 dark:text-zinc-50">
          {formatCurrency(
            startup.metrics.monthlyRecurringRevenue,
            startup.metrics.currency
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.metrics?.monthlyRecurringRevenue || 0;
      const b = rowB.original.metrics?.monthlyRecurringRevenue || 0;
      return a - b;
    },
  },
];
