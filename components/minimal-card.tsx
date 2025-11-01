"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MinimalCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "compact" | "minimal";
}

export function MinimalCard({
  children,
  className,
  onClick,
  href,
  variant = "default",
}: MinimalCardProps) {
  const baseClasses =
    "bg-white border border-gray-200 rounded transition-all duration-200";

  const variantClasses = {
    default: "p-4 hover:border-gray-300 hover:shadow-sm",
    compact: "p-3 hover:border-gray-300",
    minimal: "p-2 hover:border-gray-300",
  };

  const cardClasses = cn(
    baseClasses,
    variantClasses[variant],
    onClick || href ? "cursor-pointer" : "",
    className
  );

  const cardContent = (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// Cursor rules applied correctly.
