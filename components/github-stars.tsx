"use client";

import { IconStarFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function GithubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/uara-ai/trust-my-mrr")
      .then((res) => res.json())
      .then((data) => {
        setStars(data.stargazers_count ?? 0);
      })
      .catch(() => setStars(null));
  }, []);

  return (
    <Link
      href="https://git.new/trustmymrr"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 transition"
      title="View on GitHub"
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        width={18}
        height={18}
        aria-hidden="true"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.2 1.87.86 2.33.66.07-.52.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.73 7.73 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.45.55.38A8.001 8.001 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
      <span className="flex items-center gap-1 text-muted-foreground">
        {stars === null ? "GitHub" : `${stars}`}
        <IconStarFilled className="size-3" />
      </span>
    </Link>
  );
}
