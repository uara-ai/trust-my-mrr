import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto py-20">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <FileQuestion className="h-24 w-24 text-zinc-300 dark:text-zinc-700" />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Startup Not Found
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
            The startup you're looking for doesn't exist or may have been
            removed.
          </p>
        </div>

        <Link href="/">
          <Button>Back to Startups</Button>
        </Link>
      </div>
    </div>
  );
}
