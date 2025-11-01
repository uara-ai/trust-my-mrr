# Ads Integration Examples

## Example 1: Basic Page with Ads Sidebar

```typescript
// app/some-page/page.tsx
import { AdsRight } from "@/components/ads/ads-right";
import { getAdsByPosition } from "@/lib/ads";

export default async function SomePage() {
  // Fetch ads for right sidebar
  const rightAds = await getAdsByPosition("right");

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <main className="flex-1">
        <h1>Your Content Here</h1>
        {/* ... */}
      </main>

      {/* Ads sidebar */}
      <aside className="w-80">
        <AdsRight ads={rightAds} />
      </aside>
    </div>
  );
}
```

## Example 2: Using with Sidebar Component

```typescript
// app/layout.tsx or similar
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { AdsRight } from "@/components/ads/ads-right";
import { getAdsByPosition } from "@/lib/ads";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rightAds = await getAdsByPosition("right");

  return (
    <SidebarProvider>
      <div className="flex w-full">
        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Right sidebar with ads */}
        <Sidebar side="right">
          <SidebarContent>
            <AdsRight ads={rightAds} />
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}
```

## Example 3: Ad Purchase Button Component

```typescript
// components/buy-ad-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { createAdPurchase } from "@/app/actions/ad.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BuyAdButtonProps {
  spotId: string;
  price: number;
  startupId: string;
  onSuccess?: () => void;
}

export function BuyAdButton({
  spotId,
  price,
  startupId,
  onSuccess,
}: BuyAdButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, first create a Stripe checkout session
      // const session = await createStripeCheckoutSession({ spotId, startupId, price });

      // For now, directly create the ad purchase
      const result = await createAdPurchase({
        spotId,
        startupId,
        tagline: "Your startup tagline",
        durationMonths: 1,
      });

      if (result.success) {
        toast.success("Ad spot purchased successfully!");
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to purchase ad spot");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("An error occurred during purchase");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePurchase} disabled={isLoading}>
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isLoading ? "Processing..." : `Buy for $${price}/mo`}
    </Button>
  );
}
```

## Example 4: Ad Management Dashboard for Startups

```typescript
// app/dashboard/ads/page.tsx
import { getStartupAds } from "@/app/actions/ad.actions";
import { getAdSpotById } from "@/lib/ads";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MyAdsPage({
  params,
}: {
  params: { startupId: string };
}) {
  const result = await getStartupAds(params.startupId);

  if (!result.success || !result.ads) {
    return <div>Failed to load ads</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Ad Campaigns</h1>

      <div className="grid gap-4">
        {result.ads.map((ad) => {
          const spot = getAdSpotById(ad.spotId);

          return (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{spot?.id || ad.spotId}</CardTitle>
                  <Badge
                    variant={
                      ad.status === "active"
                        ? "default"
                        : ad.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {ad.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Tagline:</strong> {ad.tagline || "None"}
                  </p>
                  <p>
                    <strong>Started:</strong>{" "}
                    {new Date(ad.startsAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Expires:</strong>{" "}
                    {new Date(ad.expiresAt).toLocaleDateString()}
                  </p>
                  {spot && (
                    <>
                      <p>
                        <strong>Size:</strong> {spot.dimensions.width} ×{" "}
                        {spot.dimensions.height}
                      </p>
                      <p>
                        <strong>Price:</strong> ${spot.price}/month
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {result.ads.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active ad campaigns yet. Start promoting your startup!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

## Example 5: Stripe Checkout Integration

```typescript
// app/api/checkout/ad/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdPurchase } from "@/app/actions/ad.actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const { spotId, startupId, tagline, durationMonths } = await request.json();

    // Get spot details to get price
    const spots = await import("@/data/ad-spots.json");
    const spot = spots.adSpots.find((s: any) => s.id === spotId);

    if (!spot) {
      return NextResponse.json({ error: "Ad spot not found" }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: \`Ad Spot: \${spot.id}\`,
              description: \`\${spot.size} ad spot (\${spot.dimensions.width} × \${spot.dimensions.height})\`,
            },
            unit_amount: spot.price * 100, // Convert to cents
            recurring: {
              interval: "month",
              interval_count: durationMonths || 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: \`\${process.env.NEXT_PUBLIC_URL}/ads/success?session_id={CHECKOUT_SESSION_ID}\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/ads/cancel\`,
      metadata: {
        spotId,
        startupId,
        tagline: tagline || "",
        durationMonths: durationMonths || 1,
      },
    });

    // Create pending ad purchase
    await createAdPurchase({
      spotId,
      startupId,
      tagline,
      durationMonths: durationMonths || 1,
      stripeSessionId: session.id,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

## Example 6: Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateAdStatus } from "@/app/actions/ad.actions";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Find the ad by session ID
      const ad = await prisma.ad.findFirst({
        where: { stripeSessionId: session.id },
      });

      if (ad) {
        // Update ad status to active
        await updateAdStatus({
          adId: ad.id,
          status: "active",
          stripePaymentId: session.payment_intent as string,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      // Find and cancel the ad
      const ad = await prisma.ad.findFirst({
        where: { stripePaymentId: subscription.id },
      });

      if (ad) {
        await updateAdStatus({
          adId: ad.id,
          status: "cancelled",
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

## Example 7: Cron Job to Expire Old Ads

```typescript
// app/api/cron/expire-ads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateExpiredAds } from "@/app/actions/ad.actions";

export async function GET(request: NextRequest) {
  // Verify cron secret (for security)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await updateExpiredAds();

    return NextResponse.json({
      success: true,
      message: \`Updated \${result.updatedCount} expired ads\`,
    });
  } catch (error) {
    console.error("Failed to update expired ads:", error);
    return NextResponse.json(
      { error: "Failed to update expired ads" },
      { status: 500 }
    );
  }
}
```

Configure in Vercel Cron (vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-ads",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## Testing the System

### 1. Test Ad Display

```bash
# Start your dev server
npm run dev

# Navigate to a page with ads
# Verify ads are displaying correctly
```

### 2. Test Ad Purchase (without Stripe)

```typescript
// In your browser console or test file
const result = await fetch("/api/test-ad-purchase", {
  method: "POST",
  body: JSON.stringify({
    spotId: "right-hero",
    startupId: "your-startup-id",
    tagline: "Test tagline",
  }),
});
```

### 3. Run Database Migration

```bash
# Create migration
npx prisma migrate dev --name add_ads_model

# Check database
npx prisma studio
```
