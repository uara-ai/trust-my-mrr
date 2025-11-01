import { NextRequest, NextResponse } from "next/server";
import { fetchXUserProfile, fetchMultipleXUserProfiles } from "@/lib/x-api";

// Enable caching with 1 day revalidation
export const revalidate = 86400; // 24 hours in seconds

export const dynamic = "force-dynamic";

/**
 * GET /api/x-profile?username=handle
 * or
 * GET /api/x-profile?usernames=handle1,handle2,handle3
 *
 * Fetches X/Twitter user profile(s) with caching
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");
    const usernames = searchParams.get("usernames");

    // Handle single username request
    if (username) {
      const profile = await fetchXUserProfile(username);

      if (!profile) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found or API error",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: profile,
          cached: true,
          cacheDuration: "24 hours",
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=172800",
            "CDN-Cache-Control": "public, s-maxage=86400",
          },
        }
      );
    }

    // Handle multiple usernames request
    if (usernames) {
      const usernameList = usernames.split(",").map((u) => u.trim());

      if (usernameList.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No usernames provided",
          },
          { status: 400 }
        );
      }

      const profiles = await fetchMultipleXUserProfiles(usernameList);

      // Convert Map to object for JSON response
      const profilesObj: Record<string, any> = {};
      profiles.forEach((value, key) => {
        profilesObj[key] = value;
      });

      return NextResponse.json(
        {
          success: true,
          data: profilesObj,
          count: profiles.size,
          cached: true,
          cacheDuration: "24 hours",
        },
        {
          status: 200,
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=172800",
            "CDN-Cache-Control": "public, s-maxage=86400",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Missing username or usernames parameter",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
