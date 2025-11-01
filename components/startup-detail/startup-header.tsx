import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FounderAvatar } from "@/components/founder-avatar";

interface Founder {
  id: string;
  x_username: string;
  profileImageUrl?: string | null;
  displayName?: string | null;
}

interface StartupHeaderProps {
  name: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  founders: Founder[];
}

export function StartupHeader({
  name,
  logo,
  website,
  description,
  founders,
}: StartupHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Startups
        </Button>
      </Link>

      {/* Header Info */}
      <div className="flex items-start gap-6">
        {/* Logo */}
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="h-20 w-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center justify-center">
            <span className="text-2xl font-medium text-zinc-500 dark:text-zinc-400">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {name}
          </h1>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 flex items-center gap-1 mt-1"
            >
              {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 max-w-2xl">
              {description}
            </p>
          )}

          {/* Founders */}
          {founders.length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-3">
                {founders.map((founder) => (
                  <a
                    key={founder.id}
                    href={`https://x.com/${founder.x_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    title={founder.displayName || `@${founder.x_username}`}
                  >
                    <FounderAvatar
                      username={founder.x_username}
                      profileImageUrl={founder.profileImageUrl}
                      size="sm"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      @{founder.x_username}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
