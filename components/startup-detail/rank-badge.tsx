import { Badge } from "../ui/badge";
import { IconTrophy } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RankBadgeProps {
  rank: number;
  totalStartups?: number;
}

export function RankBadge({ rank, totalStartups }: RankBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="flex items-center rounded-md text-xs gap-1 cursor-help"
          >
            <IconTrophy className="size-4" />
            <span className="text-xs font-mono">#{rank}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs bg-white text-black border border-zinc-200"
        >
          <div className="space-y-1">
            <p className="font-semibold text-sm font-mono">Revenue Ranking</p>
            <p className="text-xs font-mono text-black">
              Ranked <strong>#{rank}</strong>
              {totalStartups && (
                <>
                  {" "}
                  out of <strong>{totalStartups}</strong> startups
                </>
              )}{" "}
              based on total revenue generated through Stripe.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
