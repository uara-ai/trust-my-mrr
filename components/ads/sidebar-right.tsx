import * as React from "react";
import { unstable_noStore as noStore } from "next/cache";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { AdsRight } from "./ads-right";
import { getAdsByPosition } from "@/lib/ads";
import { GithubStars } from "../github-stars";

interface SidebarRightProps extends React.ComponentProps<typeof Sidebar> {}

export async function SidebarRight(props: SidebarRightProps) {
  // Prevent caching to get live ad data
  noStore();

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
        <GithubStars />
      </SidebarFooter>
    </Sidebar>
  );
}
