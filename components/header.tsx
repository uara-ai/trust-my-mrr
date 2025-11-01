import Link from "next/link";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2">
      <nav className="w-full px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Logo */}

        <Logo
          src="/logo.png"
          alt="TrustMyMRR"
          width={32}
          height={32}
          href="/"
        />

        {/* Navigation Links 
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            Startups
          </Link>
          <Link
            href="/advertise"
            className="text-sm font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            Advertise
          </Link>
          <Link
            href="/about"
            className="text-sm font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            About
          </Link>
        </div>*/}
      </nav>
    </header>
  );
}
