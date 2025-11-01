import { AdSpot, AdContent, AdCardData } from "@/types/ads";
import adData from "@/data/ad-spots.json";

export function getAdSpots(): AdSpot[] {
  return adData.adSpots as AdSpot[];
}

export function getActiveAds(): AdContent[] {
  return adData.activeAds.map((ad) => ({
    ...ad,
    expiresAt: new Date(ad.expiresAt),
  })) as AdContent[];
}

export function getAdsByPosition(
  position: "top" | "right" | "bottom" | "left"
): AdCardData[] {
  const spots = getAdSpots().filter((spot) => spot.position === position);
  const activeAds = getActiveAds();

  return spots.map((spot) => {
    const content = activeAds.find(
      (ad) => ad.spotId === spot.id && ad.isActive && ad.expiresAt > new Date()
    );

    return {
      spot,
      content: content || null,
    };
  });
}

export function getAllAdsGrouped() {
  return {
    top: getAdsByPosition("top"),
    right: getAdsByPosition("right"),
    bottom: getAdsByPosition("bottom"),
    left: getAdsByPosition("left"),
  };
}
