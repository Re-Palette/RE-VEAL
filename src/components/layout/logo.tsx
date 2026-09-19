"use client";

import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex items-baseline gap-2 select-none", className)}>
      <span className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
        RE<span className="text-gradient">:</span>VEAL
      </span>
      {!compact && (
        <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-ink-30 lg:inline">
          {t("logo.tagline")}
        </span>
      )}
    </span>
  );
}
