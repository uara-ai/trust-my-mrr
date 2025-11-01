# Ads System Documentation

## Overview

The ads system allows startups to purchase advertising spots on the platform. Each ad spot has different dimensions, positions, and pricing tiers.

## Features

- **10 Different Ad Spots**: Ranging from small ($79/month) to large ($499/month)
- **Database-backed**: All ad purchases are stored in PostgreSQL via Prisma
- **Stripe Integration Ready**: Each spot has a `stripePriceId` for payment processing
- **Automatic Expiration**: Ads automatically expire after their purchase period
- **Startup Attribution**: Each ad is linked to a startup in the database

## Ad Spot Types

| Spot ID          | Size   | Dimensions | Price/Month | Position |
| ---------------- | ------ | ---------- | ----------- | -------- |
| right-hero       | large  | 300×600px  | $499        | right    |
| right-featured   | large  | 300×400px  | $399        | right    |
| right-premium    | medium | 300×300px  | $299        | right    |
| right-standard-1 | medium | 300×250px  | $199        | right    |
| right-standard-2 | medium | 300×250px  | $199        | right    |
| right-compact-1  | small  | 300×200px  | $149        | right    |
| right-compact-2  | small  | 300×200px  | $149        | right    |
| right-mini-1     | small  | 300×150px  | $99         | right    |
| right-mini-2     | small  | 300×150px  | $99         | right    |
| right-footer     | small  | 300×120px  | $79         | right    |

## Database Schema

### Ad Model

```prisma
model Ad {
  id                String   @id @default(cuid())
  spotId            String   // Reference to ad spot in JSON config
  startupId         String   // Foreign key to Startup
  startup           Startup  @relation(...)
  tagline           String?  // Optional custom tagline
  stripePaymentId   String?  // Stripe payment confirmation
  stripeSessionId   String?  // Stripe checkout session
  status            String   @default("pending") // pending, active, expired, cancelled
  startsAt          DateTime
  expiresAt         DateTime
  createdAt         DateTime
  updatedAt         DateTime
}
```

## Usage

### 1. Display Ad Spots in a Component

```typescript
import { AdsRight } from "@/components/ads/ads-right";
import { getAdsByPosition } from "@/lib/ads";

export default async function Page() {
  const rightAds = await getAdsByPosition("right");

  return <AdsRight ads={rightAds} />;
}
```

### 2. Purchase an Ad Spot (Server Action)

```typescript
import { createAdPurchase } from "@/app/actions/ad.actions";

const result = await createAdPurchase({
  spotId: "right-hero",
  startupId: "startup-id",
  tagline: "Your custom tagline here",
  durationMonths: 1,
  stripeSessionId: "session-id-from-stripe",
});
```

### 3. Update Ad Status (After Payment)

```typescript
import { updateAdStatus } from "@/app/actions/ad.actions";

await updateAdStatus({
  adId: "ad-id",
  status: "active",
  stripePaymentId: "payment-id-from-stripe",
});
```

### 4. Get Active Ads

```typescript
import { getActiveAds } from "@/app/actions/ad.actions";

const activeAds = await getActiveAds();
```

### 5. Check Spot Availability

```typescript
import { isAdSpotAvailable } from "@/lib/ads";

const available = await isAdSpotAvailable("right-hero");
```

## File Structure

```
/data
  └── ad-spots.json           # Ad spot configuration and fallback data

/app/actions
  └── ad.actions.ts           # Server actions for ad management

/components/ads
  └── ads-right.tsx           # Ad display component

/lib
  └── ads.ts                  # Ad utility functions

/types
  └── ads.ts                  # TypeScript types

/prisma
  └── schema.prisma           # Database schema (includes Ad model)
```

## API Actions

### Server Actions (`app/actions/ad.actions.ts`)

- `getActiveAds()` - Get all active ads
- `getActiveAdForSpot(spotId)` - Get active ad for specific spot
- `createAdPurchase(params)` - Create new ad purchase
- `updateAdStatus(params)` - Update ad status
- `getStartupAds(startupId)` - Get all ads for a startup
- `cancelAd(adId)` - Cancel an ad
- `updateExpiredAds()` - Expire old ads (cron job)

### Utility Functions (`lib/ads.ts`)

- `getAdSpots()` - Get all ad spot configurations
- `getAdsByPosition(position)` - Get ads for specific position
- `getAllAdsGrouped()` - Get all ads grouped by position
- `getAvailableAdSpots()` - Get spots without active ads
- `isAdSpotAvailable(spotId)` - Check if spot is available
- `getAdSpotById(spotId)` - Get spot configuration by ID

## Workflow

### Purchase Flow

1. User browses available ad spots
2. User selects a spot and clicks "Buy This Spot"
3. System creates Stripe checkout session
4. User completes payment
5. Webhook confirms payment → ad status set to "active"
6. Ad displays on the site until expiration

### Display Logic

```typescript
// Available spot
if (!content) {
  // Show "Buy This Spot" button with price and dimensions
}

// Active ad
if (content) {
  // Show startup info: logo, name, tagline, description
  // Show "Visit Website" button
}
```

## Migration

To apply the database changes:

```bash
# Generate Prisma migration
npx prisma migrate dev --name add_ads_model

# Or push directly to database
npx prisma db push
```

## Future Enhancements

- [ ] Stripe checkout integration
- [ ] Ad analytics (clicks, impressions)
- [ ] Multi-month discounts
- [ ] Ad preview before purchase
- [ ] Email notifications for expiring ads
- [ ] Admin dashboard for ad management
- [ ] A/B testing for ad positions
- [ ] Custom ad dimensions
- [ ] Rotating ads (multiple ads per spot)

## Configuration

Ad spot configuration is stored in `/data/ad-spots.json`:

```json
{
  "adSpots": [...],
  "activeAds": [...]
}
```

This file serves as:

1. Configuration for available ad spots
2. Fallback data if database is unavailable
3. Reference for dimensions and pricing

## Notes

- All prices are in USD per month
- Ads automatically expire based on `expiresAt` date
- Run `updateExpiredAds()` as a cron job to keep statuses current
- Each startup can have multiple active ads across different spots
- Spots can be overlapping in time but not for the same spot
