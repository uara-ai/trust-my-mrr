import { TwitterApi } from "twitter-api-v2";

interface XUserCache {
  profileImageUrl: string;
  displayName: string;
  timestamp: number;
}

// In-memory cache for X user profiles
const xUserCache = new Map<string, XUserCache>();

// Cache duration: 1 day in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Get X API client instance
 */
function getXClient() {
  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error("X_BEARER_TOKEN is not set in environment variables");
  }

  return new TwitterApi(bearerToken);
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(username: string): boolean {
  const cached = xUserCache.get(username.toLowerCase());
  if (!cached) return false;

  const now = Date.now();
  return now - cached.timestamp < CACHE_DURATION;
}

/**
 * Get cached user data if available and valid
 */
function getCachedUser(username: string): XUserCache | null {
  const cached = xUserCache.get(username.toLowerCase());
  if (cached && isCacheValid(username)) {
    return cached;
  }
  return null;
}

/**
 * Cache user data
 */
function cacheUser(
  username: string,
  data: Omit<XUserCache, "timestamp">
): void {
  xUserCache.set(username.toLowerCase(), {
    ...data,
    timestamp: Date.now(),
  });
}

/**
 * Fetch X user profile image with caching
 * @param username - X/Twitter username (without @)
 * @returns Profile image URL and display name
 */
export async function fetchXUserProfile(username: string): Promise<{
  profileImageUrl: string;
  displayName: string;
} | null> {
  try {
    // Remove @ if present
    const cleanUsername = username.replace("@", "");

    // Check cache first
    const cached = getCachedUser(cleanUsername);
    if (cached) {
      return {
        profileImageUrl: cached.profileImageUrl,
        displayName: cached.displayName,
      };
    }

    // Fetch from X API
    const client = getXClient();
    const user = await client.v2.userByUsername(cleanUsername, {
      "user.fields": ["profile_image_url", "name"],
    });

    if (!user.data) {
      return null;
    }

    // Get high-res profile image (replace _normal with _400x400)
    const profileImageUrl =
      user.data.profile_image_url?.replace("_normal", "_400x400") ||
      user.data.profile_image_url ||
      "";

    const displayName = user.data.name || cleanUsername;

    // Cache the result
    cacheUser(cleanUsername, {
      profileImageUrl,
      displayName,
    });

    return {
      profileImageUrl,
      displayName,
    };
  } catch (error) {
    console.error(`Error fetching X profile for @${username}:`, error);
    return null;
  }
}

/**
 * Fetch multiple X user profiles in parallel with caching
 * @param usernames - Array of X/Twitter usernames
 * @returns Map of username to profile data
 */
export async function fetchMultipleXUserProfiles(
  usernames: string[]
): Promise<Map<string, { profileImageUrl: string; displayName: string }>> {
  const results = new Map();

  // Separate cached and uncached usernames
  const uncachedUsernames: string[] = [];

  for (const username of usernames) {
    const cleanUsername = username.replace("@", "");
    const cached = getCachedUser(cleanUsername);

    if (cached) {
      results.set(cleanUsername.toLowerCase(), {
        profileImageUrl: cached.profileImageUrl,
        displayName: cached.displayName,
      });
    } else {
      uncachedUsernames.push(cleanUsername);
    }
  }

  // Fetch uncached profiles in parallel
  if (uncachedUsernames.length > 0) {
    const promises = uncachedUsernames.map((username) =>
      fetchXUserProfile(username)
    );

    const fetchedResults = await Promise.allSettled(promises);

    fetchedResults.forEach((result, index) => {
      const username = uncachedUsernames[index];
      if (result.status === "fulfilled" && result.value) {
        results.set(username.toLowerCase(), result.value);
      }
    });
  }

  return results;
}

/**
 * Clear cache for specific user or all users
 */
export function clearXUserCache(username?: string): void {
  if (username) {
    xUserCache.delete(username.toLowerCase());
  } else {
    xUserCache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getXCacheStats(): {
  size: number;
  entries: string[];
} {
  return {
    size: xUserCache.size,
    entries: Array.from(xUserCache.keys()),
  };
}
