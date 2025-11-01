"use client";

import { ReactNode } from "react";
import { Header } from "@/components/header";
import { AdCard } from "@/components/ads/ad-card";
import { AdCardData } from "@/types/ads";
import { Footer } from "@/components/footer";

interface AppLayoutProps {
  children: ReactNode;
  topAds?: AdCardData[];
  rightAds?: AdCardData[];
  bottomAds?: AdCardData[];
  leftAds?: AdCardData[];
}

export function AppLayout({
  children,
  topAds = [],
  rightAds = [],
  bottomAds = [],
  leftAds = [],
}: AppLayoutProps) {
  const hasTopAds = topAds.length > 0;
  const hasBottomAds = bottomAds.length > 0;
  const hasSideAds = rightAds.length > 0 || leftAds.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <Header />

      {/* Main Layout */}
      <div className="pt-20 pb-8">
        {/* Top Banner Ads */}
        {hasTopAds && (
          <div className="w-full mb-8 px-4 lg:px-6">
            <div className="max-w-7xl mx-auto space-y-4">
              {topAds.map((ad) => (
                <div key={ad.spot.id} className="w-full">
                  <AdCard data={ad} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid with Sidebar Ads */}
        <div className="w-full px-4 lg:px-6">
          <div
            className={`mx-auto ${
              hasSideAds
                ? "max-w-[1920px] grid grid-cols-1 2xl:grid-cols-[320px_1fr_320px] gap-6"
                : "max-w-7xl"
            }`}
          >
            {/* Left Sidebar Ads */}
            {leftAds.length > 0 && (
              <aside className="hidden 2xl:block">
                <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  {leftAds.map((ad) => (
                    <AdCard key={ad.spot.id} data={ad} />
                  ))}
                </div>
              </aside>
            )}

            {/* Main Content */}
            <main className="min-w-0 w-full">{children}</main>

            {/* Right Sidebar Ads */}
            {rightAds.length > 0 && (
              <aside className="hidden 2xl:block">
                <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pl-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                  {rightAds.map((ad) => (
                    <AdCard key={ad.spot.id} data={ad} />
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Bottom Banner Ads */}
        {hasBottomAds && (
          <div className="w-full mt-8 px-4 lg:px-6">
            <div className="max-w-7xl mx-auto space-y-4">
              {bottomAds.map((ad) => (
                <div key={ad.spot.id} className="w-full">
                  <AdCard data={ad} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
