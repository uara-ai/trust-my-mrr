import {
  IconBrandX,
  IconChartBar,
  IconProgressDown,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { GithubStars } from "./github-stars";

export function BuiltBy() {
  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <IconProgressDown className="size-3" />
        Data is updated hourly.
      </span>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        Built by{" "}
        <Link
          href="https://x.com/FedericoFan"
          className="flex items-center gap-1"
        >
          <Image
            src="/fedef.jpg"
            alt="Federico Fan"
            width={20}
            height={20}
            className="rounded-full"
          />
          <span className="font-semibold hover:underline hover:underline-offset-4">
            @FedericoFan
          </span>
        </Link>
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Link
          href="https://x.com/FedericoFan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 transition"
          title="Follow me on X"
        >
          <IconBrandX className="size-3" />
          <span className="flex items-center gap-1 text-muted-foreground">
            Follow me
          </span>
        </Link>
        <GithubStars />
        <Link
          href="https://dashboard.openpanel.dev/share/overview/PVKzC6"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 transition"
          title="Analytics"
        >
          <IconChartBar className="size-3" />
          <span className="flex items-center gap-1 text-muted-foreground">
            Analytics
          </span>
        </Link>
      </div>
    </div>
  );
}
