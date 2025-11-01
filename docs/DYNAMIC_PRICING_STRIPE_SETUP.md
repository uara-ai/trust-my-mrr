# Dynamic Pricing Stripe Setup Guide

This guide walks you through setting up the dynamic pricing system for TrustMyMRR ad spots in Stripe. The system automatically increases the price after each ad purchase, starting from $99/month and going up to $1,499/month.

## Overview

The dynamic pricing system uses Stripe's `price_data` parameter to create ad-hoc subscription prices for each checkout session. This means:

- **No manual price creation needed** - Prices are generated programmatically
- **Single product approach** - All ads use the same Stripe product
- **Automatic price increases** - Price increases by $100 after each completed sale
- **Simple management** - No need to manage multiple price IDs in Stripe

## How It Works

1. Customer clicks on an available ad spot
2. System calculates current price based on total ads sold
3. Checkout session is created with dynamic price
4. After successful payment, the ad count increases
5. Next purchase will use the new higher price

**Pricing Formula:**

```
Current Price = Start Price + (Total Sold Ads × Price Increment)
Capped at: Max Price
```

**Default Configuration:**

- Start Price: $99/month
- Price Increment: $100
- Max Price: $1,499/month

## Stripe Dashboard Setup

### Step 1: Create the Product (One-Time Setup)

1. **Log into Stripe Dashboard**

   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Navigate to **Products** → **Add Product**

