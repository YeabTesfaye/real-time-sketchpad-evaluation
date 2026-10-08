'use client';

import { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  user: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    avatar_url: string | null;
  } | null;
  size?: number;
  className?: string;
}

function getInitials(firstname: string | null, lastname: string | null): string {
  const first = firstname?.trim()[0]?.toUpperCase() ?? "";
  const last = lastname?.trim()[0]?.toUpperCase() ?? "";
  return (first + last) || "?";
}

export function Avatar({ user, size = 32, className = "" }: AvatarProps) {
  // Hooks must run before any early return
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!user) return null;

  const fullName = `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();
  const showImage = Boolean(user.avatar_url) && failedUrl !== user.avatar_url;

  return (
    <div className={`relative inline-block ${className}`}>
      {showImage ? (
        <Image
          src={user.avatar_url as string}
          alt={fullName ? `${fullName} avatar` : "User avatar"}
          width={size}
          height={size}
          className="rounded-full border-2 border-border/50 object-cover"
          style={{ width: size, height: size }}
          onError={() => setFailedUrl(user.avatar_url)}
        />
      ) : (
        <div
          style={{ width: size, height: size, fontSize: size * 0.4 }}
          className="flex items-center justify-center rounded-full bg-primary/20 font-medium leading-none text-primary"
        >
          {getInitials(user.firstname, user.lastname)}
        </div>
      )}
    </div>
  );
}