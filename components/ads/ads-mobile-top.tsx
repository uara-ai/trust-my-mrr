"use client";

import { useState } from "react";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/motion-primitives/progressive-blur";
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
    <section className="bg-background block md:hidden">
      <div className="group relative m-auto max-w-6xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="inline md:max-w-44 md:border-r md:pr-6 mt-2">
            <p className="text-end text-sm flex items-center gap-1 text-muted-foreground">
              <IconSpeakerphone className="size-3" />
              <span>Ads</span>
            </p>
          </div>
          <div className="relative py-1 md:w-[calc(100%-11rem)]">
            <InfiniteSlider speedOnHover={20} speed={30} gap={24}>
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
                        className="border-dashed border-2 hover:border-primary hover:bg-accent/50 p-4 cursor-pointer w-[200px]"
                      >
                        <div className="flex flex-col items-center justify-center text-center gap-2">
                          <h4 className="font-semibold text-xs">
                            Your startup here
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            disabled={loadingSpotId === spot.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyAdSpot(spot.id);
                            }}
                          >
                            {loadingSpotId === spot.id ? (
                              <span className="mr-2">Loading...</span>
                            ) : (
                              <>
                                <IconSpeakerphone className="h-3 w-3" />$
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
                        className="hover:shadow-md p-2 cursor-pointer w-[200px]"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Logo and Name */}
                          <div className="flex items-center gap-2">
                            <div className="relative shrink-0">
                              {content.startup.logo ||
                              content.startup.website ? (
                                <img
                                  src={
                                    content.startup.logo ||
                                    getGoogleFavicon(
                                      content.startup.website,
                                      40
                                    )
                                  }
                                  alt={content.startup.name}
                                  className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const fallback =
                                      target.nextElementSibling as HTMLElement;
                                    if (fallback)
                                      fallback.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center"
                                style={{
                                  display:
                                    content.startup.logo ||
                                    content.startup.website
                                      ? "none"
                                      : "flex",
                                }}
                              >
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                  {content.startup.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
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
                  </div>
                );
              })}
            </InfiniteSlider>

            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-20"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-20"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
