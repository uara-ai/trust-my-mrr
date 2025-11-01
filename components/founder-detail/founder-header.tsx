"use client";

import { useState } from "react";
import { Share2, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FounderAvatar } from "@/components/founder-avatar";

interface FounderHeaderProps {
  username: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  startupsCount: number;
}

export function FounderHeader({
  username,
  displayName,
  profileImageUrl,
  startupsCount,
}: FounderHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/founder/${username}`;
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
      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <FounderAvatar
            username={username}
            profileImageUrl={profileImageUrl}
            size="md"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Title row with badges and buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {displayName || `@${username}`}
            </h1>

            {/* X Profile Link */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7 gap-1.5 text-xs"
            >
              <Link
                href={`https://x.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3" />@{username}
              </Link>
            </Button>

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

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
            Building {startupsCount}{" "}
            {startupsCount === 1 ? "startup" : "startups"} in public
          </p>
        </div>
      </div>
    </div>
  );
}
