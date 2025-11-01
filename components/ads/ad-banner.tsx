"use client";

import { AdCard } from "./ad-card";
import { AdCardData } from "@/types/ads";

interface AdBannerProps {
  position: "top" | "right" | "bottom" | "left";
  ads: AdCardData[];
}

export function AdBanner({ position, ads }: AdBannerProps) {
  if (ads.length === 0) return null;

  const positionClasses = {
    top: "flex-row gap-4 justify-center mb-6",
    right: "flex-col gap-4 ml-6",
    bottom: "flex-row gap-4 justify-center mt-6",
    left: "flex-col gap-4 mr-6",
  };

  return (
    <div className={`flex ${positionClasses[position]}`}>
      {ads.map((ad) => (
        <AdCard key={ad.spot.id} data={ad} />
      ))}
    </div>
  );
}
