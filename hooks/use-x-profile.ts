"use client";

import { useState, useEffect } from "react";

interface XProfile {
  profileImageUrl: string;
  displayName: string;
}

// Client-side cache for X profiles
const clientCache = new Map<string, { data: XProfile; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook to fetch X user profile with client-side caching
 */
export function useXProfile(username: string | null) {
  const [profile, setProfile] = useState<XProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setProfile(null);
      return;
    }

    const cleanUsername = username.replace("@", "").toLowerCase();

    // Check client-side cache
    const cached = clientCache.get(cleanUsername);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProfile(cached.data);
      return;
    }

    // Fetch from API
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/x-profile?username=${encodeURIComponent(cleanUsername)}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          const profileData = result.data as XProfile;
          setProfile(profileData);

          // Cache the result
          clientCache.set(cleanUsername, {
            data: profileData,
            timestamp: Date.now(),
          });
        } else {
          setError(result.error || "Failed to fetch profile");
          setProfile(null);
        }
      } catch (err) {
        setError("Network error");
        console.error("Error fetching X profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  return { profile, loading, error };
}

/**
 * Utility to get X profile image URL with fallback to unavatar
 */
export function getXProfileImageUrl(username: string): string {
  const cleanUsername = username.replace("@", "");

  // Check cache first
  const cached = clientCache.get(cleanUsername.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data.profileImageUrl;
  }

  // Fallback to unavatar while fetching
  return `https://unavatar.io/x/${cleanUsername}`;
}
