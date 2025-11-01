import { Badge } from "../ui/badge";
import { IconShieldCheckFilled } from "@tabler/icons-react";

export function VerifiedBadge() {
  return (
    <Badge
      variant="outline"
      className="flex items-center rounded-md text-xs gap-1"
    >
      <IconShieldCheckFilled className="size-4" />
      <span className="text-xs font-mono">Verified</span>
    </Badge>
  );
}
