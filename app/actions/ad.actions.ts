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
 * Cancel an ad and its Stripe subscription
 */
export async function cancelAd(adId: string) {
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return {
        success: false,
        error: "Ad not found",
      };
    }

    // Cancel the Stripe subscription if it exists
    if (ad.stripeSubscriptionId) {
      const { stripe } = await import("@/lib/stripe");
      try {
        await stripe.subscriptions.update(ad.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } catch (stripeError) {
        console.error("Failed to cancel Stripe subscription:", stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }

    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: {
        cancelAtPeriodEnd: true,
        status: "cancelled",
      },
    });

    revalidatePath("/");

    return {
      success: true,
      ad: updatedAd,
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
 * Immediately cancel an ad subscription (don't wait for period end)
 */
export async function cancelAdImmediately(adId: string) {
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
    });

    if (!ad) {
      return {
        success: false,
        error: "Ad not found",
      };
    }

    // Cancel the Stripe subscription immediately
    if (ad.stripeSubscriptionId) {
      const { stripe } = await import("@/lib/stripe");
      try {
        await stripe.subscriptions.cancel(ad.stripeSubscriptionId);
      } catch (stripeError) {
        console.error("Failed to cancel Stripe subscription:", stripeError);
        return {
          success: false,
          error: "Failed to cancel subscription with Stripe",
        };
      }
    }

    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: {
        status: "cancelled",
        subscriptionStatus: "canceled",
      },
    });

    revalidatePath("/");

    return {
      success: true,
      ad: updatedAd,
    };
  } catch (error) {
    console.error("Failed to cancel ad immediately:", error);
    return {
      success: false,
      error: "Failed to cancel ad",
    };
  }
}

/**
 * Reactivate a cancelled subscription (before period ends)
 */
export async function reactivateAdSubscription(adId: string) {
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
    });

    if (!ad || !ad.stripeSubscriptionId) {
      return {
        success: false,
        error: "Ad or subscription not found",
      };
    }

    if (!ad.cancelAtPeriodEnd) {
      return {
        success: false,
        error: "Subscription is not scheduled for cancellation",
      };
    }

    // Reactivate the Stripe subscription
    const { stripe } = await import("@/lib/stripe");
    try {
      await stripe.subscriptions.update(ad.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (stripeError) {
      console.error("Failed to reactivate Stripe subscription:", stripeError);
      return {
        success: false,
        error: "Failed to reactivate subscription with Stripe",
      };
    }

    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: {
        cancelAtPeriodEnd: false,
        status: "active",
        subscriptionStatus: "active",
      },
    });

    revalidatePath("/");

    return {
      success: true,
      ad: updatedAd,
    };
  } catch (error) {
    console.error("Failed to reactivate subscription:", error);
    return {
      success: false,
      error: "Failed to reactivate subscription",
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

/**
 * Get ad by Stripe session ID
 */
export async function getAdBySessionId(sessionId: string) {
  try {
    const ad = await prisma.ad.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
      include: {
        startup: true,
      },
    });

    if (!ad) {
      return {
        success: false,
        error: "Ad not found",
      };
    }

    return {
      success: true,
      ad,
    };
  } catch (error) {
    console.error("Failed to fetch ad by session ID:", error);
    return {
      success: false,
      error: "Failed to fetch ad",
    };
  }
}

/**
 * Update ad with startup and tagline (after successful payment)
 * Also fetches and stores all Stripe data from the session
 */
