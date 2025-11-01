export type AdSize = "small" | "medium" | "large" | "banner";

export interface AdSpot {
  id: string;
  size: AdSize;
  position: "top" | "right" | "bottom" | "left";
  price: number;
  stripePriceId?: string; // Stripe price ID for payment
  dimensions: {
    width: string;
    height: string;
  };
}

export interface AdContent {
  id: string;
  spotId: string;
  startup: {
    name: string;
    logo?: string;
    website: string;
    description: string;
    tagline?: string;
  };
  expiresAt: Date;
  isActive: boolean;
}

export interface AdCardData {
  spot: AdSpot;
  content?: AdContent | null;
}
