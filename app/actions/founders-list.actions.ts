"use server";

import { prisma } from "@/lib/prisma";

export interface FounderWithStartupCount {
  id: string;
  x_username: string;
  profileImageUrl?: string | null;
  displayName?: string | null;
  startupsCount: number;
}

/**
 * Get all founders with their startup count
 */
export async function getAllFounders(): Promise<FounderWithStartupCount[]> {
  try {
    const founders = await prisma.founder.findMany({
      include: {
        startup: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        displayName: "asc",
      },
    });

    // Group by x_username (case-insensitive) and count unique startups
    const founderMap = new Map<string, FounderWithStartupCount>();

    for (const founder of founders) {
      const usernameKey = founder.x_username.toLowerCase();

      if (founderMap.has(usernameKey)) {
        const existing = founderMap.get(usernameKey)!;
        // Add this startup to the count if it's not already counted
        existing.startupsCount += 1;
      } else {
        founderMap.set(usernameKey, {
          id: founder.id,
          x_username: founder.x_username,
          profileImageUrl: founder.profileImageUrl,
          displayName: founder.displayName,
          startupsCount: 1,
        });
      }
    }

    // Convert map to array and sort by display name or username
    return Array.from(founderMap.values()).sort((a, b) => {
      const nameA = (a.displayName || a.x_username).toLowerCase();
      const nameB = (b.displayName || b.x_username).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    console.error("Error fetching founders:", error);
    return [];
  }
}
