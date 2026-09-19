"use client";

import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/** Single-select chip row. Used for status, sort and other exclusive filters. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  tone = "ink",
  className,
}: {
  label?: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: "ink" | "lavender" | "sky";
  className?: string;
}) {
  const active =
    tone === "lavender"
      ? "border-lavender/40 bg-lavender-soft text-[#4B3BA0]"
      : tone === "sky"
        ? "border-sky/40 bg-sky-soft text-[#2F5E9E]"
        : "border-transparent bg-ink text-white shadow-soft";

  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-30">{label}</p>
      )}
      <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all",
              value === option.value
                ? active
                : "border-ink-08 bg-white text-ink-50 hover:border-ink-30 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Multi-select chip row. Used for categories, skills, languages. */
export function MultiChipGroup<T extends string>({
  label,
  options,
  values,
  onToggle,
  tone = "lavender",
  className,
}: {
  label?: string;
  options: ChipOption<T>[];
  values: T[];
  onToggle: (value: T) => void;
  tone?: "lavender" | "sky" | "mint";
  className?: string;
}) {
  const active =
    tone === "sky"
      ? "border-sky/40 bg-sky-soft text-[#2F5E9E]"
      : tone === "mint"
        ? "border-mint/40 bg-mint-soft text-[#37796C]"
        : "border-lavender/40 bg-lavender-soft text-[#4B3BA0]";

  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-30">{label}</p>
      )}
      <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onToggle(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all",
              values.includes(option.value)
                ? active
                : "border-ink-08 bg-white text-ink-50 hover:border-ink-30 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterPanel({
  query,
  onQueryChange,
  placeholder,
  resultCount,
  activeCount,
  onClear,
  children,
  advanced,
  advancedCount = 0,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  resultCount: number;
  activeCount: number;
  onClear: () => void;
  children: React.ReactNode;
  /** Secondary filters, hidden until asked for so the panel stays shallow. */
  advanced?: React.ReactNode;
  advancedCount?: number;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <div className="mb-6 space-y-4 rounded-panel border border-ink-08 bg-white/70 p-4 backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-30" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-full border border-ink-15 bg-white pl-10 pr-4 text-sm transition-colors placeholder:text-ink-30 hover:border-ink-30 focus:border-lavender focus:outline-none focus:ring-4 focus:ring-lavender/12"
          />
        </div>
        <span className="flex items-center gap-3 text-xs text-ink-50">
          <span>
            <span className="font-semibold text-ink">{resultCount}</span> results
          </span>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1 font-medium text-ink-30 transition-colors hover:text-lavender"
            >
              <X className="size-3.5" />
              Clear {activeCount}
            </button>
          )}
        </span>
      </div>
      {children}

      {advanced && (
        <>
          <button
            onClick={() => setShowAdvanced((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-ink-08 bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink-50 transition-colors hover:border-lavender/40 hover:text-ink"
          >
            <SlidersHorizontal className="size-3.5" />
            More filters
            {advancedCount > 0 && (
              <span className="rounded-full bg-lavender-soft px-1.5 text-[11px] font-semibold text-[#4B3BA0]">
                {advancedCount}
              </span>
            )}
            <ChevronDown className={cn("size-3.5 transition-transform", showAdvanced && "rotate-180")} />
          </button>
          {showAdvanced && <div className="animate-rise space-y-4 border-t border-ink-08 pt-4">{advanced}</div>}
        </>
      )}
    </div>
  );
}
