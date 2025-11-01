# Ads System Migration Guide

## Quick Start

Follow these steps to get the ads system up and running:

### 1. Apply Database Migration

```bash
# Generate and apply the migration
npx prisma migrate dev --name add_ads_model

# This will create the 'ads' table in your database
```

Or if you prefer to push directly without creating a migration file:

```bash
npx prisma db push
```

### 2. Regenerate Prisma Client

```bash
npx prisma generate
```

### 3. Verify the Setup

Check that everything is working:

```bash
# Open Prisma Studio to see the new Ad model
npx prisma studio
```

## What Was Changed

### New Files Created

1. **`/data/ad-spots.json`**

   - Configuration for 10 ad spots
   - Fallback data for active ads
   - Pricing and dimension information

2. **`/app/actions/ad.actions.ts`**

   - Server actions for ad management
   - CRUD operations for ads
   - Status updates and expiration handling

3. **`/docs/ADS_SYSTEM.md`**

   - Complete documentation
   - API reference
   - Usage examples

4. **`/docs/ADS_INTEGRATION_EXAMPLE.md`**
   - Code examples for integration
   - Stripe checkout setup
   - Cron job configuration

### Modified Files

1. **`/prisma/schema.prisma`**

   - Added `Ad` model
   - Added `ads` relation to `Startup` model

2. **`/components/ads/ads-right.tsx`**

   - Transformed from favorites list to ad spots display
   - Shows 10 ad spots with purchase buttons
   - Displays active ads with startup info

3. **`/lib/ads.ts`**
   - Updated to work with database
   - Added async functions for fetching ads
   - Kept JSON fallback for reliability

## Database Schema Changes

### New Table: `ads`

```sql
CREATE TABLE "ads" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "spotId" VARCHAR(255) NOT NULL,
  "startupId" TEXT NOT NULL,
  "tagline" VARCHAR(255),
  "stripePaymentId" VARCHAR(255),
  "stripeSessionId" VARCHAR(255),
  "status" VARCHAR(50) DEFAULT 'pending',
  "startsAt" TIMESTAMPTZ(3) NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "ads_startup_fkey" FOREIGN KEY ("startupId")
    REFERENCES "startups"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "ads_spotId_startupId_startsAt_key"
  ON "ads"("spotId", "startupId", "startsAt");

CREATE INDEX "ads_spotId_idx" ON "ads"("spotId");
CREATE INDEX "ads_startupId_idx" ON "ads"("startupId");
CREATE INDEX "ads_status_idx" ON "ads"("status");
CREATE INDEX "ads_expiresAt_idx" ON "ads"("expiresAt");
CREATE INDEX "ads_spotId_status_expiresAt_idx"
  ON "ads"("spotId", "status", "expiresAt");
```

### Updated Table: `startups`

- Added relation field `ads` (array of Ad objects)
- No schema changes required, just Prisma relation

## Testing the Migration

### 1. Create a Test Ad

```typescript
import { prisma } from "@/lib/prisma";

const testAd = await prisma.ad.create({
  data: {
    spotId: "right-hero",
    startupId: "your-startup-id", // Replace with actual startup ID
    tagline: "Test Advertisement",
    status: "active",
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
});

console.log("Created test ad:", testAd);
```

### 2. Query Ads

```typescript
import { getActiveAds } from "@/app/actions/ad.actions";

const ads = await getActiveAds();
console.log("Active ads:", ads);
```

### 3. Check Ad Display

Visit any page that uses the `AdsRight` component and verify:

- ✅ Available spots show "Buy This Spot" button
- ✅ Active ads show startup information
- ✅ Pricing and dimensions are correct
- ✅ Click handlers work (check console)

## Rollback (If Needed)

If you need to rollback the changes:

```bash
# Rollback the last migration
npx prisma migrate resolve --rolled-back add_ads_model

# Or manually drop the table
# psql your_database
# DROP TABLE ads;
```

## Environment Variables

Make sure you have these set up (especially for Stripe integration):

```env
# Database (should already be configured)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Stripe (required for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL (for Stripe redirects)
NEXT_PUBLIC_URL="http://localhost:3000"

# Cron job security (optional)
CRON_SECRET="your-random-secret"
```

## Next Steps

After migration, you'll want to:

1. **Set up Stripe Products**

   - Create products in Stripe dashboard
   - Update `stripePriceId` in `/data/ad-spots.json`

2. **Implement Checkout Flow**

   - Use examples from `ADS_INTEGRATION_EXAMPLE.md`
   - Test the full purchase flow

3. **Set up Webhooks**

   - Configure Stripe webhook endpoint
   - Test payment confirmation flow

4. **Schedule Cron Job**

   - Set up automatic ad expiration
   - Monitor expired ads

5. **Add to Your Pages**
   - Integrate `AdsRight` component
   - Test different ad positions

## Troubleshooting

### Migration Fails

```bash
# Reset the database (WARNING: loses all data)
npx prisma migrate reset

# Or fix manually and retry
npx prisma migrate dev
```

### Ads Not Showing

1. Check database connection
2. Verify ad status is "active"
3. Check expiration dates
4. Look at server console for errors
5. Fallback to JSON should work automatically

### Type Errors

```bash
# Regenerate Prisma types
npx prisma generate

# Restart TypeScript server in your IDE
```

## Support

For issues or questions:

1. Check the documentation in `/docs/ADS_SYSTEM.md`
2. Review examples in `/docs/ADS_INTEGRATION_EXAMPLE.md`
3. Inspect the code in `/app/actions/ad.actions.ts`
4. Check types in `/types/ads.ts`

## Summary

✅ **Database**: New `Ad` model added
✅ **Backend**: Complete CRUD operations via server actions
✅ **Frontend**: Updated component to show 10 ad spots
✅ **Config**: JSON file with spot definitions
✅ **Types**: Full TypeScript support
✅ **Docs**: Complete documentation and examples

The ads system is now ready to use! Start by displaying the component, then implement the purchase flow with Stripe.
