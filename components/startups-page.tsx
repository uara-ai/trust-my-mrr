import { getStartupsWithMetrics } from "@/app/actions/startup.actions";
import { StartupsDataTable } from "./startups-data-table";
import { columns } from "./startups-table-columns";
import { AddStartupDialog } from "./add-startup-dialog";

export async function StartupsPage() {
  const startups = await getStartupsWithMetrics();

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Startups</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Track MRR and revenue metrics from Stripe for all your startups
          </p>
        </div>
        <AddStartupDialog />
      </div>

      {/* Data Table */}
      <StartupsDataTable columns={columns} data={startups} />
    </div>
  );
}
