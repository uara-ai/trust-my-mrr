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
      // Success URL: Stripe only supports {CHECKOUT_SESSION_ID} substitution
      // All other data (customer_id, subscription_id, etc.) must be fetched
      // using the session_id from Stripe API or webhook
      success_url: `${baseUrl}?ad_purchase=success&session_id={CHECKOUT_SESSION_ID}&spot_id=${spotId}&price_id=${stripePriceId}`,
      cancel_url: `${baseUrl}?ad_purchase=cancelled&spot_id=${spotId}`,
      // Metadata is crucial: it's returned in webhooks and when fetching the session
      // This is how we'll link the payment to the correct ad spot and get all needed data
      metadata: {
        spotId,
        stripePriceId,
        type: "ad_purchase",
        // The session will contain: customer_id, subscription_id, payment_intent
        // which are needed to populate the Ad model fields:
        // - stripeCustomerId
        // - stripeSubscriptionId
        // - stripePaymentId
        // - currentPeriodStart
        // - currentPeriodEnd
        // - subscriptionStatus
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
          stripePriceId: stripePriceId,
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
