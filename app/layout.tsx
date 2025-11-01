import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarLeft } from "@/components/ads/sidebar-left";
import { SidebarRight } from "@/components/ads/sidebar-right";
import { BuiltBy } from "@/components/built-by";
import { OpenPanelComponent } from "@openpanel/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://trustmymrr.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Trust My MRR - Transparent Startup Revenue",
    template: "%s | Trust My MRR",
  },
  description:
    "Track and compare startup revenue metrics with transparent Stripe data. Discover MRR, total revenue, and customer metrics from successful founders and startups.",
  keywords: [
    "MRR",
    "Monthly Recurring Revenue",
    "startup metrics",
    "revenue tracking",
    "Stripe data",
    "transparent revenue",
    "startup revenue",
    "indie hackers",
    "founder metrics",
    "SaaS metrics",
    "startup analytics",
  ],
  authors: [{ name: "Trust My MRR" }],
  creator: "Trust My MRR",
  publisher: "Trust My MRR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Trust My MRR - Transparent Startup Revenue",
    description:
      "Track and compare startup revenue metrics with transparent Stripe data",
    url: baseUrl,
    siteName: "Trust My MRR",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Trust My MRR - Transparent Startup Revenue",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust My MRR - Transparent Startup Revenue",
    description:
      "Track and compare startup revenue metrics with transparent Stripe data",
    images: ["/api/og"],
    creator: "@trustmymrr",
    site: "@trustmymrr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <SidebarLeft />
          <SidebarInset>
            <Header />
            <div className="px-4 py-0">{children}</div>
            <BuiltBy />
          </SidebarInset>
          <SidebarRight />
        </SidebarProvider>
        <OpenPanelComponent
          clientId={process.env.NEXT_PUBLIC_OPEN_PANEL_CLIENT_ID!}
          clientSecret={process.env.OPEN_PANEL_CLIENT_SECRET!}
          trackScreenViews={true}
          disabled={process.env.NODE_ENV !== "production"}
        />
      </body>
    </html>
  );
}
