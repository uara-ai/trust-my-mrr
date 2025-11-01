"use client";

import { ExternalLink, DollarSign, Package } from "lucide-react";

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
import Link from "next/link";
import { IconSpeakerphone } from "@tabler/icons-react";

interface AdsRightProps {
  ads: AdCardData[];
}

export function AdsRight({ ads }: AdsRightProps) {
  const handleBuyAdSpot = async (spotId: string, stripePriceId: string) => {
    try {
      const response = await fetch("/api/checkout/ad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotId,
          stripePriceId,
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
                    onClick={() => {
                      if (spot.stripePriceId) {
                        handleBuyAdSpot(spot.id, spot.stripePriceId);
                      } else {
                        alert(
                          "Stripe price ID is not configured for this ad spot"
                        );
                      }
                    }}
                    className="border-dashed border-2 hover:border-primary hover:bg-accent/50"
                    style={{
                      minHeight: spot.dimensions.height,
                    }}
                  >
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">
                          Your startup here
                        </h4>
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-600">
                            ${spot.price}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /month
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        <IconSpeakerphone className="h-4 w-4" />
                        Ads here
                      </Button>
                    </div>
                  </MinimalCard>
                ) : (
                  // Active ad content
                  <MinimalCard
                    variant="default"
                    onClick={() => handleVisitAd(content.startup.website)}
                    className="hover:shadow-md"
                    style={{
                      minHeight: spot.dimensions.height,
                    }}
                  >
                    <Link
                      href={content.startup.website}
                      className="flex flex-col h-full"
                      target="_blank"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {content.startup.logo && (
                          <img
                            src={content.startup.logo}
                            alt={content.startup.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">
                            {content.startup.name}
                          </h4>
                          {content.startup.tagline && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {content.startup.tagline}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">
                        {content.startup.description}
                      </p>
                    </Link>
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
