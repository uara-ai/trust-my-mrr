import { notFound } from "next/navigation";
import {
  getStartupBySlug,
  getStartupRevenueData,
  getLast30DaysRevenue,
} from "@/app/actions/startup-detail.actions";
import { StartupHeader } from "@/components/startup-detail/startup-header";
import { StartupMetrics } from "@/components/startup-detail/startup-metrics";

interface StartupPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function StartupPage({ params }: StartupPageProps) {
  const { slug } = await params;

  // Fetch startup data
  const startupResult = await getStartupBySlug(slug);

  if (!startupResult.success || !startupResult.data) {
    notFound();
  }

  const startup = startupResult.data;
  const metrics = startup.metrics;

  if (!metrics) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Unable to load metrics
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            There was an error fetching metrics from Stripe.
          </p>
        </div>
      </div>
    );
  }

  // Fetch last 30 days revenue
  const last30DaysRevenue = await getLast30DaysRevenue(startup.apiKey);

  // Fetch initial chart data (30 days by default)
  const revenueDataResult = await getStartupRevenueData(slug, "30d");
  const chartData =
    revenueDataResult.success && revenueDataResult.data
      ? revenueDataResult.data.dataPoints
      : [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header with startup info */}
      <StartupHeader
        name={startup.name}
        logo={startup.logo}
        website={startup.website}
        description={startup.description}
        founders={startup.founders}
      />

      {/* Metrics and Charts */}
      <StartupMetrics
        slug={slug}
        totalRevenue={metrics.totalRevenue}
        last30DaysRevenue={last30DaysRevenue}
        monthlyRecurringRevenue={metrics.monthlyRecurringRevenue}
        totalCustomers={metrics.totalCustomers}
        currency={metrics.currency}
        initialChartData={chartData}
      />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: StartupPageProps) {
  const { slug } = await params;
  const startupResult = await getStartupBySlug(slug);

  if (!startupResult.success || !startupResult.data) {
    return {
      title: "Startup Not Found",
    };
  }

  const startup = startupResult.data;

  return {
    title: `${startup.name} - Metrics Dashboard`,
    description: startup.description || `View metrics for ${startup.name}`,
  };
}
