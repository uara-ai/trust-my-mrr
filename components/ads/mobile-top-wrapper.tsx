import { unstable_noStore as noStore } from "next/cache";
import { AdsMobileTop } from "./ads-mobile-top";
import { getAdsByPosition } from "@/lib/ads";

export async function MobileTopWrapper() {
  // Prevent caching to get live ad data
  noStore();

  // Fetch left ads for mobile top display
  const topAds = await getAdsByPosition("left");

  return <AdsMobileTop ads={topAds} />;
}
