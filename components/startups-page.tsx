import { getStartupsWithMetrics } from "@/app/actions/startup.actions";
import { StartupsDataTable } from "./startups-data-table";
import { columns } from "./startups-table-columns";
import { Lock } from "lucide-react";
import { ProductHunt } from "./product-hunt";

export async function StartupsPage() {
  const startups = await getStartupsWithMetrics();

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-center text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            The open source database of verified revenues
          </h1>
          <p className="mt-2 text-xs flex items-center gap-1 justify-center text-muted-foreground">
            <Lock className="size-3 hidden sm:block" />
            <span className="text-muted-foreground">
              All revenue is verified through{" "}
              <span className="font-semibold">Stripe</span> API keys.
            </span>
          </p>
          <ProductHunt />
        </div>
      </div>

      {/* Data Table */}
      <StartupsDataTable columns={columns} data={startups} />
    </div>
  );
}
