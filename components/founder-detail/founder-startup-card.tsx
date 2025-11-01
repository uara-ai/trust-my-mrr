"use client";

import Link from "next/link";
import { ExternalLink, TrendingUp, Repeat, Users } from "lucide-react";
import { MinimalCard } from "@/components/minimal-card";
import { getGoogleFavicon } from "@/lib/favicon";
import { Button } from "@/components/ui/button";

interface StartupMetrics {
  monthlyRecurringRevenue: number;
  totalRevenue: number;
  totalCustomers: number;
  currency: string;
}

interface FounderStartupCardProps {
  slug: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  metrics?: StartupMetrics | null;
}

export function FounderStartupCard({
  slug,
  name,
  description,
  logo,
  website,
  metrics,
}: FounderStartupCardProps) {
  const logoUrl = logo || (website ? getGoogleFavicon(website, 128) : null);

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MinimalCard className="hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="h-12 w-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 items-center justify-center"
              style={{ display: logoUrl ? "none" : "flex" }}
            >
              <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/startup/${slug}`}
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                {name}
              </Link>
              {website && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-6 w-6 p-0"
                >
                  <Link
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-3" />
                  </Link>
                </Button>
              )}
            </div>
            {description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Metrics */}
        {metrics ? (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <TrendingUp className="size-3" />
                <span>Revenue</span>
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(metrics.totalRevenue, metrics.currency)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <Repeat className="size-3" />
                <span>MRR</span>
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(
                  metrics.monthlyRecurringRevenue,
                  metrics.currency
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <Users className="size-3" />
                <span>Customers</span>
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {metrics.totalCustomers}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            No metrics available
          </div>
        )}
      </div>
    </MinimalCard>
  );
}
