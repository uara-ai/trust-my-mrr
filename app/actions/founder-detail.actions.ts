"use server";

import { prisma } from "@/lib/prisma";
import { fetchStripeMetrics } from "@/lib/stripe-client";
import { getLast30DaysRevenue } from "@/app/actions/startup-detail.actions";
import type { StartupMetrics } from "@/types/startup";

export interface FounderWithStartups {
  id: string;
  x_username: string;
  profileImageUrl?: string | null;
  displayName?: string | null;
  startups: Array<{
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    logo?: string | null;
    website?: string | null;
    apiKey: string;
    metrics?: StartupMetrics | null;
  }>;
}

export interface FounderAggregatedMetrics {
  totalRevenue: number;
  last30DaysRevenue: number;
  totalMRR: number;
  totalCustomers: number;
  startupsCount: number;
  currency: string;
}

/**
 * Get founder by X username with all their startups and metrics
 */
export async function getFounderByUsername(username: string) {
  try {
    // Find founder by username (case-insensitive)
    const founder = await prisma.founder.findFirst({
      where: {
        x_username: {
          equals: username,
          mode: "insensitive",
        },
      },
      include: {
        startup: true,
      },
    });

    if (!founder) {
      return {
        success: false,
        error: "Founder not found",
      };
    }

    // Get all startups where this founder is a founder
    const allStartupsForFounder = await prisma.startup.findMany({
      where: {
        founders: {
          some: {
            x_username: {
              equals: username,
              mode: "insensitive",
            },
          },
        },
      },
      include: {
        founders: true,
      },
    });

    // Fetch metrics for each startup
    const startupsWithMetrics = await Promise.all(
      allStartupsForFounder.map(async (startup) => {
        try {
          const metrics = await fetchStripeMetrics(startup.apiKey);
          return {
            ...startup,
            metrics,
          };
        } catch (error) {
          console.error(`Error fetching metrics for ${startup.name}:`, error);
          return {
            ...startup,
            metrics: null,
          };
        }
      })
    );

    const founderData: FounderWithStartups = {
      id: founder.id,
      x_username: founder.x_username,
      profileImageUrl: founder.profileImageUrl,
      displayName: founder.displayName,
      startups: startupsWithMetrics.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        logo: s.logo,
        website: s.website,
        apiKey: s.apiKey,
        metrics: s.metrics,
      })),
    };

    return {
      success: true,
      data: founderData,
    };
  } catch (error) {
    console.error("Error fetching founder:", error);
    return {
      success: false,
      error: "Failed to fetch founder data",
    };
  }
}

/**
 * Get aggregated metrics for a founder across all their startups
 */
export async function getFounderAggregatedMetrics(
  username: string
): Promise<FounderAggregatedMetrics> {
  const founderResult = await getFounderByUsername(username);

  if (!founderResult.success || !founderResult.data) {
    return {
      totalRevenue: 0,
      last30DaysRevenue: 0,
      totalMRR: 0,
      totalCustomers: 0,
      startupsCount: 0,
      currency: "usd",
    };
  }

  const founder = founderResult.data;
  const startups = founder.startups.filter((s) => s.metrics);

  // Aggregate metrics across all startups
  const aggregated = startups.reduce(
    (acc, startup) => {
      if (startup.metrics) {
        acc.totalRevenue += startup.metrics.totalRevenue;
        acc.totalMRR += startup.metrics.monthlyRecurringRevenue;
        acc.totalCustomers += startup.metrics.totalCustomers;
        // Use first startup's currency
        if (!acc.currency) {
          acc.currency = startup.metrics.currency;
        }
      }
      return acc;
    },
    {
      totalRevenue: 0,
      last30DaysRevenue: 0,
      totalMRR: 0,
      totalCustomers: 0,
      currency: "",
    }
  );

  // Calculate last 30 days revenue for all startups
  let last30DaysTotal = 0;
  for (const startup of startups) {
    if (startup.apiKey) {
      try {
        const last30Days = await getLast30DaysRevenue(startup.apiKey);
        last30DaysTotal += last30Days;
      } catch (error) {
        console.error(
          `Error fetching last 30 days for ${startup.name}:`,
          error
        );
      }
    }
  }

  return {
    totalRevenue: aggregated.totalRevenue,
    last30DaysRevenue: last30DaysTotal,
    totalMRR: aggregated.totalMRR,
    totalCustomers: aggregated.totalCustomers,
    startupsCount: startups.length,
    currency: aggregated.currency || "usd",
  };
}
