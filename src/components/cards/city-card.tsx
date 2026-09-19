"use client";

import Link from "next/link";
import { ArrowUpRight, Briefcase, Building2, CalendarDays, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MatchBadge } from "@/components/match/match-score";
import { useI18n } from "@/lib/i18n/context";
import { COUNTRY_BY_ID } from "@/lib/data/geo";
import type { City, MatchResult } from "@/lib/types";
import { gradientStyle } from "@/lib/visual";

export function CityCard({
  city,
  match,
  counts,
}: {
  city: City;
  match?: MatchResult;
  counts: { projects: number; brands: number; events: number; people: number };
}) {
  const { t, city: cityName } = useI18n();
  const country = COUNTRY_BY_ID.get(city.countryId);

  return (
    <Card interactive className="overflow-hidden">
      <Link href={`/map?city=${city.id}`} className="block">
        <div className="relative h-16" style={gradientStyle(city.id)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
          {match && <MatchBadge score={match.score} className="absolute right-3 top-3 bg-white/85 backdrop-blur" />}
        </div>

        <div className="px-5 pb-5 pt-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold tracking-[-0.015em]">
              {cityName(city.id)} <span className="ml-0.5">{country?.flag}</span>
            </h3>
            <ArrowUpRight className="size-4 shrink-0 text-ink-30" />
          </div>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-50">{city.tagline}</p>

          <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-ink-08 pt-3.5">
            {[
              { icon: Briefcase, value: counts.projects, label: t("common.projects") },
              { icon: Building2, value: counts.brands, label: t("common.brands") },
              { icon: CalendarDays, value: counts.events, label: t("common.events") },
              { icon: Users, value: counts.people, label: t("common.people") },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="flex flex-col gap-1">
                  <stat.icon className="size-3.5 text-ink-30" />
                  <span className="font-display text-sm font-semibold">{stat.value}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-ink-30">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>
    </Card>
  );
}
