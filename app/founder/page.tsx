import Link from "next/link";
import { getAllFounders } from "@/app/actions/founders-list.actions";
import { FounderAvatar } from "@/components/founder-avatar";
import { Building2 } from "lucide-react";

export default async function FoundersListPage() {
  const founders = await getAllFounders();

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            All Founders
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Browse {founders.length}{" "}
            {founders.length === 1 ? "founder" : "founders"} building in public
          </p>
        </div>

        {/* Founders List */}
        {founders.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {founders.map((founder) => (
              <Link
                key={founder.id}
                href={`/founder/${founder.x_username}`}
                className="block p-4 bg-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <FounderAvatar
                    username={founder.x_username}
                    profileImageUrl={founder.profileImageUrl}
                    size="lg"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                      {founder.displayName || `@${founder.x_username}`}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                      @{founder.x_username}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Building2 className="h-3 w-3" />
                      <span>
                        {founder.startupsCount}{" "}
                        {founder.startupsCount === 1 ? "startup" : "startups"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            No founders found
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata() {
  const founders = await getAllFounders();

  return {
    title: "All Founders - Building in Public",
    description: `Browse ${founders.length} founders building in public with transparent metrics`,
  };
}
