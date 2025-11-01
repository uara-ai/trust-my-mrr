import { NextResponse } from "next/server";
import { getStripeBusinessData } from "@/services/stripe-data.service";

// Enable caching with 1 hour revalidation
export const revalidate = 3600; // Cache for 1 hour (3600 seconds)

// Enable dynamic rendering for API routes
export const dynamic = "force-dynamic";

/**
 * GET /api/stripe-data
 *
 * Fetches comprehensive business data from Stripe including:
 * - Business name, logo, and URL
 * - Monthly Recurring Revenue (MRR)
 * - Total number of customers
 * - Total revenue from all charges
 *
 * This endpoint uses Next.js caching with 1-hour revalidation for optimal performance.
 * Data is cached and refreshed every hour to balance freshness with API efficiency.
 *
 * @returns {StripeBusinessData} JSON response with business metrics
 */
export async function GET() {
  try {
    // Fetch all Stripe data (this will be cached by Next.js)
    const data = await getStripeBusinessData();

    return NextResponse.json(
      {
        success: true,
        data,
        cached: true,
        cacheExpiresIn: "1 hour",
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=3600",
          "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Stripe data",
        timestamp: new Date().toISOString(),
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
