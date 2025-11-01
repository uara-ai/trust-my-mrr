import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarLeft } from "@/components/ads/sidebar-left";
import { SidebarRight } from "@/components/ads/sidebar-right";
import { BuiltBy } from "@/components/built-by";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trust My MRR - Transparent Startup Revenue",
  description:
    "Track and compare startup revenue metrics with transparent Stripe data",
  openGraph: {
    title: "Trust My MRR - Transparent Startup Revenue",
    description:
      "Track and compare startup revenue metrics with transparent Stripe data",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Trust My MRR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust My MRR - Transparent Startup Revenue",
    description:
      "Track and compare startup revenue metrics with transparent Stripe data",
    images: ["/api/og"],
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
      </body>
    </html>
  );
}
