import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { spotId, stripePriceId } = await request.json();

    if (!spotId || !stripePriceId) {
      return NextResponse.json(
        { error: "Missing required fields: spotId or stripePriceId" },
        { status: 400 }
      );
    }

    // Get the base URL from the request or environment
    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Create Stripe checkout session using existing price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}?ad_purchase=success&session_id={CHECKOUT_SESSION_ID}&spot_id=${spotId}`,
      cancel_url: `${baseUrl}?ad_purchase=cancelled`,
      metadata: {
        spotId,
        type: "ad_purchase",
      },
    });

    // Create a temporary pending ad (will be updated with startup after payment)
    // Use a temporary startup ID - we'll update this after the user selects their startup
    const tempStartup = await prisma.startup.findFirst({
      select: { id: true },
    });

    if (tempStartup) {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1); // Default 1 month

      await prisma.ad.create({
        data: {
          spotId,
          startupId: tempStartup.id, // Temporary - will be updated
          stripeSessionId: session.id,
          status: "pending",
          startsAt: now,
          expiresAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
