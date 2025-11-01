import Image from "next/image";
import Link from "next/link";

export function BuiltBy() {
  return (
    <div className="flex items-center justify-center mt-12">
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
