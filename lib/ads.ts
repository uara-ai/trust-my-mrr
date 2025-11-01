import {
  AdSpot,
  AdContent,
  AdCardData,
  AdSpotWithPrice,
  DynamicPricing,
} from "@/types/ads";
import adData from "@/data/ad-spots.json";
import { getActiveAds } from "@/app/actions/ad.actions";
import { prisma } from "@/lib/prisma";

/**
 * Get dynamic pricing configuration
 */
export function getDynamicPricingConfig(): DynamicPricing {
  return (adData as any).dynamicPricing as DynamicPricing;
}

/**
 * Calculate current price based on number of ads sold
 */
export async function getCurrentAdPrice(): Promise<number> {
  const config = getDynamicPricingConfig();

  if (!config.enabled) {
    return config.startPrice;
  }

  // Count total completed/active ad purchases (not pending or cancelled)
  const totalSoldAds = await prisma.ad.count({
    where: {
      status: {
        in: ["active", "expired"],
      },
    },
  });

  // Calculate price based on sold ads
  const calculatedPrice =
    config.startPrice + totalSoldAds * config.priceIncrement;

  // Cap at max price
  return Math.min(calculatedPrice, config.maxPrice);
}

/**
 * Get next price (after current purchase)
 */
export async function getNextAdPrice(): Promise<number> {
  const config = getDynamicPricingConfig();
  const currentPrice = await getCurrentAdPrice();

  if (!config.enabled) {
    return config.startPrice;
  }

  const nextPrice = currentPrice + config.priceIncrement;
  return Math.min(nextPrice, config.maxPrice);
}

export function getAdSpots(): AdSpot[] {
  return adData.adSpots as AdSpot[];
}

/**
 * Get ad spots with current dynamic pricing
 */
export async function getAdSpotsWithPrice(): Promise<AdSpotWithPrice[]> {
  const spots = getAdSpots();
  const currentPrice = await getCurrentAdPrice();
  const config = getDynamicPricingConfig();

  return spots.map((spot) => ({
    ...spot,
    price: currentPrice,
    stripePriceId: config.singleStripePriceId,
  }));
}

/**
 * Get all active ads from database
 */
export async function getActiveAdsData(): Promise<AdContent[]> {
  try {
    // Get from database
    const dbAds = await getActiveAds();
    return dbAds;
  } catch (error) {
    console.error("Failed to fetch ads from database:", error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get ads by position
 */
export async function getAdsByPosition(
  position: "top" | "right" | "bottom" | "left"
): Promise<AdCardData[]> {
  try {
    const spotsWithPrice = await getAdSpotsWithPrice();
    const spots = spotsWithPrice.filter((spot) => spot.position === position);
    const activeAds = await getActiveAdsData();

    console.log(`[Ads] Fetching ads for position: ${position}`);
    console.log(`[Ads] Total spots for ${position}:`, spots.length);
    console.log(`[Ads] Total active ads:`, activeAds.length);

    const result = spots.map((spot) => {
      const now = new Date();
      const content = activeAds.find(
        (ad) => ad.spotId === spot.id && ad.isActive && ad.expiresAt > now
      );

      if (content) {
        console.log(`[Ads] Found active ad for spot ${spot.id}:`, {
          startup: content.startup.name,
          expiresAt: content.expiresAt,
        });
      }

      return {
        spot,
        content: content || null,
      };
    });

    console.log(
      `[Ads] Returning ${
        result.filter((r) => r.content).length
      } active ads for ${position}`
    );

    return result;
  } catch (error) {
    console.error(`[Ads] Error fetching ads for position ${position}:`, error);
    // Return empty spots on error
    const spotsWithPrice = await getAdSpotsWithPrice();
    const spots = spotsWithPrice.filter((spot) => spot.position === position);
    return spots.map((spot) => ({
      spot,
      content: null,
    }));
  }
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
export async function getAvailableAdSpots(): Promise<AdSpotWithPrice[]> {
  const allSpots = await getAdSpotsWithPrice();
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

/**
 * Get ad spot by ID with current price
 */
export async function getAdSpotByIdWithPrice(
  spotId: string
): Promise<AdSpotWithPrice | undefined> {
  const spots = await getAdSpotsWithPrice();
  return spots.find((spot) => spot.id === spotId);
}
