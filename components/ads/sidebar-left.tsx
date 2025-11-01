import * as React from "react";
import { unstable_noStore as noStore } from "next/cache";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { AdsLeft } from "@/components/ads/ads-left";
import { getAdsByPosition } from "@/lib/ads";

interface SidebarLeftProps extends React.ComponentProps<typeof Sidebar> {}

export async function SidebarLeft(props: SidebarLeftProps) {
  // Prevent caching to get live ad data
  noStore();

  // Fetch left ads
  const leftAds = await getAdsByPosition("left");

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarContent>
        <AdsLeft ads={leftAds} />
      </SidebarContent>
    </Sidebar>
  );
}
