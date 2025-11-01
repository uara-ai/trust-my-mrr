"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { StartupWithMetrics } from "@/types/startup";
import { deleteStartup } from "@/app/actions/startup.actions";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export const columns: ColumnDef<StartupWithMetrics>[] = [
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
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{startup.name}</span>
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          {startup.description && (
            <span className="text-sm text-zinc-500 line-clamp-1">
              {startup.description}
            </span>
          )}
          {startup.founders.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {startup.founders.map((founder) => (
                <Badge key={founder.id} variant="outline" className="text-xs">
                  @{founder.x_username}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
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
        <div className="font-medium">
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
        <div className="font-medium">
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
    id: "customers",
    accessorFn: (row) => row.metrics?.totalCustomers || 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Customers
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
        <div className="font-medium">
          {startup.metrics.totalCustomers.toLocaleString()}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.metrics?.totalCustomers || 0;
      const b = rowB.original.metrics?.totalCustomers || 0;
      return a - b;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Added
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="text-sm text-zinc-500">
          {formatDate(row.getValue("createdAt"))}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const startup = row.original;

      const handleDelete = async () => {
        if (
          window.confirm(
            `Are you sure you want to delete "${startup.name}"? This action cannot be undone.`
          )
        ) {
          const result = await deleteStartup(startup.id);
          if (!result.success) {
            alert(result.error || "Failed to delete startup");
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(startup.id)}
            >
              Copy startup ID
            </DropdownMenuItem>
            {startup.website && (
              <DropdownMenuItem
                onClick={() => window.open(startup.website!, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit website
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
