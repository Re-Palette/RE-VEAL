"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Compass,
  GraduationCap,
  Globe,
  Loader2,
  Search,
  Sparkles,
  Briefcase,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/context";
import type { SearchEntityKind, SearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_META: Record<SearchEntityKind, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  person: { icon: Users, label: "Person" },
  brand: { icon: Building2, label: "Brand" },
  project: { icon: Briefcase, label: "Project" },
  event: { icon: CalendarDays, label: "Event" },
  post: { icon: Compass, label: "Post" },
  skill: { icon: Sparkles, label: "Skill" },
  city: { icon: Globe, label: "City" },
  course: { icon: GraduationCap, label: "Course" },
};

const QUICK_LINKS = [
  { label: "Makeup creators in Seoul", href: "/people?category=makeup&city=seoul" },
  { label: "Projects recruiting now", href: "/projects?status=recruiting" },
  { label: "Brands looking for creators", href: "/brands?looking=creator" },
  { label: "Events in Tokyo", href: "/events?city=tokyo" },
];

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setHighlight(0);
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { results: SearchResult[] }) => {
          setResults(data.results);
          setHighlight(0);
        })
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[highlight].href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12%] max-w-2xl translate-y-0 p-0"
        hideClose
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
        aria-label="Global search"
      >
        <div className="flex items-center gap-3 border-b border-ink-08 px-5 py-4">
          {loading ? (
            <Loader2 className="size-[18px] shrink-0 animate-spin text-lavender" />
          ) : (
            <Search className="size-[18px] shrink-0 text-ink-30" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("search.placeholder")}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-30"
          />
          <kbd className="hidden rounded-md border border-ink-15 px-1.5 py-0.5 text-[10px] font-medium text-ink-30 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <div className="p-4">
              <p className="mb-3 text-xs leading-relaxed text-ink-50">{t("search.hint")}</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className="rounded-full border border-ink-08 bg-white px-3 py-1.5 text-xs font-medium text-ink-70 transition-colors hover:border-lavender/40 hover:text-ink"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <p className="px-4 py-10 text-center text-sm text-ink-50">{t("search.empty")}</p>
          ) : (
            <ul>
              {results.map((result, index) => {
                const Meta = KIND_META[result.kind];
                return (
                  <li key={`${result.kind}-${result.id}`}>
                    <button
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => go(result.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        index === highlight ? "bg-lavender-soft/60" : "hover:bg-ink-08/40",
                      )}
                    >
                      <Avatar seed={result.seed} name={result.title} size="sm" square />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{result.title}</span>
                        <span className="block truncate text-xs text-ink-50">{result.subtitle}</span>
                      </span>
                      {result.badge && (
                        <Badge variant="mint" size="sm">
                          {result.badge}
                        </Badge>
                      )}
                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-ink-30">
                        <Meta.icon className="size-3.5" />
                        {Meta.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
