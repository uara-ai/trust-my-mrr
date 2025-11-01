import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getCurrentAdPrice, getDynamicPricingConfig } from "@/lib/ads";

export async function POST(request: NextRequest) {
  try {
    const { spotId } = await request.json();

    if (!spotId) {
      return NextResponse.json(
        { error: "Missing required field: spotId" },
        { status: 400 }
      );
    }

    // Get current dynamic price
    const currentPrice = await getCurrentAdPrice();
    const config = getDynamicPricingConfig();

    // Get the base URL from the request or environment
    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Create Stripe checkout session with dynamic pricing
    // Using price_data to create a one-time price for this checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "TrustMyMRR Ad Spot",
              description: `Ad spot placement for ${spotId}`,
            },
            unit_amount: currentPrice * 100, // Stripe expects cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true, // Enable discount/promo codes at checkout
      // Success URL: Stripe only supports {CHECKOUT_SESSION_ID} substitution
      // All other data (customer_id, subscription_id, etc.) must be fetched
      // using the session_id from Stripe API or webhook
      success_url: `${baseUrl}?ad_purchase=success&session_id={CHECKOUT_SESSION_ID}&spot_id=${spotId}&price=${currentPrice}`,
      cancel_url: `${baseUrl}?ad_purchase=cancelled&spot_id=${spotId}`,
      // Metadata is crucial: it's returned in webhooks and when fetching the session
      // This is how we'll link the payment to the correct ad spot and get all needed data
      metadata: {
        spotId,
        price: currentPrice.toString(),
        type: "ad_purchase",
        dynamicPricing: "true",
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
          stripePriceId: `dynamic_${currentPrice}`, // Store the price used
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
      price: currentPrice,
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
