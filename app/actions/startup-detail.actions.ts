"use server";

import { unstable_cache } from "next/cache";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { fetchStripeMetrics } from "@/lib/stripe-client";

export interface StartupDetailMetrics {
  totalRevenue: number;
  last30DaysRevenue: number;
  monthlyRecurringRevenue: number;
  totalCustomers: number;
  currency: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  mrr: number;
}

/**
 * Get startup by slug with cached query (1 hour)
 */
const getCachedStartupBySlug = unstable_cache(
  async (slug: string) => {
    return await prisma.startup.findUnique({
      where: { slug },
      include: {
        founders: {
          select: {
            id: true,
            x_username: true,
            profileImageUrl: true,
            displayName: true,
          },
        },
      },
    });
  },
  ["startup-by-slug"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["startup-detail"],
  }
);

/**
 * Get startup by slug with metrics
 */
export async function getStartupBySlug(slug: string) {
  try {
    const startup = await getCachedStartupBySlug(slug);

    if (!startup) {
      return {
        success: false,
        error: "Startup not found",
      };
    }

    // Fetch current metrics
    const metrics = await fetchStripeMetrics(startup.apiKey);

    return {
      success: true,
      data: {
        ...startup,
        metrics,
      },
    };
  } catch (error) {
    console.error("Error fetching startup by slug:", error);
    return {
      success: false,
      error: "Failed to fetch startup",
    };
  }
}

/**
 * Fetch detailed revenue data from Stripe for charts
 */
export async function getStartupRevenueData(
  slug: string,
  timeRange: "7d" | "14d" | "30d" | "all" = "30d"
) {
  try {
    const startup = await prisma.startup.findUnique({
      where: { slug },
      select: {
        apiKey: true,
        createdAt: true,
      },
    });

    if (!startup) {
      return {
        success: false,
        error: "Startup not found",
      };
    }

    const stripe = new Stripe(startup.apiKey, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    });

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "14d":
        startDate.setDate(endDate.getDate() - 14);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "all":
        startDate = startup.createdAt;
        break;
    }

    // Fetch charges for revenue data
    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
    });

    // Fetch subscriptions for MRR data
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: "active",
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
      },
    });

    // Group charges by date
    const revenueByDate: Record<string, number> = {};
    charges.data.forEach((charge) => {
      if (charge.status === "succeeded" && charge.amount > 0) {
        const date = new Date(charge.created * 1000)
          .toISOString()
          .split("T")[0];
        revenueByDate[date] = (revenueByDate[date] || 0) + charge.amount / 100;
      }
    });

    // Calculate MRR per day
    let currentMRR = 0;
    subscriptions.data.forEach((sub) => {
      if (sub.items.data.length > 0) {
        sub.items.data.forEach((item) => {
          const amount = item.price.unit_amount || 0;
          const interval = item.price.recurring?.interval;

          if (interval === "month") {
            currentMRR += amount / 100;
          } else if (interval === "year") {
            currentMRR += amount / 100 / 12;
          }
        });
      }
    });

    // Generate daily data points
    const dataPoints: RevenueDataPoint[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      dataPoints.push({
        date: dateStr,
        revenue: revenueByDate[dateStr] || 0,
        mrr: currentMRR,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get currency from first charge or default to USD
    const currency =
      charges.data.length > 0 ? charges.data[0].currency.toUpperCase() : "USD";

    return {
      success: true,
      data: {
        dataPoints,
        currency,
      },
    };
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return {
      success: false,
      error: "Failed to fetch revenue data",
    };
  }
}

/**
 * Get last 30 days revenue
 */
export async function getLast30DaysRevenue(apiKey: string) {
  try {
    const stripe = new Stripe(apiKey, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: Math.floor(thirtyDaysAgo.getTime() / 1000),
      },
    });

    let totalRevenue = 0;
    charges.data.forEach((charge) => {
      if (charge.status === "succeeded" && charge.amount > 0) {
        totalRevenue += charge.amount / 100;
      }
    });

    return totalRevenue;
  } catch (error) {
    console.error("Error fetching last 30 days revenue:", error);
    return 0;
  }
}
