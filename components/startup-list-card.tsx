"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getGoogleFavicon } from "@/lib/favicon";
import type { StartupWithMetrics } from "@/types/startup";

interface StartupListCardProps {
  startup: StartupWithMetrics;
  rank: number;
}

export function StartupListCard({ startup, rank }: StartupListCardProps) {
  const logoUrl =
    startup.logo ||
    (startup.website ? getGoogleFavicon(startup.website, 128) : null);

  return (
    <Link
      href={`/startup/${startup.slug}`}
      className="block p-4 bg-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={startup.name}
              className="h-12 w-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center"
            style={{ display: logoUrl ? "none" : "flex" }}
          >
            <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
              {startup.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {startup.name}
          </h3>
          {startup.website && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              {startup.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              <ExternalLink className="h-2.5 w-2.5" />
            </p>
          )}
          {startup.metrics && (
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mt-2">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: startup.metrics.currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(startup.metrics.totalRevenue)}{" "}
              <span className="text-xs font-normal text-zinc-500">
                total revenue
              </span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
