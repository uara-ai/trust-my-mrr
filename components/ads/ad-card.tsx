"use client";

import { MinimalCard } from "@/components/minimal-card";
import { AdCardData } from "@/types/ads";
import { ExternalLink, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdCardProps {
  data: AdCardData;
  className?: string;
}

export function AdCard({ data, className }: AdCardProps) {
  const { spot, content } = data;

  // Determine if it's a premium spot (over $500)
  const isPremium = spot.price >= 500;
  const isBanner = spot.size === "banner";

  // If there's active content, show the ad
  if (content && content.isActive) {
    return (
      <MinimalCard
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg",
          isPremium && "ring-1 ring-amber-200 dark:ring-amber-900",
          className
        )}
        style={{
          width: spot.dimensions.width,
          minHeight: spot.dimensions.height,
        }}
      >
        <a
          href={content.startup.website}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex h-full flex-col justify-between p-4"
        >
          {/* Premium Badge */}
          {isPremium && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant="outline"
                className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[10px] gap-1"
              >
                <Zap className="h-2.5 w-2.5 fill-current" />
                Featured
              </Badge>
            </div>
          )}

          {/* Ad Label */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
            Sponsored
          </div>

          {/* Content Layout - varies by banner type */}
          {isBanner ? (
            <div className="flex items-center gap-4 pt-2">
              {content.startup.logo && (
                <img
                  src={content.startup.logo}
                  alt={content.startup.name}
                  className="h-12 w-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 truncate">
                    {content.startup.name}
                  </h3>
                  {content.startup.tagline && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      • {content.startup.tagline}
                    </span>
                  )}
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto" />
                </div>
                {content.startup.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                    {content.startup.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header with Logo and Title */}
              <div className="flex items-start gap-3 mb-3">
                {content.startup.logo && (
                  <img
                    src={content.startup.logo}
                    alt={content.startup.name}
                    className={cn(
                      "rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0",
                      spot.size === "large" ? "h-14 w-14" : "h-10 w-10"
                    )}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "font-semibold text-zinc-900 dark:text-zinc-50 truncate",
                        spot.size === "large" ? "text-base" : "text-sm"
                      )}
                    >
                      {content.startup.name}
                    </h3>
                    <ExternalLink className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  {content.startup.tagline && (
                    <p
                      className={cn(
                        "font-medium text-zinc-600 dark:text-zinc-400 mt-0.5",
                        spot.size === "large" ? "text-sm" : "text-xs"
                      )}
                    >
                      {content.startup.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Description (only for larger ads) */}
              {spot.size !== "small" && content.startup.description && (
                <p
                  className={cn(
                    "text-zinc-500 dark:text-zinc-400 flex-1",
                    spot.size === "large"
                      ? "text-sm line-clamp-3"
                      : "text-xs line-clamp-2"
                  )}
                >
                  {content.startup.description}
                </p>
              )}
            </div>
          )}
        </a>
      </MinimalCard>
    );
  }

  // If no content, show pricing and "Buy This Spot" CTA
  return (
    <MinimalCard
      className={cn(
        "group relative overflow-hidden bg-gradient-to-br from-zinc-50 via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 border-dashed hover:border-solid transition-all duration-300 hover:shadow-md",
        isPremium &&
          "from-amber-50/50 via-zinc-50 to-amber-50/50 dark:from-amber-950/20 dark:via-zinc-900 dark:to-amber-950/20",
        className
      )}
      style={{
        width: spot.dimensions.width,
        minHeight: spot.dimensions.height,
      }}
    >
      <div className="flex h-full flex-col items-center justify-center text-center p-4">
        {isPremium ? (
          <Zap className="h-7 w-7 text-amber-500 dark:text-amber-400 mb-2 animate-pulse" />
        ) : (
          <Sparkles className="h-6 w-6 text-zinc-400 dark:text-zinc-500 mb-2" />
        )}

        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          {isPremium ? "Premium Ad Spot" : "Available Ad Spot"}
        </p>

        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
          ${spot.price}
          <span className="text-xs font-normal text-zinc-500">/mo</span>
        </p>

        {isPremium && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mb-2">
            HIGH VISIBILITY
          </p>
        )}

        <Button
          size="sm"
          variant={isPremium ? "default" : "outline"}
          className={cn(
            "h-8 text-xs gap-1.5 mt-2",
            isPremium &&
              "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
          )}
          asChild
        >
          <a
            href={`https://buy.stripe.com/test_${spot.stripePriceId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isPremium ? (
              <Zap className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Buy This Spot
          </a>
        </Button>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3 font-mono">
          {spot.size.toUpperCase()} • {spot.dimensions.width} ×{" "}
          {spot.dimensions.height}
        </p>
      </div>
    </MinimalCard>
  );
}
