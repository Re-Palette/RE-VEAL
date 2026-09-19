import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable 32-bit hash — lets mock data stay deterministic between renders. */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function pickFrom<T>(list: readonly T[], seed: string, offset = 0): T {
  return list[(hashString(seed) + offset) % list.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

/** Dates render in the viewer's locale, so "Mar 2" becomes "3月2日" in Japanese. */
export function formatDate(iso: string, locale = "en"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateRange(startIso: string, endIso: string, locale = "en"): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startIso} – ${endIso}`;
  if (start.getTime() === end.getTime()) return formatDate(startIso, locale);
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).formatRange(start, end);
  } catch {
    return `${formatDate(startIso, locale)} – ${formatDate(endIso, locale)}`;
  }
}

/** "3d ago" style relative time, computed against a fixed clock for stable SSR. */
export function relativeTime(iso: string, now = new Date("2026-09-19T09:00:00Z")): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Math.max(0, now.getTime() - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function daysUntil(iso: string, now = new Date("2026-09-19T09:00:00Z")): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.ceil((then - now.getTime()) / 86_400_000);
}

export function titleCase(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function overlapCount<T>(a: readonly T[], b: readonly T[]): number {
  const set = new Set(b);
  return a.reduce((count, item) => (set.has(item) ? count + 1 : count), 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
