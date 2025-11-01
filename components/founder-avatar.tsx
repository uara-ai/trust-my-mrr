"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FounderAvatarProps {
  username: string;
  profileImageUrl?: string | null;
  size?: "sm" | "md";
}

// Client-side cache for X profile images
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function FounderAvatar({
  username,
  profileImageUrl,
  size = "md",
}: FounderAvatarProps) {
  // Use stored profileImageUrl from database if available, otherwise use unavatar
  const [imageUrl, setImageUrl] = useState<string>(
    profileImageUrl || `https://unavatar.io/x/${username}`
  );

  useEffect(() => {
    // If profileImageUrl is already provided from database, use it and don't fetch
    if (profileImageUrl) {
      setImageUrl(profileImageUrl);
      return;
    }

    const cleanUsername = username.replace("@", "").toLowerCase();

    // Check cache first
    const cached = imageCache.get(cleanUsername);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setImageUrl(cached.url);
      return;
    }

    // Fetch from API in background only if no database value
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `/api/x-profile?username=${encodeURIComponent(cleanUsername)}`,
          {
            // Use cache-first strategy
            cache: "force-cache",
            next: { revalidate: 86400 }, // 24 hours
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.profileImageUrl) {
            const url = result.data.profileImageUrl;
            setImageUrl(url);

            // Cache the result
            imageCache.set(cleanUsername, {
              url,
              timestamp: Date.now(),
            });
          }
        }
      } catch (error) {
        // Silently fail and use unavatar fallback
        console.error(`Failed to fetch X profile for @${username}:`, error);
      }
    };

    fetchImage();
  }, [username, profileImageUrl]);

  const sizeClasses = size === "sm" ? "h-5 w-5 sm:h-6 sm:w-6" : "h-8 w-8";
  const fallbackTextSize =
    size === "sm" ? "text-[9px] sm:text-[10px]" : "text-xs";

  return (
    <Avatar className={`${sizeClasses} shrink-0`}>
      <AvatarImage src={imageUrl} alt={username} />
      <AvatarFallback className={fallbackTextSize}>
        {username.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
