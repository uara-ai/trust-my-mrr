import { getStartupsWithMetrics } from "@/app/actions/startup.actions";
import { StartupListCard } from "@/components/startup-list-card";

export default async function StartupsListPage() {
  const startups = await getStartupsWithMetrics();

  // Sort by total revenue descending
  const sortedStartups = startups.sort(
    (a, b) => (b.metrics?.totalRevenue || 0) - (a.metrics?.totalRevenue || 0)
  );

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            All Startups
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Browse {startups.length}{" "}
            {startups.length === 1 ? "startup" : "startups"} building in public
          </p>
        </div>

        {/* Startups List */}
        {sortedStartups.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedStartups.map((startup, index) => (
              <StartupListCard
                key={startup.id}
                startup={startup}
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            No startups found
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata() {
  const startups = await getStartupsWithMetrics();

  return {
    title: "All Startups - Building in Public",
    description: `Browse ${startups.length} startups building in public with transparent metrics`,
  };
}
