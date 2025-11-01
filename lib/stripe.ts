import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe?: Stripe };

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set in environment variables. Please add it to your .env file."
  );
}

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
    typescript: true,
    appInfo: {
      name: "TrustMyMRR",
      version: "1.0.0",
    },
  });

if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
