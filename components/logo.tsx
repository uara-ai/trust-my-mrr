import Image from "next/image";
import Link from "next/link";

export function Logo({
  src,
  alt,
  width,
  height,
  href,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <Image src={src} alt={alt} width={width} height={height} />
      <span className="text-sm font-bold">Trust My MRR</span>
    </Link>
  );
}
