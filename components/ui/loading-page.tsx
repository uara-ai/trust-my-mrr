import { Spinner } from "@/components/ui/spinner";

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingStartupDetail() {
  return (
    <div className="container mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Metrics Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border rounded-lg bg-card space-y-2">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="p-6 border rounded-lg bg-card">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-[300px] bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function LoadingFounderDetail() {
  return (
    <div className="container mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Metrics Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 border rounded-lg bg-card space-y-2">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Startups Section Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 border rounded-lg bg-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingStartupsList() {
  return (
    <div className="container mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-5 w-96 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg bg-card">
        <div className="p-4 border-b">
          <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-4 border-b last:border-b-0 flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
