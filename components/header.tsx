import Link from "next/link";
import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          aria-label="TrustMyMRR Home"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo
            src="/logo.png"
            alt="TrustMyMRR"
            width={32}
            height={32}
            href="/"
          />
        </Link>

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
