"use client";

import * as React from "react";
import { cn, initials } from "@/lib/utils";
import { gradientStyle, inkColor } from "@/lib/visual";

const SIZES = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-[11px]",
  md: "size-11 text-xs",
  lg: "size-16 text-base",
  xl: "size-24 text-2xl",
  "2xl": "size-32 text-3xl",
} as const;

export type AvatarSize = keyof typeof SIZES;

/**
 * Deterministic gradient avatar. No stock photography anywhere in RE:VEAL —
 * the seed produces the same surface every render, and a real image can be
 * dropped in later without changing a single layout.
 */
export function Avatar({
  seed,
  name,
  size = "md",
  square = false,
  className,
  ring = false,
  src,
}: {
  seed: string;
  name: string;
  size?: AvatarSize;
  square?: boolean;
  className?: string;
  ring?: boolean;
  /** A real profile picture, when the account has one. */
  src?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={cn(
          "shrink-0 object-cover",
          square ? "rounded-2xl" : "rounded-full",
          ring && "ring-2 ring-white",
          SIZES[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-semibold tracking-wide",
        square ? "rounded-2xl" : "rounded-full",
        ring && "ring-2 ring-white",
        SIZES[size],
        className,
      )}
      style={{ ...gradientStyle(seed), color: inkColor(seed) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  items,
  max = 5,
  size = "sm",
}: {
  items: { seed: string; name: string }[];
  max?: number;
  size?: AvatarSize;
}) {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5">
        {shown.map((item) => (
          <Avatar key={item.seed} seed={item.seed} name={item.name} size={size} ring />
        ))}
      </div>
      {rest > 0 && <span className="ml-2.5 text-xs font-medium text-ink-50">+{rest}</span>}
    </div>
  );
}
