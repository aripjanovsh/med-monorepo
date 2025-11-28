"use client";

import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fileHelpers } from "@/features/file/file.api";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  avatarId?: string | null;
  name?: string;
  className?: string;
  size?: number;
  fallbackClassName?: string;
};

/**
 * Компонент аватара пользователя с поддержкой Next.js Image оптимизации.
 * Использует публичный endpoint /api/v1/files/image/:id
 */
export function UserAvatar({
  avatarId,
  name = "",
  className,
  size = 40,
  fallbackClassName,
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const imageUrl = avatarId ? fileHelpers.getImageUrl(avatarId) : null;

  return (
    <Avatar className={cn("relative overflow-hidden", className)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name || "Avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <AvatarFallback className={fallbackClassName}>
          {initials || "?"}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
