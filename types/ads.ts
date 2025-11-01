export type AdSize =
  | "xsmall"
  | "small"
  | "medium"
  | "large"
  | "xlarge"
  | "banner";

export interface DynamicPricing {
  enabled: boolean;
  startPrice: number;
  maxPrice: number;
  priceIncrement: number;
  singleStripePriceId: string;
}

export interface AdSpot {
  id: string;
  size: AdSize;
  position: "top" | "right" | "bottom" | "left";
  dimensions: {
    width: string;
    height: string;
  };
}

export interface AdSpotWithPrice extends AdSpot {
  price: number;
  stripePriceId: string;
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
  spot: AdSpotWithPrice;
  content?: AdContent | null;
}
