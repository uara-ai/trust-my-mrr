"use client";

import { useState } from "react";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { Button } from "@/components/ui/button";
import { MinimalCard } from "@/components/minimal-card";
import type { AdCardData } from "@/types/ads";
import { IconSpeakerphone } from "@tabler/icons-react";
import { getGoogleFavicon } from "@/lib/favicon";

interface AdsMobileTopProps {
  ads: AdCardData[];
}

export function AdsMobileTop({ ads }: AdsMobileTopProps) {
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
    <section className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-b block md:hidden">
      <div className="group relative m-auto max-w-6xl px-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs flex items-center gap-1 text-muted-foreground">
              <IconSpeakerphone className="size-3" />
              <span>Ads</span>
            </p>
          </div>
          <div className="relative py-2 flex-1 overflow-hidden">
            <InfiniteSlider speedOnHover={20} speed={30} gap={16}>
              {ads.map((adData) => {
                const { spot, content } = adData;
                const isAvailable = !content;

                return (
                  <div key={spot.id} className="flex">
                    {isAvailable ? (
                      // Available ad spot - Clickable placeholder
                      <MinimalCard
                        variant="default"
                        onClick={() =>
                          !loadingSpotId && handleBuyAdSpot(spot.id)
                        }
                        className="border-dashed border-2 hover:border-primary hover:bg-accent/50 p-2 cursor-pointer w-[140px]"
                      >
                        <div className="flex flex-col items-center justify-center text-center gap-1">
                          <h4 className="font-semibold text-[10px] leading-tight">
                            Your startup here
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[10px] h-5 px-2"
                            disabled={loadingSpotId === spot.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyAdSpot(spot.id);
                            }}
                          >
                            {loadingSpotId === spot.id ? (
                              <span className="text-[9px]">Loading...</span>
                            ) : (
                              <>
                                <IconSpeakerphone className="h-2.5 w-2.5" />$
                                {spot.price}/mo
                              </>
                            )}
                          </Button>
                        </div>
                      </MinimalCard>
                    ) : (
                      // Active ad content
                      <MinimalCard
                        variant="default"
                        onClick={() => handleVisitAd(content.startup.website)}
                        className="hover:shadow-md p-2 cursor-pointer w-[140px]"
                      >
                        <div className="flex items-center gap-2">
                          {/* Logo */}
                          <div className="relative shrink-0">
                            {content.startup.logo || content.startup.website ? (
                              <img
                                src={
                                  content.startup.logo ||
                                  getGoogleFavicon(content.startup.website, 32)
                                }
                                alt={content.startup.name}
                                className="h-8 w-8 rounded-md object-cover border border-zinc-200 dark:border-zinc-800"
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
                              className="h-8 w-8 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center"
                              style={{
                                display:
                                  content.startup.logo ||
                                  content.startup.website
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                {content.startup.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {/* Name */}
                          <h4 className="text-xs font-semibold truncate flex-1">
                            {content.startup.name}
                          </h4>
                        </div>
                      </MinimalCard>
                    )}
                  </div>
                );
              })}
            </InfiniteSlider>
          </div>
        </div>
      </div>
    </section>
  );
}
