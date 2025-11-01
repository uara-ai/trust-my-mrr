import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AdsRight } from "./ads-right";
import { getAdsByPosition } from "@/lib/ads";

interface SidebarRightProps extends React.ComponentProps<typeof Sidebar> {}

export async function SidebarRight(props: SidebarRightProps) {
  // Fetch right ads
  const rightAds = await getAdsByPosition("right");

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l sm:flex"
      {...props}
    >
      <SidebarContent>
        <AdsRight ads={rightAds} />
      </SidebarContent>
      <SidebarFooter>
        <span className="text-xs text-muted-foreground">
          Ads will be manually added, so you may not see them immediately.
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
