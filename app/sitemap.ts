import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL - replace with your actual domain
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://trustmymrr.com";

  // Dynamic imports to avoid bundling issues
  const { prisma } = await import("@/lib/prisma");

  // Fetch all startups
  const startups = await prisma.startup.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Fetch all founders
  const founders = await prisma.founder.findMany({
    select: {
      x_username: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Remove duplicates from founders (same username might exist multiple times)
  const uniqueFounders = Array.from(
    new Map(
      founders.map((founder) => [founder.x_username.toLowerCase(), founder])
    ).values()
  );

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/startup`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/founder`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic startup routes
  const startupRoutes: MetadataRoute.Sitemap = startups.map((startup) => ({
    url: `${baseUrl}/startup/${startup.slug}`,
    lastModified: startup.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic founder routes
  const founderRoutes: MetadataRoute.Sitemap = uniqueFounders.map(
    (founder) => ({
      url: `${baseUrl}/founder/${founder.x_username}`,
      lastModified: founder.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  return [...staticRoutes, ...startupRoutes, ...founderRoutes];
}
