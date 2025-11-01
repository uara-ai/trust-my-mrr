import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

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
      success_url: `${baseUrl}?ad_purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}?ad_purchase=cancelled`,
      metadata: {
        spotId,
        type: "ad_purchase",
      },
    });

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
