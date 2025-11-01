"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AdContent } from "@/types/ads";

/**
 * Get all active ads
 */
export async function getActiveAds(): Promise<AdContent[]> {
  try {
    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: {
        status: "active",
        expiresAt: {
          gt: now,
        },
      },
      include: {
        startup: {
          include: {
            founders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ads.map((ad) => ({
      id: ad.id,
      spotId: ad.spotId,
      startup: {
        name: ad.startup.name,
        logo: ad.startup.logo || undefined,
        website: ad.startup.website || "",
        description: ad.startup.description || "",
        tagline: ad.tagline || undefined,
      },
      expiresAt: ad.expiresAt,
      isActive: ad.status === "active" && ad.expiresAt > now,
    }));
  } catch (error) {
    console.error("Failed to fetch active ads:", error);
    return [];
  }
}

/**
 * Get active ad for a specific spot
 */
export async function getActiveAdForSpot(
  spotId: string
): Promise<AdContent | null> {
  try {
    const now = new Date();
    const ad = await prisma.ad.findFirst({
      where: {
        spotId,
        status: "active",
        expiresAt: {
          gt: now,
        },
      },
      include: {
        startup: {
          include: {
            founders: true,
          },
        },
      },
      orderBy: {
        expiresAt: "desc",
      },
    });

    if (!ad) return null;

    return {
      id: ad.id,
      spotId: ad.spotId,
      startup: {
        name: ad.startup.name,
        logo: ad.startup.logo || undefined,
        website: ad.startup.website || "",
        description: ad.startup.description || "",
        tagline: ad.tagline || undefined,
      },
      expiresAt: ad.expiresAt,
      isActive: ad.status === "active" && ad.expiresAt > now,
    };
  } catch (error) {
    console.error("Failed to fetch ad for spot:", error);
    return null;
  }
}

/**
 * Create a new ad purchase
 */
export async function createAdPurchase({
  spotId,
  startupId,
  tagline,
  durationMonths = 1,
  stripeSessionId,
}: {
  spotId: string;
  startupId: string;
  tagline?: string;
  durationMonths?: number;
  stripeSessionId?: string;
}) {
  try {
    // Calculate start and end dates
    const now = new Date();
    const startsAt = now;
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    // Check if spot is already taken for this period
    const existingAd = await prisma.ad.findFirst({
      where: {
        spotId,
        status: "active",
        OR: [
          {
            AND: [
              { startsAt: { lte: startsAt } },
              { expiresAt: { gte: startsAt } },
            ],
          },
          {
            AND: [
              { startsAt: { lte: expiresAt } },
              { expiresAt: { gte: expiresAt } },
            ],
          },
        ],
      },
    });

    if (existingAd) {
      return {
        success: false,
        error: "This ad spot is already taken for the selected period",
      };
    }

    // Create the ad
    const ad = await prisma.ad.create({
      data: {
        spotId,
        startupId,
        tagline,
        stripeSessionId,
        status: "pending", // Will be updated to active after payment confirmation
        startsAt,
        expiresAt,
      },
      include: {
        startup: true,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      ad,
    };
  } catch (error) {
    console.error("Failed to create ad purchase:", error);
    return {
      success: false,
      error: "Failed to create ad purchase",
    };
  }
}

/**
 * Update ad status (e.g., after payment confirmation)
 */
export async function updateAdStatus({
  adId,
  status,
  stripePaymentId,
}: {
  adId: string;
  status: "pending" | "active" | "expired" | "cancelled";
  stripePaymentId?: string;
}) {
  try {
    const ad = await prisma.ad.update({
      where: { id: adId },
      data: {
        status,
        ...(stripePaymentId && { stripePaymentId }),
      },
      include: {
        startup: true,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      ad,
    };
  } catch (error) {
    console.error("Failed to update ad status:", error);
    return {
      success: false,
      error: "Failed to update ad status",
    };
  }
}

/**
 * Get ads for a specific startup
 */
export async function getStartupAds(startupId: string) {
  try {
    const ads = await prisma.ad.findMany({
      where: {
        startupId,
      },
      include: {
        startup: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      ads,
    };
  } catch (error) {
    console.error("Failed to fetch startup ads:", error);
    return {
      success: false,
      error: "Failed to fetch ads",
      ads: [],
    };
  }
}

/**
 * Cancel an ad
 */
export async function cancelAd(adId: string) {
  try {
    const ad = await prisma.ad.update({
      where: { id: adId },
      data: {
        status: "cancelled",
      },
    });

    revalidatePath("/");

    return {
      success: true,
      ad,
    };
  } catch (error) {
    console.error("Failed to cancel ad:", error);
    return {
      success: false,
      error: "Failed to cancel ad",
    };
  }
}

/**
 * Check and update expired ads (should be run as a cron job)
 */
export async function updateExpiredAds() {
  try {
    const now = new Date();
    const result = await prisma.ad.updateMany({
      where: {
        status: "active",
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: "expired",
      },
    });

    revalidatePath("/");

    return {
      success: true,
      updatedCount: result.count,
    };
  } catch (error) {
    console.error("Failed to update expired ads:", error);
    return {
      success: false,
      error: "Failed to update expired ads",
    };
  }
}
