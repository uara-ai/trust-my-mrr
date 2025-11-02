import { IconProgressDown } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

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
    </div>
  );
}
