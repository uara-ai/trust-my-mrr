"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MinimalCard } from "@/components/minimal-card";
import type { AdCardData } from "@/types/ads";
import { IconSpeakerphone } from "@tabler/icons-react";
import { getGoogleFavicon } from "@/lib/favicon";

interface AdsRightProps {
  ads: AdCardData[];
}

export function AdsRight({ ads }: AdsRightProps) {
  const [loadingSpotId, setLoadingSpotId] = useState<string | null>(null);

  const handleBuyAdSpot = async (spotId: string) => {
    setLoadingSpotId(spotId);
    try {
      const response = await fetch("/api/checkout/ad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start checkout process"
      );
      setLoadingSpotId(null);
    }
  };

  const handleVisitAd = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <div className="flex items-center justify-between w-full">
          <span>Ad</span>
          <Badge variant="secondary" className="text-xs">
            {ads.filter((ad) => ad.content).length}/{ads.length}
          </Badge>
        </div>
      </SidebarGroupLabel>
      <SidebarMenu>
        <div className="space-y-4 px-2">
          {ads.map((adData) => {
            const { spot, content } = adData;
            const isAvailable = !content;

            return (
              <SidebarMenuItem key={spot.id} className="list-none">
                {isAvailable ? (
                  // Available ad spot - Clickable placeholder
                  <MinimalCard
                    variant="default"
                    onClick={() => !loadingSpotId && handleBuyAdSpot(spot.id)}
                    className="border-dashed border-2 hover:border-primary hover:bg-accent/50 p-4"
                  >
                    <div className="flex flex-col items-center justify-center text-center gap-2">
                      <h4 className="font-semibold text-xs">
                        Your startup here
                      </h4>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          disabled={loadingSpotId === spot.id}
                        >
                          {loadingSpotId === spot.id ? (
                            <>
                              <span className="mr-2">Loading...</span>
                            </>
                          ) : (
                            <>
                              <IconSpeakerphone className="h-3 w-3" />$
                              {spot.price}
                              /mo
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </MinimalCard>
                ) : (
                  // Active ad content
                  <MinimalCard
                    variant="default"
                    onClick={() => handleVisitAd(content.startup.website)}
                    className="hover:shadow-md p-3"
                  >
                    <div className="flex flex-col gap-2">
                      {/* Logo and Name on same line */}
                      <div className="flex items-center gap-2">
                        {/* Logo with fallback */}
                        <div className="relative shrink-0">
                          {content.startup.logo || content.startup.website ? (
                            <img
                              src={
                                content.startup.logo ||
                                getGoogleFavicon(content.startup.website, 40)
                              }
                              alt={content.startup.name}
                              className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const fallback =
                                  target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center"
                            style={{
                              display:
                                content.startup.logo || content.startup.website
                                  ? "none"
                                  : "flex",
                            }}
                          >
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                              {content.startup.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Name */}
                        <h4 className="text-sm font-semibold truncate flex-1">
                          {content.startup.name}
                        </h4>
                      </div>

                      {/* Tagline */}
                      {content.startup.tagline && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {content.startup.tagline}
                        </p>
                      )}
                    </div>
                  </MinimalCard>
                )}
              </SidebarMenuItem>
            );
          })}
        </div>
      </SidebarMenu>
    </SidebarGroup>
  );
}
