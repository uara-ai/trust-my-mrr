"use client";

import { useState } from "react";
import { ArrowLeft, ExternalLink, Share2, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FounderAvatar } from "@/components/founder-avatar";
import { getGoogleFavicon } from "@/lib/favicon";
import { VerifiedBadge } from "./verified-badge";
import { RankBadge } from "./rank-badge";

interface Founder {
  id: string;
  x_username: string;
  profileImageUrl?: string | null;
  displayName?: string | null;
}

interface StartupHeaderProps {
  name: string;
  slug: string;
  rank: number;
  totalStartups: number;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  founders: Founder[];
}

export function StartupHeader({
  name,
  slug,
  rank,
  totalStartups,
  logo,
  website,
  description,
  founders,
}: StartupHeaderProps) {
  const [copied, setCopied] = useState(false);

  // Determine which logo to use: Stripe logo or favicon from website
  // Request higher quality (128px) for better display
  const logoUrl = logo || (website ? getGoogleFavicon(website, 128) : null);

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/startup/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Startups
        </Button>
      </Link>

      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2">
          {/* Logo */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              className="h-14 w-14 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
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
            className="h-14 w-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 items-center justify-center"
            style={{ display: logoUrl ? "none" : "flex" }}
          >
            <span className="text-xl font-medium text-zinc-500 dark:text-zinc-400">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Title row with badges and buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {name}
            </h1>

            <VerifiedBadge />
            <RankBadge rank={rank} totalStartups={totalStartups} />

            {website && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-7 gap-1.5 text-xs"
              >
                <Link href={website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3" />
                  Visit
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="h-7 gap-1.5 text-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="size-3" />
                  Share
                </>
              )}
            </Button>
          </div>

          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 max-w-2xl">
              {description}
            </p>
          )}

          {/* Founders */}
          {founders.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-3">
                {founders.map((founder) => (
                  <a
                    key={founder.id}
                    href={`https://x.com/${founder.x_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    title={founder.displayName || `@${founder.x_username}`}
                  >
                    <FounderAvatar
                      username={founder.x_username}
                      profileImageUrl={founder.profileImageUrl}
                      size="sm"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      @{founder.x_username}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
