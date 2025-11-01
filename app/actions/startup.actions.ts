"use server";

import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { fetchStripeMetrics } from "@/lib/stripe-client";
import type {
  CreateStartupInput,
  UpdateStartupInput,
  StartupWithMetrics,
  StartupFilters,
} from "@/types/startup";

/**
 * Fetch business information from Stripe using an API key
 */
export async function fetchStripeBusinessInfo(apiKey: string) {
  try {
    // Create a Stripe client with the provided API key
    const stripe = new Stripe(apiKey, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    });

    // Fetch account information
    const account = await stripe.accounts.retrieve();

    return {
      success: true,
      data: {
        name:
          account.business_profile?.name ||
          account.settings?.dashboard?.display_name ||
          "Unknown Business",
        description: account.business_profile?.support_url || null,
      },
    };
  } catch (error) {
    console.error("Error fetching Stripe business info:", error);
    return {
      success: false,
      error: "Invalid Stripe API key or insufficient permissions",
    };
  }
}

/**
 * Create a new startup
 */
export async function createStartup(input: CreateStartupInput) {
  try {
    // Fetch business info from Stripe
    const businessInfoResult = await fetchStripeBusinessInfo(input.apiKey);
    if (!businessInfoResult.success) {
      return {
        success: false,
        error: businessInfoResult.error || "Invalid Stripe API key",
      };
    }

    if (!businessInfoResult.data) {
      return {
        success: false,
        error: "Failed to fetch business information",
      };
    }

    const { name, description } = businessInfoResult.data;

    // Create startup with founders
    const startup = await prisma.startup.create({
      data: {
        name,
        description,
        apiKey: input.apiKey,
        website: input.website,
        founders: input.founders
          ? {
              create: input.founders.map((username) => ({
                x_username: username,
              })),
            }
          : undefined,
      },
      include: {
        founders: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
      data: startup,
    };
  } catch (error) {
    console.error("Error creating startup:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "This API key is already registered",
      };
    }

    return {
      success: false,
      error: "Failed to create startup",
    };
  }
}

/**
 * Get all startups with their Stripe metrics
 */
export async function getStartupsWithMetrics(
  filters?: StartupFilters
): Promise<StartupWithMetrics[]> {
  try {
    const startups = await prisma.startup.findMany({
      include: {
        founders: true,
      },
      orderBy:
        filters?.sortField === "createdAt"
          ? { createdAt: filters.sortOrder || "desc" }
          : filters?.sortField === "name"
          ? { name: filters.sortOrder || "asc" }
          : { createdAt: "desc" },
      where: filters?.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              {
                description: { contains: filters.search, mode: "insensitive" },
              },
              { website: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : undefined,
    });

    // Fetch metrics for all startups in parallel
    const startupsWithMetrics = await Promise.all(
      startups.map(async (startup) => {
        try {
          const metrics = await fetchStripeMetrics(startup.apiKey);
          return {
            ...startup,
            metrics,
            metricsError: metrics ? undefined : "Failed to fetch metrics",
          } as StartupWithMetrics;
        } catch (error) {
          return {
            ...startup,
            metrics: null,
            metricsError: "Failed to fetch metrics",
          } as StartupWithMetrics;
        }
      })
    );

    // Apply sorting by metrics if needed
    if (
      filters?.sortField &&
      ["mrr", "revenue", "customers"].includes(filters.sortField)
    ) {
      startupsWithMetrics.sort((a, b) => {
        const aValue =
          filters.sortField === "mrr"
            ? a.metrics?.monthlyRecurringRevenue || 0
            : filters.sortField === "revenue"
            ? a.metrics?.totalRevenue || 0
            : a.metrics?.totalCustomers || 0;

        const bValue =
          filters.sortField === "mrr"
            ? b.metrics?.monthlyRecurringRevenue || 0
            : filters.sortField === "revenue"
            ? b.metrics?.totalRevenue || 0
            : b.metrics?.totalCustomers || 0;

        return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    return startupsWithMetrics;
  } catch (error) {
    console.error("Error fetching startups:", error);
    return [];
  }
}

/**
 * Get a single startup by ID
 */
export async function getStartupById(id: string) {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id },
      include: {
        founders: true,
      },
    });

    if (!startup) {
      return { success: false, error: "Startup not found" };
    }

    return { success: true, data: startup };
  } catch (error) {
    console.error("Error fetching startup:", error);
    return { success: false, error: "Failed to fetch startup" };
  }
}

/**
 * Update a startup
 */
export async function updateStartup(input: UpdateStartupInput) {
  try {
    // If API key is being updated, validate it
    if (input.apiKey) {
      const metrics = await fetchStripeMetrics(input.apiKey);
      if (!metrics) {
        return {
          success: false,
          error: "Invalid Stripe API key or insufficient permissions",
        };
      }
    }

    const startup = await prisma.startup.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        apiKey: input.apiKey,
        website: input.website,
      },
      include: {
        founders: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
      data: startup,
    };
  } catch (error) {
    console.error("Error updating startup:", error);

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "This API key is already registered",
      };
    }

    return {
      success: false,
      error: "Failed to update startup",
    };
  }
}

/**
 * Delete a startup
 */
export async function deleteStartup(id: string) {
  try {
    await prisma.startup.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting startup:", error);
    return {
      success: false,
      error: "Failed to delete startup",
    };
  }
}

/**
 * Add a founder to a startup
 */
export async function addFounder(startupId: string, xUsername: string) {
  try {
    const founder = await prisma.founder.create({
      data: {
        x_username: xUsername,
        startupId,
      },
    });

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
      data: founder,
    };
  } catch (error) {
    console.error("Error adding founder:", error);
    return {
      success: false,
      error: "Failed to add founder",
    };
  }
}

/**
 * Remove a founder from a startup
 */
export async function removeFounder(founderId: string) {
  try {
    await prisma.founder.delete({
      where: { id: founderId },
    });

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error removing founder:", error);
    return {
      success: false,
      error: "Failed to remove founder",
    };
  }
}
