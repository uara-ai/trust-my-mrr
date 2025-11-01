"use client";

import { ReactNode } from "react";
import { AdBanner } from "./ad-banner";
import { AdCardData } from "@/types/ads";

interface AdLayoutProps {
  children: ReactNode;
  topAds?: AdCardData[];
  rightAds?: AdCardData[];
  bottomAds?: AdCardData[];
  leftAds?: AdCardData[];
}

export function AdLayout({
  children,
  topAds = [],
  rightAds = [],
  bottomAds = [],
  leftAds = [],
}: AdLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Ads */}
      {topAds.length > 0 && <AdBanner position="top" ads={topAds} />}

      {/* Main Content with Side Ads */}
      <div className="flex flex-1 justify-center">
        {/* Left Ads */}
        {leftAds.length > 0 && (
          <aside className="hidden xl:flex sticky top-6 self-start">
            <AdBanner position="left" ads={leftAds} />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 max-w-7xl">{children}</main>

        {/* Right Ads */}
        {rightAds.length > 0 && (
          <aside className="hidden xl:flex sticky top-6 self-start">
            <AdBanner position="right" ads={rightAds} />
          </aside>
        )}
      </div>

      {/* Bottom Ads */}
      {bottomAds.length > 0 && <AdBanner position="bottom" ads={bottomAds} />}
    </div>
  );
}
