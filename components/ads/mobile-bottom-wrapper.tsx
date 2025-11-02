import { unstable_noStore as noStore } from "next/cache";
import { AdsMobileBottom } from "./ads-mobile-bottom";
import { getAdsByPosition } from "@/lib/ads";

export async function MobileBottomWrapper() {
  // Prevent caching to get live ad data
  noStore();

  // Fetch right ads for mobile bottom display
  const bottomAds = await getAdsByPosition("right");

  return <AdsMobileBottom ads={bottomAds} />;
}