export async function updateAdWithStartup({
  sessionId,
  startupId,
  tagline,
}: {
  sessionId: string;
  startupId: string;
  tagline?: string;
}) {
  try {
    // Find the ad by stripe session ID
    const existingAd = await prisma.ad.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
    });

    if (!existingAd) {
      return {
        success: false,
        error: "Ad not found for this session",
      };
    }

    // Fetch Stripe session data to get customer ID, subscription ID, etc.
    const { stripe } = await import("@/lib/stripe");

    let stripeData: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      stripePaymentId?: string;
      subscriptionStatus?: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
      cancelAtPeriodEnd?: boolean;
    } = {};

    try {
      // Fetch the checkout session
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      console.log("Stripe session retrieved:", {
        customer: session.customer,
        subscription: session.subscription,
        payment_intent: session.payment_intent,
      });

      if (session.customer) {
        stripeData.stripeCustomerId = session.customer as string;
      }
      if (session.subscription) {
        stripeData.stripeSubscriptionId = session.subscription as string;
      }
      if (session.payment_intent) {
        stripeData.stripePaymentId = session.payment_intent as string;
      }

      // Fetch subscription details if subscription exists
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        console.log("Stripe subscription retrieved:", {
          status: subscription.status,
          current_period_start: (subscription as any).current_period_start,
          current_period_end: (subscription as any).current_period_end,
          cancel_at_period_end: (subscription as any).cancel_at_period_end,
        });

        stripeData.subscriptionStatus = subscription.status;

        // Safely extract subscription period dates
        const subData = subscription as any;
        if (
          subData.current_period_start &&
          typeof subData.current_period_start === "number"
        ) {
          stripeData.currentPeriodStart = new Date(
            subData.current_period_start * 1000
          );
        }
        if (
          subData.current_period_end &&
          typeof subData.current_period_end === "number"
        ) {
          stripeData.currentPeriodEnd = new Date(
            subData.current_period_end * 1000
          );
        }
        if (typeof subData.cancel_at_period_end === "boolean") {
          stripeData.cancelAtPeriodEnd = subData.cancel_at_period_end;
        }
      }

      console.log("Final stripeData to be saved:", stripeData);
    } catch (stripeError) {
      console.error("Failed to fetch Stripe data:", stripeError);
      // Continue with update even if Stripe fetch fails
      // The webhook will update this data later
    }

    // Update the ad with startup info, tagline, and all Stripe data
    // Filter out undefined values from stripeData
    const updateData: any = {
      startupId,
      tagline,
      status: "active",
    };

    // Only add Stripe fields if they have valid values
    if (stripeData.stripeCustomerId) {
      updateData.stripeCustomerId = stripeData.stripeCustomerId;
    }
    if (stripeData.stripeSubscriptionId) {
      updateData.stripeSubscriptionId = stripeData.stripeSubscriptionId;
    }
    if (stripeData.stripePaymentId) {
      updateData.stripePaymentId = stripeData.stripePaymentId;
    }
    if (stripeData.subscriptionStatus) {
      updateData.subscriptionStatus = stripeData.subscriptionStatus;
    }
    if (
      stripeData.currentPeriodStart instanceof Date &&
      !isNaN(stripeData.currentPeriodStart.getTime())
    ) {
      updateData.currentPeriodStart = stripeData.currentPeriodStart;
    }
    if (
      stripeData.currentPeriodEnd instanceof Date &&
      !isNaN(stripeData.currentPeriodEnd.getTime())
    ) {
      updateData.currentPeriodEnd = stripeData.currentPeriodEnd;
    }
    if (typeof stripeData.cancelAtPeriodEnd === "boolean") {
      updateData.cancelAtPeriodEnd = stripeData.cancelAtPeriodEnd;
    }

    console.log("Final update data:", updateData);

    const ad = await prisma.ad.update({
      where: { id: existingAd.id },
      data: updateData,
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
    console.error("Failed to update ad with startup:", error);
    return {
      success: false,
      error: "Failed to update ad",
    };
  }
}

/**
 * Get all startups (basic info only for selection)
 */
export async function getAllStartupsForSelection() {
  try {
    const startups = await prisma.startup.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        website: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      startups,
    };
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    return {
      success: false,
      error: "Failed to fetch startups",
      startups: [],
    };
  }
}

/**
 * Get subscription details for an ad
 */
export async function getAdSubscriptionDetails(adId: string) {
  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        startup: true,
      },
    });

    if (!ad || !ad.stripeSubscriptionId) {
      return {
        success: false,
        error: "Ad or subscription not found",
      };
    }
  } catch (error) {
    console.error("Failed to get subscription details:", error);
    return {
      success: false,
      error: "Failed to get subscription details",
    };
  }
}

/**
 * Update ad tagline
 */
export async function updateAdTagline({
  adId,
  tagline,
}: {
  adId: string;
  tagline: string;
}) {
  try {
    const ad = await prisma.ad.update({
      where: { id: adId },
      data: { tagline },
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
    console.error("Failed to update tagline:", error);
    return {
      success: false,
      error: "Failed to update tagline",
    };
  }
}
