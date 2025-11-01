import Stripe from "stripe";
import type { StartupMetrics } from "@/types/startup";

/**
 * Fetches Stripe metrics for a specific API key
 * This is a server-side utility function
 */
export async function fetchStripeMetrics(
  apiKey: string
): Promise<StartupMetrics | null> {
  try {
    // Create a Stripe client with the startup's API key
    const stripe = new Stripe(apiKey, {
      apiVersion: "2025-10-29.clover",
      typescript: true,
    });

    // Fetch data in parallel
    const [subscriptions, charges, customers] = await Promise.all([
      stripe.subscriptions
        .list({ status: "active", limit: 100 })
        .catch(() => ({ data: [], has_more: false })),
      stripe.charges
        .list({ limit: 100 })
        .catch(() => ({ data: [], has_more: false })),
      stripe.customers.list({ limit: 1 }).catch(() => ({ data: [] })),
    ]);

    // Calculate MRR
    let mrr = 0;
    let currency = "usd";

    for (const subscription of subscriptions.data) {
      if (subscription.items.data.length > 0) {
        currency = subscription.currency;

        for (const item of subscription.items.data) {
          const price = item.price;
          const quantity = item.quantity || 1;
          const unitAmount = price.unit_amount || 0;

          let monthlyAmount = (unitAmount * quantity) / 100;

          switch (price.recurring?.interval) {
            case "year":
              monthlyAmount = monthlyAmount / 12;
              break;
            case "week":
              monthlyAmount = monthlyAmount * 4.33;
              break;
            case "day":
              monthlyAmount = monthlyAmount * 30;
              break;
            case "month":
            default:
              break;
          }

          mrr += monthlyAmount;
        }
      }
    }

    // Calculate total revenue
    let totalRevenue = 0;
    for (const charge of charges.data) {
      if (charge.status === "succeeded" && charge.paid) {
        currency = charge.currency;
        totalRevenue += charge.amount / 100;
      }
    }

    // Get customer count (approximate from first page)
    const customerCount = customers.data.length;

    return {
      monthlyRecurringRevenue: Math.round(mrr * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCustomers: customerCount,
      currency,
    };
  } catch (error) {
    console.error("Error fetching Stripe metrics:", error);
    return null;
  }
}
