# Stripe Webhook Setup for Ad Subscriptions

This guide explains how to set up and test Stripe webhooks for managing ad subscription payments.

## Overview

The webhook system handles the complete subscription lifecycle:

- **Initial payment**: Creates subscription when checkout completes
- **Recurring payments**: Extends ad period on successful monthly payments
- **Failed payments**: Marks ads as payment_failed when billing fails
- **Cancellations**: Updates ad status when subscriptions are cancelled
- **Updates**: Syncs subscription changes from Stripe to database

## Environment Variables

Add the following to your `.env` file:

```bash
# Required: Your Stripe secret key
STRIPE_SECRET_KEY=sk_test_...

# Required: Webhook signing secret from Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: Your public URL for webhook endpoint
NEXT_PUBLIC_URL=https://yourdomain.com
```

## Database Migration

Run the Prisma migration to add the new subscription fields:

```bash
npx prisma migrate dev --name add_subscription_fields
```

Or generate the migration without applying:

```bash
npx prisma migrate dev --create-only --name add_subscription_fields
```

## Setting Up the Webhook in Stripe

### 1. Local Development (using Stripe CLI)

Install the Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
# Login to Stripe
stripe login

# Forward webhook events to your local server
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret (starts with `whsec_`). Add it to your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Production Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the webhook signing secret and add it to your environment variables

## How It Works

### Payment Flow

1. **User initiates checkout** → Creates pending ad with session ID
2. **Checkout completes** → Webhook receives `checkout.session.completed`
   - Ad is updated with subscription ID, customer ID
   - Status remains "pending" until user selects startup
3. **User selects startup** → Ad status changes to "active"
4. **Monthly renewal** → Webhook receives `invoice.payment_succeeded`
   - Ad period is extended by 1 month
   - expiresAt is updated

### Subscription Events

#### checkout.session.completed

- Updates ad with Stripe subscription ID and customer ID
- Keeps status as "pending" until startup is selected

#### customer.subscription.created

- Updates subscription status and period dates

#### customer.subscription.updated

- Syncs subscription status changes
- Updates period dates
- Handles cancel_at_period_end changes

#### customer.subscription.deleted

- Sets ad status to "cancelled"
- Updates subscription status to "canceled"

#### invoice.payment_succeeded

- Extends ad period on successful recurring payment
- Sets status to "active"
- Updates expiresAt to new period end

#### invoice.payment_failed

- Sets ad status to "payment_failed"
- Sets subscription status to "past_due"
- Can trigger notification to user

## Testing

### Test with Stripe CLI

```bash
# Trigger a checkout.session.completed event
stripe trigger checkout.session.completed

# Trigger a payment succeeded event
stripe trigger invoice.payment_succeeded

# Trigger a payment failed event
stripe trigger invoice.payment_failed
```

### Manual Testing

1. Create a test ad purchase using test card: `4242 4242 4242 4242`
2. Complete the checkout
3. Check your server logs to see webhook events being processed
4. Verify the ad record in your database has subscription info

### Verify Webhook Signature

The webhook endpoint automatically verifies signatures using the `STRIPE_WEBHOOK_SECRET`. If verification fails, the request is rejected with a 400 error.

## Subscription Management Functions

The following server actions are available:

```typescript
// Cancel subscription at period end (user keeps access until period ends)
cancelAd(adId: string)

// Cancel subscription immediately
cancelAdImmediately(adId: string)

// Reactivate a cancelled subscription (before period ends)
reactivateAdSubscription(adId: string)

// Get current subscription details
getAdSubscriptionDetails(adId: string)

// Update ad tagline
updateAdTagline({ adId, tagline })
```

## Database Schema

New fields added to the `Ad` model:

```prisma
stripeSubscriptionId   String?  @unique  // Stripe subscription ID
stripeCustomerId       String?           // Stripe customer ID
stripePriceId          String?           // Stripe price ID used
subscriptionStatus     String?           // Stripe subscription status
currentPeriodStart     DateTime?         // Current billing period start
currentPeriodEnd       DateTime?         // Current billing period end
cancelAtPeriodEnd      Boolean           // Whether sub is set to cancel
```

## Monitoring

### Logs

Webhook events are logged to console:

- Each event type received
- Processing results
- Any errors

Check your server logs to monitor webhook processing.

### Stripe Dashboard

View webhook events in Stripe Dashboard → Developers → Webhooks → View logs

## Troubleshooting

### Webhook signature verification failed

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check that you're using the secret for the correct Stripe account (test vs live)
- Ensure the secret matches the endpoint (CLI secret for local, dashboard secret for production)

### Events not being received

- Verify webhook endpoint URL is correct in Stripe dashboard
- Check that your server is accessible from the internet (for production)
- Use Stripe CLI for local testing
- Check server logs for any errors

### Subscription not updating in database

- Check webhook event logs in Stripe dashboard
- Verify the event was sent and received successfully
- Check server logs for any processing errors
- Verify database connection is working

## Security

- Webhook signature verification is required for all requests
- Endpoint rejects requests without valid signature
- Uses Stripe's official verification method
- Webhook secret should be kept secure and never committed to code

## Next Steps

After setting up webhooks, consider:

1. Adding email notifications for payment failures
2. Implementing retry logic for failed webhooks
3. Adding monitoring/alerting for webhook failures
4. Creating admin dashboard to view subscription status
5. Adding customer portal for subscription management
