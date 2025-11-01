import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/app-layout";
import { getAllAdsGrouped } from "@/lib/ads";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustMyMRR - Transparent Startup Revenue",
  description:
    "Track and compare startup revenue metrics with transparent Stripe data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ads = getAllAdsGrouped();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppLayout
          topAds={ads.top}
          rightAds={ads.right}
          bottomAds={ads.bottom}
          leftAds={ads.left}
        >
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
