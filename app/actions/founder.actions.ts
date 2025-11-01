"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fetchXUserProfile, fetchMultipleXUserProfiles } from "@/lib/x-api";

/**
 * Sync founder profile image from X API
 */
export async function syncFounderProfile(founderId: string) {
  try {
    const founder = await prisma.founder.findUnique({
      where: { id: founderId },
    });

    if (!founder) {
      return {
        success: false,
        error: "Founder not found",
      };
    }

    // Fetch latest profile data from X
    const profile = await fetchXUserProfile(founder.x_username);

    if (!profile) {
      return {
        success: false,
        error: "Failed to fetch X profile",
      };
    }

    // Update founder with latest profile data
    const updatedFounder = await prisma.founder.update({
      where: { id: founderId },
      data: {
        profileImageUrl: profile.profileImageUrl,
        displayName: profile.displayName,
      },
    });

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
      data: updatedFounder,
    };
  } catch (error) {
    console.error("Error syncing founder profile:", error);
    return {
      success: false,
      error: "Failed to sync profile",
    };
  }
}

/**
 * Sync all founder profiles for a startup
 */
export async function syncStartupFounders(startupId: string) {
  try {
    const founders = await prisma.founder.findMany({
      where: { startupId },
    });

    if (founders.length === 0) {
      return {
        success: true,
        message: "No founders to sync",
      };
    }

    // Fetch all profiles in parallel
    const usernames = founders.map((f) => f.x_username);
    const profiles = await fetchMultipleXUserProfiles(usernames);

    // Update all founders
    const updatePromises = founders.map((founder) => {
      const profile = profiles.get(founder.x_username.toLowerCase());
      if (!profile) return null;

      return prisma.founder.update({
        where: { id: founder.id },
        data: {
          profileImageUrl: profile.profileImageUrl,
          displayName: profile.displayName,
        },
      });
    });

    await Promise.all(updatePromises.filter((p) => p !== null));

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
      message: `Synced ${founders.length} founder(s)`,
    };
  } catch (error) {
    console.error("Error syncing startup founders:", error);
    return {
      success: false,
      error: "Failed to sync founders",
    };
  }
}

/**
 * Sync all founder profiles in the database
 */
export async function syncAllFounders() {
  try {
    const founders = await prisma.founder.findMany();

    if (founders.length === 0) {
      return {
        success: true,
        message: "No founders to sync",
      };
    }

    // Fetch all profiles in parallel
    const usernames = founders.map((f) => f.x_username);
    const profiles = await fetchMultipleXUserProfiles(usernames);

    // Update all founders
    const updatePromises = founders.map((founder) => {
      const profile = profiles.get(founder.x_username.toLowerCase());
      if (!profile) return null;

      return prisma.founder.update({
        where: { id: founder.id },
        data: {
          profileImageUrl: profile.profileImageUrl,
          displayName: profile.displayName,
        },
      });
    });

    const results = await Promise.allSettled(
      updatePromises.filter((p) => p !== null)
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    revalidatePath("/");
    revalidatePath("/startups");

    return {
      success: true,
      message: `Synced ${successCount} of ${founders.length} founder(s)`,
    };
  } catch (error) {
    console.error("Error syncing all founders:", error);
    return {
      success: false,
      error: "Failed to sync founders",
    };
  }
}
