import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function FounderNotFound() {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
            Founder Not Found
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            The founder you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
