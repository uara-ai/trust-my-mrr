/**
 * Utility functions for working with favicons with caching support
 */

export interface FaviconResult {
  primary: string;
  fallbacks: string[];
  localFallback: string;
}

interface FaviconCacheEntry {
  url: string;
  timestamp: number;
  successful: boolean;
}

// In-memory cache for favicon results
const faviconCache = new Map<string, FaviconCacheEntry>();

// Cache duration: 3 hours in milliseconds
const CACHE_DURATION = 3 * 60 * 60 * 1000;

/**
 * Normalize URL to ensure it has a protocol
 */
function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Extract domain from URL
 */
function extractDomain(websiteUrl: string): string {
  try {
    const url = new URL(normalizeUrl(websiteUrl));
    return url.hostname;
  } catch (error) {
    // If URL is invalid, try to extract domain manually
    const cleanUrl = websiteUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    return cleanUrl || "example.com";
  }
}

/**
 * Check if a URL is cached and still valid
 */
function isCacheValid(domain: string): boolean {
  const cached = faviconCache.get(domain);
  if (!cached) return false;

  const now = Date.now();
  return now - cached.timestamp < CACHE_DURATION;
}

/**
 * Get cached favicon URL if available and valid
 */
function getCachedFavicon(domain: string): string | null {
  if (isCacheValid(domain)) {
    const cached = faviconCache.get(domain);
    return cached?.successful ? cached.url : null;
  }
  return null;
}

/**
 * Cache a favicon result
 */
function cacheFavicon(domain: string, url: string, successful: boolean): void {
  faviconCache.set(domain, {
    url,
    timestamp: Date.now(),
    successful,
  });
}

/**
 * Get multiple favicon URL strategies with caching
 * @param websiteUrl - The website URL to get the favicon for
 * @param size - The size of the favicon (default: 32)
 * @returns Multiple favicon URL options with fallbacks
 */
export function getFaviconWithFallback(
  websiteUrl: string,
  size: number = 32
): FaviconResult {
  const domain = extractDomain(websiteUrl);
  const normalizedUrl = normalizeUrl(websiteUrl);

  // Check cache first
  const cachedUrl = getCachedFavicon(domain);
  if (cachedUrl) {
    return {
      primary: cachedUrl,
      fallbacks: [],
      localFallback: generateLocalFallback(domain, size),
    };
  }

  // Primary strategies (in order of preference)
  const strategies = [
    // 1. Direct favicon from the website
    `${normalizedUrl}/favicon.ico`,

    // 2. Common favicon paths
    `${normalizedUrl}/favicon.png`,
    `${normalizedUrl}/favicon.svg`,
    `${normalizedUrl}/apple-touch-icon.png`,
    `${normalizedUrl}/android-chrome-192x192.png`,

    // 3. Root domain favicon
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon.png`,

    // 4. Third-party services (as fallbacks)
    `https://icon.horse/icon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`,
    `https://favicons.githubusercontent.com/${domain}`,

    // 5. Favicon services with size support
    `https://api.faviconkit.com/${domain}/${size}`,
    `https://external-content.duckduckgo.com/ip3/${domain}.ico`,
  ];

  // Generate local SVG fallback based on domain
  const localFallback = generateLocalFallback(domain, size);

  return {
    primary: strategies[0], // First strategy as primary
    fallbacks: strategies.slice(1), // Rest as fallbacks
    localFallback,
  };
}

/**
 * Mark a favicon URL as successful in cache
 */
export function markFaviconSuccessful(
  websiteUrl: string,
  successfulUrl: string
): void {
  const domain = extractDomain(websiteUrl);
  cacheFavicon(domain, successfulUrl, true);
}

/**
 * Mark a domain as having no working favicon
 */
export function markFaviconFailed(websiteUrl: string): void {
  const domain = extractDomain(websiteUrl);
  const localFallback = generateLocalFallback(domain, 32);
  cacheFavicon(domain, localFallback, false);
}

/**
 * Generate a local SVG fallback icon based on domain name
 */
function generateLocalFallback(domain: string, size: number = 32): string {
  // Extract initials from domain
  const cleanDomain = domain.replace(/^www\./, "");
  const parts = cleanDomain.split(".");
  const mainPart = parts[0] || "X";
  const initials =
    mainPart.length >= 2
      ? mainPart.substring(0, 2).toUpperCase()
      : mainPart.substring(0, 1).toUpperCase();

  // Generate a consistent color based on domain
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];
  const colorIndex =
    domain.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  const backgroundColor = colors[colorIndex];

  // Create SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="6" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="${
        size * 0.4
      }" 
            font-weight="600" fill="white" text-anchor="middle" dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `.trim();

  // For browser environment, use btoa instead of Buffer
  if (typeof window !== "undefined") {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // For Node.js environment
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Get Google favicon (for backward compatibility and quick access)
 */
export function getGoogleFavicon(
  websiteUrl: string,
  size: number = 64
): string {
  const domain = extractDomain(websiteUrl);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 * Extract domain name from URL for display purposes
 * @param websiteUrl - The website URL
 * @returns The domain name without protocol
 */
export function getDomainFromUrl(websiteUrl: string): string {
  try {
    const url = new URL(normalizeUrl(websiteUrl));
    return url.hostname.replace("www.", "");
  } catch (error) {
    return websiteUrl;
  }
}

