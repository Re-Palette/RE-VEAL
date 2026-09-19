"use client";

import { Sparkles } from "lucide-react";
import { MATCH_REASON_LABELS } from "@/lib/labels";
import type { MatchReason } from "@/lib/types";
import { cn } from "@/lib/utils";
import { scoreTone } from "@/lib/visual";

/** Compact pill used on every card that carries a score. */
export function MatchBadge({
  score,
  className,
  showLabel = false,
}: {
  score: number;
  className?: string;
  showLabel?: boolean;
}) {
  const tone = scoreTone(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tone.bg,
        tone.text,
        tone.ring,
        className,
      )}
    >
      <Sparkles className="size-3" />
      {score}%{showLabel && <span className="font-medium opacity-70"> {tone.label}</span>}
    </span>
  );
}

/** Ring used on detail pages, where the score deserves more weight. */
export function MatchRing({ score, size = 76 }: { score: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(score);

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9b87e8" />
            <stop offset="55%" stopColor="#6fa8ea" />
            <stop offset="100%" stopColor="#eb93b8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e4e7f1" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${score})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display font-semibold leading-none", tone.text)} style={{ fontSize: size / 3.4 }}>
          {score}
        </span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-30">Match</span>
      </span>
    </div>
  );
}

/**
 * RE:VEAL never shows a score without the reasoning behind it — a number on its
 * own is not something anyone can act on.
 */
export function MatchReasons({
  reasons,
  limit = 5,
  className,
  variant = "chips",
}: {
  reasons: MatchReason[];
  limit?: number;
  className?: string;
  variant?: "chips" | "list";
}) {
  const shown = reasons.slice(0, limit);
  if (shown.length === 0) return null;

  if (variant === "list") {
    return (
      <ul className={cn("space-y-2", className)}>
        {shown.map((reason) => (
          <li key={`${reason.kind}-${reason.label}`} className="flex items-start gap-2.5 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full gradient-accent" />
            <span className="leading-relaxed text-ink-70">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-30">
                {MATCH_REASON_LABELS[reason.kind]}
              </span>
              <br />
              {reason.label}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((reason) => (
        <span
          key={`${reason.kind}-${reason.label}`}
          className="rounded-full border border-ink-08 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-ink-70"
        >
          {reason.label}
        </span>
      ))}
    </div>
  );
}
