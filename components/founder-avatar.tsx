"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FounderAvatarProps {
  username: string;
  profileImageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

export function FounderAvatar({
  username,
  profileImageUrl,
  size = "md",
}: FounderAvatarProps) {
  const sizeClasses =
    size === "sm"
      ? "h-5 w-5 sm:h-6 sm:w-6"
      : size === "lg"
      ? "h-14 w-14"
      : "h-8 w-8";
  const fallbackTextSize =
    size === "sm"
      ? "text-[9px] sm:text-[10px]"
      : size === "lg"
      ? "text-xl"
      : "text-xs";

  return (
    <Avatar className={`${sizeClasses} shrink-0`}>
      {profileImageUrl && (
        <AvatarImage
          src={profileImageUrl}
          alt={`@${username}`}
          className="object-cover"
          loading="lazy"
        />
      )}
      <AvatarFallback className={fallbackTextSize}>
        {username.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
