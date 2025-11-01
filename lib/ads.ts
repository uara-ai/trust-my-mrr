import { AdSpot, AdContent, AdCardData } from "@/types/ads";
import adData from "@/data/ad-spots.json";
import { getActiveAds } from "@/app/actions/ad.actions";

export function getAdSpots(): AdSpot[] {
  return adData.adSpots as AdSpot[];
}

export function getActiveAdsFromJSON(): AdContent[] {
  return adData.activeAds.map((ad) => ({
    ...ad,
    expiresAt: new Date(ad.expiresAt),
  })) as AdContent[];
}

/**
 * Get all active ads (from database if available, fallback to JSON)
 */
export async function getActiveAdsData(): Promise<AdContent[]> {
  try {
    // Try to get from database first
    const dbAds = await getActiveAds();
    if (dbAds && dbAds.length > 0) {
      return dbAds;
    }
  } catch (error) {
    console.error(
      "Failed to fetch ads from database, using JSON fallback:",
      error
    );
  }

  // Fallback to JSON data
  return getActiveAdsFromJSON();
}

/**
 * Get ads by position with their active content
 */
export async function getAdsByPosition(
  position: "top" | "right" | "bottom" | "left"
): Promise<AdCardData[]> {
  const spots = getAdSpots().filter((spot) => spot.position === position);
  const activeAds = await getActiveAdsData();

  return spots.map((spot) => {
    const content = activeAds.find(
      (ad) => ad.spotId === spot.id && ad.isActive && ad.expiresAt > new Date()
    );

    return {
      spot,
      content: content || null,
    };
  });
}

/**
 * Get all ads grouped by position
 */
export async function getAllAdsGrouped() {
  const [top, right, bottom, left] = await Promise.all([
    getAdsByPosition("top"),
    getAdsByPosition("right"),
    getAdsByPosition("bottom"),
    getAdsByPosition("left"),
  ]);

  return {
    top,
    right,
    bottom,
    left,
  };
}

/**
 * Get available ad spots (spots without active ads)
 */
export async function getAvailableAdSpots(): Promise<AdSpot[]> {
  const allSpots = getAdSpots();
  const activeAds = await getActiveAdsData();

  return allSpots.filter((spot) => {
    const hasActiveAd = activeAds.some(
      (ad) => ad.spotId === spot.id && ad.isActive && ad.expiresAt > new Date()
    );
    return !hasActiveAd;
  });
}

/**
 * Check if a specific ad spot is available
 */
export async function isAdSpotAvailable(spotId: string): Promise<boolean> {
  const activeAds = await getActiveAdsData();
  const now = new Date();

  const hasActiveAd = activeAds.some(
    (ad) => ad.spotId === spotId && ad.isActive && ad.expiresAt > now
  );

  return !hasActiveAd;
}

/**
 * Get ad spot by ID
 */
export function getAdSpotById(spotId: string): AdSpot | undefined {
  return getAdSpots().find((spot) => spot.id === spotId);
}
