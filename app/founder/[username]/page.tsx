import { notFound } from "next/navigation";
import {
  getFounderByUsername,
  getFounderAggregatedMetrics,
} from "@/app/actions/founder-detail.actions";
import { FounderHeader } from "@/components/founder-detail/founder-header";
import { FounderMetrics } from "@/components/founder-detail/founder-metrics";
import { FounderStartupCard } from "@/components/founder-detail/founder-startup-card";

interface FounderPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function FounderPage({ params }: FounderPageProps) {
  const { username } = await params;

  // Fetch founder data
  const founderResult = await getFounderByUsername(username);

  if (!founderResult.success || !founderResult.data) {
    notFound();
  }

  const founder = founderResult.data;

  // Get aggregated metrics
  const aggregatedMetrics = await getFounderAggregatedMetrics(username);

  return (
    <div className="container mx-auto space-y-8">
      {/* Header with founder info */}
      <FounderHeader
        username={founder.x_username}
        displayName={founder.displayName}
        profileImageUrl={founder.profileImageUrl}
        startupsCount={aggregatedMetrics.startupsCount}
      />

      {/* Aggregated Metrics */}
      <FounderMetrics
        totalRevenue={aggregatedMetrics.totalRevenue}
        last30DaysRevenue={aggregatedMetrics.last30DaysRevenue}
        totalMRR={aggregatedMetrics.totalMRR}
        totalCustomers={aggregatedMetrics.totalCustomers}
        startupsCount={aggregatedMetrics.startupsCount}
        currency={aggregatedMetrics.currency}
      />

      {/* Startups Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Startups by @{founder.x_username}
        </h2>

        {founder.startups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {founder.startups.map((startup) => (
              <FounderStartupCard
                key={startup.id}
                slug={startup.slug}
                name={startup.name}
                description={startup.description}
                logo={startup.logo}
                website={startup.website}
                metrics={startup.metrics}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            No startups found for this founder.
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: FounderPageProps) {
  const { username } = await params;
  const founderResult = await getFounderByUsername(username);

  if (!founderResult.success || !founderResult.data) {
    return {
      title: "Founder Not Found",
    };
  }

  const founder = founderResult.data;

  return {
    title: `${
      founder.displayName || `@${founder.x_username}`
    } - Founder Dashboard`,
    description: `View all startups and metrics for ${
      founder.displayName || `@${founder.x_username}`
    }`,
    openGraph: {
      title: `${
        founder.displayName || `@${founder.x_username}`
      } - Founder Dashboard`,
      description: `View all startups and metrics for ${
        founder.displayName || `@${founder.x_username}`
      }`,
      type: "profile",
      images: [
        {
          url: `/api/og/founder/${username}`,
          width: 1200,
          height: 630,
          alt: founder.displayName || `@${founder.x_username}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${
        founder.displayName || `@${founder.x_username}`
      } - Founder Dashboard`,
      description: `View all startups and metrics for ${
        founder.displayName || `@${founder.x_username}`
      }`,
      images: [`/api/og/founder/${username}`],
    },
  };
}