2. **Configure Product Details**

   - **Name:** `TrustMyMRR Ad Spot`
   - **Description:** `Monthly recurring ad spot placement on TrustMyMRR`
   - **Statement descriptor:** `TRUSTMYMRR AD` (max 22 characters, appears on customer's credit card statement)
   - **Unit label:** Leave blank or use `spot`

3. **Important: DO NOT create any prices**

   - Skip the pricing section
   - Prices will be created dynamically by your application
   - Click **Save product**

4. **Copy the Product ID**
   - After saving, you'll see the product ID (starts with `prod_`)
   - You don't actually need this ID for the current implementation, but keep it for reference
   - Example: `prod_ABC123xyz`

### Step 2: Configure API Keys

1. **Get Your API Keys**

   - In Stripe Dashboard, go to **Developers** → **API keys**
   - You'll see two types of keys:
     - **Publishable key** (starts with `pk_`)
     - **Secret key** (starts with `sk_`)

2. **For Testing (Test Mode)**

   - Use test mode keys (will have `_test_` in them)
   - Test cards: `4242 4242 4242 4242` (Visa)
   - Any future date for expiry, any 3-digit CVC

3. **For Production (Live Mode)**
   - Toggle to "Live mode" in Stripe Dashboard
   - Copy the live keys
   - **IMPORTANT:** Never commit secret keys to your repository

### Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production

# Application URL (for Stripe redirects)
NEXT_PUBLIC_URL=http://localhost:3000 # or your production URL

# Database (if not already configured)
DATABASE_URL="your-database-connection-string"
DIRECT_URL="your-direct-database-connection-string"
```

### Step 4: Webhook Setup (Recommended)

Webhooks allow Stripe to notify your application when subscription events occur (renewals, cancellations, payment failures).

1. **Create Webhook Endpoint**

   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - For local testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli) or [ngrok](https://ngrok.com)

2. **Select Events to Listen For**

   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Get Webhook Secret**

   - After creating the webhook, copy the signing secret (starts with `whsec_`)
   - Add to `.env.local`:

   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Test Webhook (Development)**

   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login to Stripe
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Configuration Files

### Update Pricing Configuration (Optional)

Edit `/data/ad-spots.json` to customize pricing:

```json
{
  "dynamicPricing": {
    "enabled": true,
    "startPrice": 99, // Starting price in USD
    "maxPrice": 1499, // Maximum price cap in USD
    "priceIncrement": 100, // Amount to increase per sale
    "singleStripePriceId": "price_dynamic_ad_spot" // Reference ID (not used in Stripe, but kept for consistency)
  },
  "adSpots": [
    // ... ad spots configuration
  ]
}
```

**Customization Examples:**

1. **Conservative Growth** (slower price increase):

```json
{
  "startPrice": 49,
  "maxPrice": 999,
  "priceIncrement": 50
}
```

2. **Aggressive Growth** (faster price increase):

```json
{
  "startPrice": 199,
  "maxPrice": 2999,
  "priceIncrement": 200
}
```

3. **Flat Pricing** (disable dynamic pricing):

```json
{
  "enabled": false,
  "startPrice": 299,
  "maxPrice": 299,
  "priceIncrement": 0
}
```

## Testing the Integration

### Test Mode Checklist

1. **Verify Environment Variables**

   ```bash
   # Check .env.local exists with test keys
   cat .env.local | grep STRIPE
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Test Ad Purchase Flow**

   - Navigate to your application homepage
   - Click on an available ad spot
   - You should see the current price (e.g., "$99/mo")
   - Click to purchase
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

4. **Verify Price Increase**

   - After successful purchase, check Stripe Dashboard → Customers
   - Complete the ad setup (select startup, tagline)
   - Refresh the homepage
   - Check that the next available ad spot shows increased price

5. **Check Stripe Dashboard**
   - **Customers:** Verify customer was created
   - **Subscriptions:** Verify subscription is active
   - **Payments:** Verify payment succeeded
   - Look for the dynamic price (should match current price at time of purchase)

### Common Test Scenarios

1. **Test Successful Payment**

   - Card: `4242 4242 4242 4242`
   - Result: Payment succeeds, subscription created

2. **Test Declined Card**

   - Card: `4000 0000 0000 0002`
   - Result: Payment fails, show error to user

3. **Test Authentication Required**

   - Card: `4000 0025 0000 3155`
   - Result: 3D Secure authentication flow

4. **Test Subscription Cancellation**
   - Create a subscription in test mode
   - Cancel it via your application
   - Verify status updates in Stripe Dashboard

## Production Deployment

### Pre-Launch Checklist

- [ ] Switch to Stripe Live mode keys in production environment
- [ ] Update `NEXT_PUBLIC_URL` to production domain
- [ ] Configure production webhook endpoint
- [ ] Test complete purchase flow in production
- [ ] Verify email receipts are sent to customers
- [ ] Test subscription cancellation flow
- [ ] Set up monitoring/alerts for failed payments
- [ ] Review Stripe Dashboard settings:
  - [ ] Business name and support email
  - [ ] Customer emails enabled
  - [ ] Branding/logo uploaded
  - [ ] Tax settings (if applicable)

### Go-Live Steps

1. **Activate Stripe Account**

   - Complete Stripe account activation
   - Provide business details
   - Add bank account for payouts

2. **Update Environment Variables**

   ```bash
   # Production environment (.env.production or hosting platform)
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... # production webhook secret
   NEXT_PUBLIC_URL=https://trustmymrr.com
   ```

3. **Deploy Application**

   ```bash
   # Build for production
   npm run build

   # Deploy to your hosting platform
   # (Vercel, Railway, AWS, etc.)
   ```

4. **Verify Production Webhook**

   - Send test webhook from Stripe Dashboard
   - Check application logs for webhook received
   - Verify webhook signature validation works

5. **Test with Real Card (Small Amount)**
   - Use your own card to test
   - Complete full purchase flow
   - Verify funds appear in Stripe balance
   - Cancel subscription if it was just a test

## Monitoring and Maintenance

### Important Metrics to Monitor

1. **Successful Checkouts**

   - Track conversion rate from click to purchase
   - Monitor in Stripe Dashboard → Payments

2. **Failed Payments**

   - Set up email alerts for failed payments
   - Configure automatic retry logic (Stripe Smart Retries)

3. **Subscription Churn**

   - Monitor cancellation rate
   - Track reasons for cancellation

4. **Pricing Analytics**
   - Current price point
   - Number of ads sold at each price tier
   - Revenue growth over time

### Stripe Dashboard Views

1. **Overview** - Daily revenue and customer count
2. **Payments** - All successful/failed payments
3. **Customers** - Customer list and subscription status
4. **Subscriptions** - Active, past_due, cancelled
5. **Radar** - Fraud detection and prevention

## Troubleshooting

### Issue: "No such price: price_dynamic_ad_spot"

**Solution:** This error should NOT occur with the new dynamic pricing system since we use `price_data` instead of price IDs. If you see this error:

- Check that you're using the updated checkout route (`/app/api/checkout/ad/route.ts`)
- Verify the route is using `price_data` parameter, not `price` parameter

### Issue: Checkout session shows wrong price

**Solution:**

1. Check current ad count in database:
   ```sql
   SELECT COUNT(*) FROM ads WHERE status IN ('active', 'expired');
   ```
2. Verify pricing calculation in `/lib/ads.ts` → `getCurrentAdPrice()`
3. Clear application cache and reload

### Issue: Webhook not receiving events

**Solution:**

1. Verify webhook URL is correct in Stripe Dashboard
2. Check webhook signing secret in environment variables
3. Test webhook endpoint manually:
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type": "ping"}'
   ```
4. Check application logs for webhook errors
5. For local development, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Issue: Customer sees incorrect price after payment

**Solution:**

- The price is locked at checkout time
- Customer pays the price shown when they clicked "Purchase"
- Even if price increases during checkout, they pay original price
- Price increase only affects subsequent purchases

### Issue: Subscription not created after payment

**Solution:**

1. Check Stripe Dashboard → Payments for the transaction
2. Look for errors in application logs
3. Verify webhook handler is processing `checkout.session.completed` event
4. Check database for pending ad record
5. Manually complete ad record if needed:
   ```sql
   UPDATE ads
   SET status = 'active'
   WHERE stripe_session_id = 'cs_...';
   ```

## Advanced Configuration

### Custom Pricing Tiers

If you want non-linear pricing (e.g., first 10 ads at $99, next 10 at $149):

```typescript
// lib/ads.ts - Custom pricing logic
export async function getCurrentAdPrice(): Promise<number> {
  const config = getDynamicPricingConfig();
  const totalSoldAds = await prisma.ad.count({
    where: { status: { in: ["active", "expired"] } },
  });

  // Custom tier logic
  if (totalSoldAds < 10) return 99;
  if (totalSoldAds < 20) return 149;
  if (totalSoldAds < 30) return 249;
  return Math.min(499, config.maxPrice);
}
```

### Seasonal Pricing

Temporarily adjust pricing for promotions:

```typescript
export async function getCurrentAdPrice(): Promise<number> {
  const config = getDynamicPricingConfig();
  let basePrice = config.startPrice;

  // Black Friday sale
  const now = new Date();
  if (now.getMonth() === 10 && now.getDate() >= 24) {
    // November 24+
    basePrice = basePrice * 0.5; // 50% off
  }

  const totalSoldAds = await prisma.ad.count({
    where: { status: { in: ["active", "expired"] } },
  });

  const calculatedPrice = basePrice + totalSoldAds * config.priceIncrement;
  return Math.min(calculatedPrice, config.maxPrice);
}
```

### Discount Codes

To implement discount codes, update the checkout route:

```typescript
// app/api/checkout/ad/route.ts
const session = await stripe.checkout.sessions.create({
  // ... other config
  discounts: [
    {
      coupon: "LAUNCH50", // Create coupon in Stripe Dashboard first
    },
  ],
  allow_promotion_codes: true, // Allow customers to enter codes
});
```

## Support and Resources

### Official Documentation

- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

### TrustMyMRR Documentation

- [Environment Setup](./ENV_SETUP.md)
- [Webhook Setup](./STRIPE_WEBHOOK_SETUP.md)
- [Ads System Overview](./ADS_SYSTEM.md)

### Getting Help

- Stripe Support: [https://support.stripe.com](https://support.stripe.com)
- Stripe Discord: [https://stripe.com/discord](https://stripe.com/discord)
- Project Issues: Create an issue in your repository

## Summary

✅ **What You've Accomplished:**

- Dynamic pricing system that automatically increases prices
- No manual price management in Stripe
- Flexible configuration via JSON
- Scalable from $99 to $1,499/month
- Simple to test and deploy

🎯 **Key Takeaways:**

1. Only ONE product needed in Stripe
2. Prices are created dynamically per checkout
3. Price increases automatically after each sale
4. Configuration is centralized in `ad-spots.json`
5. System is fully automated - no manual intervention needed

🚀 **Next Steps:**

1. Test thoroughly in Stripe test mode
2. Configure webhooks for production
3. Monitor pricing progression
4. Adjust pricing formula based on demand
5. Consider adding analytics dashboard

---

**Last Updated:** November 1, 2025
**Version:** 1.0
**Maintainer:** TrustMyMRR Team
