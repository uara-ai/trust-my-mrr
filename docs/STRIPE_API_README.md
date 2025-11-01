# Stripe Data API Documentation

## Overview

This API fetches comprehensive business data from Stripe, including:

- **Business Name**: The name of your business as configured in Stripe
- **Business Logo**: URL to your business logo (if configured)
- **Business URL**: Your business website URL
- **Monthly Recurring Revenue (MRR)**: Calculated from all active subscriptions
- **Total Customers**: Count of all customers in your Stripe account
- **Total Revenue**: Sum of all successful charges

## Features

✅ **Efficient Caching**: Data is cached for 1 hour to minimize API calls  
✅ **Automatic Revalidation**: Cache refreshes every hour automatically  
✅ **Parallel Processing**: All Stripe API calls run in parallel for optimal performance  
✅ **Pagination Handling**: Automatically handles large datasets with pagination  
✅ **Error Handling**: Graceful error handling with detailed logging  
✅ **TypeScript**: Full type safety with TypeScript definitions

## Setup Instructions

### 1. Create Restricted Stripe API Key

Create a restricted Stripe API key with the following permissions:

**[Click here to create the API key with correct permissions](https://dashboard.stripe.com/apikeys/create?name=TrustMRR&permissions%5B%5D=rak_charge_read&permissions%5B%5D=rak_subscription_read&permissions%5B%5D=rak_bucket_connect_read&permissions%5B%5D=rak_file_read)**

Required permissions:

- `rak_charge_read` - Read charges
- `rak_subscription_read` - Read subscriptions
- `rak_bucket_connect_read` - Read account information
- `rak_file_read` - Read files (for logo)

### 2. Add API Key to Environment Variables

Create a `.env.local` file in the root of your project:

```bash
STRIPE_SECRET_KEY=rk_live_YOUR_RESTRICTED_KEY_HERE
```

⚠️ **Important**: Never commit your API key to version control!

### 3. Start the Development Server

```bash
npm run dev
# or
bun dev
```

## API Endpoint

### `GET /api/stripe-data`

Fetches all business metrics from Stripe.

#### Response Format

```json
{
  "success": true,
  "data": {
    "businessName": "Your Business Name",
    "businessLogo": "https://files.stripe.com/...",
    "businessUrl": "https://yourbusiness.com",
    "monthlyRecurringRevenue": 12500.0,
    "totalCustomers": 150,
    "totalRevenue": 250000.0,
    "currency": "usd",
    "lastUpdated": "2025-11-01T12:00:00.000Z"
  },
  "cached": true,
  "cacheExpiresIn": "1 hour"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
async function getStripeData() {
  try {
    const response = await fetch("/api/stripe-data");
    const result = await response.json();

    if (result.success) {
      console.log("MRR:", result.data.monthlyRecurringRevenue);
      console.log("Customers:", result.data.totalCustomers);
      console.log("Total Revenue:", result.data.totalRevenue);
    }
  } catch (error) {
    console.error("Failed to fetch Stripe data:", error);
  }
}
```

### React Component Example

```tsx
import { useEffect, useState } from "react";

interface StripeData {
  businessName: string;
  businessLogo: string | null;
  businessUrl: string | null;
  monthlyRecurringRevenue: number;
  totalCustomers: number;
  totalRevenue: number;
  currency: string;
  lastUpdated: string;
}

export function StripeMetrics() {
  const [data, setData] = useState<StripeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe-data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Failed to load data</div>;

  return (
    <div>
      <h1>{data.businessName}</h1>
      <div>MRR: ${data.monthlyRecurringRevenue.toLocaleString()}</div>
      <div>Customers: {data.totalCustomers}</div>
      <div>Total Revenue: ${data.totalRevenue.toLocaleString()}</div>
    </div>
  );
}
```

### cURL Example

```bash
curl http://localhost:3000/api/stripe-data
```

## How MRR is Calculated

The MRR (Monthly Recurring Revenue) is calculated by:

1. Fetching all **active** subscriptions from Stripe
2. For each subscription item:
   - Get the price and quantity
   - Normalize the amount to monthly:
     - **Yearly**: Divide by 12
     - **Weekly**: Multiply by 4.33 (average weeks per month)
     - **Daily**: Multiply by 30
     - **Monthly**: Use as-is
3. Sum all normalized amounts

## Caching Strategy

### Cache Duration

- **Cache Time**: 1 hour (3600 seconds)
- **Stale While Revalidate**: 24 hours

### Cache Headers

```
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

This means:

- Fresh data for 1 hour
- After 1 hour, serve stale data while fetching new data in the background
- Maximum stale time: 24 hours

### Manual Cache Revalidation

If you need to force a cache refresh, you can deploy a new version or use Vercel's revalidation API.

## Performance Considerations

### Parallel Processing

All Stripe API calls are executed in parallel using `Promise.all()`:

- Business information
- MRR calculation
- Revenue calculation
- Customer count

This reduces total API call time by ~75% compared to sequential calls.

### Pagination

The service automatically handles pagination for:

- Subscriptions (when > 100 active subscriptions)
- Charges (when > 100 charges)
- Customers (when > 100 customers)

## File Structure

```
src/
├── app/
│   └── api/
│       └── stripe-data/
│           └── route.ts          # API route handler
├── lib/
│   └── stripe.ts                 # Stripe client singleton
├── services/
│   └── stripe-data.service.ts    # Business logic for data aggregation
└── types/
    └── stripe-data.ts            # TypeScript type definitions
```

## Troubleshooting

### "STRIPE_SECRET_KEY is not set"

**Solution**: Add your Stripe API key to `.env.local`:

```bash
STRIPE_SECRET_KEY=rk_live_YOUR_KEY_HERE
```

### "Failed to fetch Stripe data"

**Possible causes**:

1. Invalid API key
2. Insufficient permissions on the API key
3. Network connectivity issues
4. Stripe API is down

**Solution**: Check the server logs for detailed error messages.

### MRR is 0

**Possible causes**:

1. No active subscriptions in your Stripe account
2. API key doesn't have subscription read permissions

**Solution**: Verify you have active subscriptions and correct API permissions.

### Customer count is inaccurate

The customer count includes all customers, including:

- Active customers
- Inactive customers
- Deleted customers (if not permanently deleted)

## Security Best Practices

1. ✅ Use **restricted** API keys (not full access keys)
2. ✅ Never commit API keys to version control
3. ✅ Use environment variables for sensitive data
4. ✅ Implement rate limiting in production
5. ✅ Monitor API usage in Stripe Dashboard
6. ✅ Rotate API keys regularly

## Production Deployment

### Environment Variables

On Vercel, Netlify, or other platforms:

1. Go to your project settings
2. Add environment variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your restricted Stripe API key

### Rate Limiting

Consider implementing rate limiting for production:

```typescript
// Example with rate limiting
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## Support

For issues or questions:

- Check the [Stripe API Documentation](https://stripe.com/docs/api)
- Review server logs for error details
- Verify API key permissions in Stripe Dashboard

## License

This implementation is part of the TrustMRR project.
