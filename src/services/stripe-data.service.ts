import { stripe } from "@/lib/stripe";
import type {
  StripeBusinessData,
  MRRCalculation,
  RevenueData,
} from "@/types/stripe-data";

// Extended type for business profile with icon support
interface ExtendedBusinessProfile {
  name?: string | null;
  url?: string | null;
  icon?: string | null;
}

/**
 * Calculates Monthly Recurring Revenue from active subscriptions
 * MRR = Sum of all active subscription amounts normalized to monthly
 */
async function calculateMRR(): Promise<MRRCalculation> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.items.data.price"],
    });

    let totalMRR = 0;
    let currency = "usd";

    for (const subscription of subscriptions.data) {
      if (subscription.items.data.length > 0) {
        currency = subscription.currency;

        for (const item of subscription.items.data) {
          const price = item.price;
          const quantity = item.quantity || 1;
          const unitAmount = price.unit_amount || 0;

          // Normalize to monthly amount
          let monthlyAmount = (unitAmount * quantity) / 100; // Convert from cents

          switch (price.recurring?.interval) {
            case "year":
              monthlyAmount = monthlyAmount / 12;
              break;
            case "week":
              monthlyAmount = monthlyAmount * 4.33; // Average weeks per month
              break;
            case "day":
              monthlyAmount = monthlyAmount * 30;
              break;
            case "month":
            default:
              // Already monthly
              break;
          }

          totalMRR += monthlyAmount;
        }
      }
    }

    // Handle pagination if more than 100 subscriptions
    if (subscriptions.has_more) {
      let hasMore = true;
      let startingAfter = subscriptions.data[subscriptions.data.length - 1].id;

      while (hasMore) {
        const moreSubscriptions = await stripe.subscriptions.list({
          status: "active",
          limit: 100,
          starting_after: startingAfter,
          expand: ["data.items.data.price"],
        });

        for (const subscription of moreSubscriptions.data) {
          if (subscription.items.data.length > 0) {
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

              totalMRR += monthlyAmount;
            }
          }
        }

        hasMore = moreSubscriptions.has_more;
        if (hasMore) {
          startingAfter =
            moreSubscriptions.data[moreSubscriptions.data.length - 1].id;
        }
      }
    }

    return { mrr: Math.round(totalMRR * 100) / 100, currency };
  } catch (error) {
    console.error("Error calculating MRR:", error);
    return { mrr: 0, currency: "usd" };
  }
}

/**
 * Calculates total revenue from all successful charges
 */
async function calculateTotalRevenue(): Promise<RevenueData> {
  try {
    const charges = await stripe.charges.list({
      limit: 100,
    });

    let totalRevenue = 0;
    let currency = "usd";

    for (const charge of charges.data) {
      if (charge.status === "succeeded" && charge.paid) {
        currency = charge.currency;
        totalRevenue += charge.amount / 100; // Convert from cents
      }
    }

    // Handle pagination
    if (charges.has_more) {
      let hasMore = true;
      let startingAfter = charges.data[charges.data.length - 1].id;

      while (hasMore) {
        const moreCharges = await stripe.charges.list({
          limit: 100,
          starting_after: startingAfter,
        });

        for (const charge of moreCharges.data) {
          if (charge.status === "succeeded" && charge.paid) {
            totalRevenue += charge.amount / 100;
          }
        }

        hasMore = moreCharges.has_more;
        if (hasMore) {
          startingAfter = moreCharges.data[moreCharges.data.length - 1].id;
        }
      }
    }

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      currency,
    };
  } catch (error) {
    console.error("Error calculating total revenue:", error);
    return { totalRevenue: 0, currency: "usd" };
  }
}

/**
 * Gets the total number of customers
 */
async function getCustomerCount(): Promise<number> {
  try {
    // Get first page to count total
    const customers = await stripe.customers.list({ limit: 100 });
    let count = customers.data.length;

    // Handle pagination to get accurate count
    if (customers.has_more) {
      let hasMore = true;
      let startingAfter = customers.data[customers.data.length - 1].id;

      while (hasMore) {
        const moreCustomers = await stripe.customers.list({
          limit: 100,
          starting_after: startingAfter,
        });

        count += moreCustomers.data.length;
        hasMore = moreCustomers.has_more;

        if (hasMore) {
          startingAfter = moreCustomers.data[moreCustomers.data.length - 1].id;
        }
      }
    }

    return count;
  } catch (error) {
    console.error("Error getting customer count:", error);
    return 0;
  }
}

/**
 * Gets business information from Stripe account
 */
async function getBusinessInfo(): Promise<{
  name: string;
  logo: string | null;
  url: string | null;
}> {
  try {
    const account = await stripe.accounts.retrieve();

    // Get logo URL from Stripe File if available
    let logoUrl: string | null = null;
    const businessProfile =
      account.business_profile as ExtendedBusinessProfile | null;

    if (businessProfile?.icon) {
      try {
        const file = await stripe.files.retrieve(businessProfile.icon);
        logoUrl = file.url ?? null;
      } catch (fileError) {
        console.error("Error retrieving logo file:", fileError);
      }
    }

    return {
      name:
        account.business_profile?.name ||
        account.settings?.dashboard?.display_name ||
        "Unknown Business",
      logo: logoUrl,
      url: account.business_profile?.url ?? null,
    };
  } catch (error) {
    console.error("Error getting business info:", error);
    return {
      name: "Unknown Business",
      logo: null,
      url: null,
    };
  }
}

/**
 * Aggregates all Stripe data into a single response
 * This function is optimized to run all queries in parallel
 */
export async function getStripeBusinessData(): Promise<StripeBusinessData> {
  try {
    // Run all API calls in parallel for better performance
    const [businessInfo, mrrData, revenueData, customerCount] =
      await Promise.all([
        getBusinessInfo(),
        calculateMRR(),
        calculateTotalRevenue(),
        getCustomerCount(),
      ]);

    return {
      businessName: businessInfo.name,
      businessLogo: businessInfo.logo,
      businessUrl: businessInfo.url,
      monthlyRecurringRevenue: mrrData.mrr,
      totalCustomers: customerCount,
      totalRevenue: revenueData.totalRevenue,
      currency: mrrData.currency || revenueData.currency || "usd",
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error aggregating Stripe data:", error);
    throw new Error(
      `Failed to fetch Stripe data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
