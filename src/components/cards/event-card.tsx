import Link from "next/link";
import { MapPin, Users, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MatchBadge } from "@/components/match/match-score";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { EVENT_TYPE_LABELS } from "@/lib/labels";
import type { BeautyEvent, MatchResult } from "@/lib/types";
import { daysUntil, formatDateRange } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

export function EventCard({ event, match }: { event: BeautyEvent; match?: MatchResult }) {
  const city = CITY_BY_ID.get(event.cityId);
  const country = COUNTRY_BY_ID.get(city?.countryId ?? "");
  const until = daysUntil(event.startDate);
  const start = new Date(event.startDate);

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <Link href={`/events/${event.id}`} className="flex h-full flex-col">
        <div className="relative h-28 shrink-0" style={gradientStyle(event.coverSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white/85 to-transparent" />
          <div className="absolute inset-x-4 top-3 flex items-start justify-between gap-2">
            <Badge variant="ink" size="sm">
              {EVENT_TYPE_LABELS[event.type]}
            </Badge>
            {match && <MatchBadge score={match.score} className="bg-white/85 backdrop-blur" />}
          </div>
          <div className="absolute bottom-3 left-4 flex items-end gap-3">
            <div className="rounded-xl bg-white/90 px-2.5 py-1.5 text-center shadow-soft backdrop-blur">
              <p className="font-display text-lg font-semibold leading-none">{start.getUTCDate()}</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-50">
                {start.toLocaleString("en", { month: "short", timeZone: "UTC" })}
              </p>
            </div>
            {until > 0 && until <= 45 && (
              <span className="mb-1 rounded-full bg-blush-soft px-2.5 py-1 text-[10px] font-semibold text-[#A85B7C]">
                In {until} days
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[15px] font-semibold leading-snug tracking-[-0.01em]">{event.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-50">
            <MapPin className="size-3.5 shrink-0 text-ink-30" />
            <span className="truncate">
              {event.venue}, {city?.name} {country?.flag}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-50">{formatDateRange(event.startDate, event.endDate)}</p>
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-70">{event.summary}</p>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-08 pt-3.5 text-[11px] text-ink-50">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-ink-30" />
              {event.attending} going
            </span>
            <span className="inline-flex items-center gap-2">
              {event.online && (
                <span className="inline-flex items-center gap-1 text-sky">
                  <Wifi className="size-3.5" />
                  Online
                </span>
              )}
              <span className="font-medium text-ink-70">{event.price}</span>
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
