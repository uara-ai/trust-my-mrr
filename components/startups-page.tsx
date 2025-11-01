import { getStartupsWithMetrics } from "@/app/actions/startup.actions";
import { StartupsDataTable } from "./startups-data-table";
import { columns } from "./startups-table-columns";
import { AddStartupDialog } from "./add-startup-dialog";

export async function StartupsPage() {
  const startups = await getStartupsWithMetrics();

  return (
    <div className="container mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            The database of verified startup revenues
          </h1>
        </div>
      </div>

      {/* Data Table */}
      <StartupsDataTable columns={columns} data={startups} />
    </div>
  );
}
