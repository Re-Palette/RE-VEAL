"use client";

import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConnectButton } from "@/components/actions/connect-button";
import { MatchBadge, MatchReasons } from "@/components/match/match-score";
import { useI18n } from "@/lib/i18n/context";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import type { ConnectionStatus, MatchResult, PersonView } from "@/lib/types";
import { formatCount } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

export function PersonCard({
  person,
  match,
  connection = "none",
}: {
  person: PersonView;
  match?: MatchResult;
  connection?: ConnectionStatus;
}) {
  const { t, L, skill, city, country, content } = useI18n();
  const countryId = CITY_BY_ID.get(person.profile.cityId)?.countryId ?? person.profile.countryId;

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <Link href={`/people/${person.id}`} className="block">
        <div className="relative h-20" style={gradientStyle(person.avatarSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white/85 to-transparent" />
          {match && <MatchBadge score={match.score} className="absolute right-3 top-3 bg-white/85 backdrop-blur" />}
        </div>

        <div className="-mt-9 px-5">
          <Avatar seed={person.avatarSeed} name={person.name} size="lg" ring />
          <div className="mt-3 flex items-center gap-1.5">
            <h3 className="truncate font-display text-base font-semibold tracking-[-0.01em]">{person.name}</h3>
            {person.verified && <BadgeCheck className="size-4 shrink-0 text-sky" />}
          </div>
          <p className="mt-0.5 text-sm text-ink-50">
            {L.role[person.profile.role]}
            {person.profile.secondaryRoles[0] && ` · ${L.role[person.profile.secondaryRoles[0]]}`}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-50">
            <MapPin className="size-3.5 text-ink-30" />
            {city(person.profile.cityId)}, {country(countryId)} {COUNTRY_BY_ID.get(countryId)?.flag}
          </p>
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-70">
            {content(`${person.id}.headline`, person.profile.headline)}
          </p>
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col justify-end px-5 pb-5">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {person.profile.skillIds.slice(0, 3).map((id) => (
            <Badge key={id} variant="lavender" size="sm">
              {skill(id)}
            </Badge>
          ))}
        </div>

        {match && <MatchReasons reasons={match.reasons} limit={2} className="mb-3" />}

        <div className="flex items-center justify-between gap-2 border-t border-ink-08 pt-3.5">
          <span className="min-w-0 truncate text-[11px] text-ink-30">
            {t("common.followers", { count: formatCount(person.profile.followers) })} ·{" "}
            <span className="text-mint">{L.availability[person.profile.availability]}</span>
          </span>
          <ConnectButton initialStatus={connection} name={person.name} />
        </div>
      </div>
    </Card>
  );
}

/** Dense row used in sidebars and detail pages. */
export function PersonRow({ person, match }: { person: PersonView; match?: MatchResult }) {
  const { L, city } = useI18n();
  return (
    <Link
      href={`/people/${person.id}`}
      className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-white"
    >
      <Avatar seed={person.avatarSeed} name={person.name} size="md" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{person.name}</span>
          {person.verified && <BadgeCheck className="size-3.5 shrink-0 text-sky" />}
        </span>
        <span className="block truncate text-xs text-ink-50">
          {L.role[person.profile.role]} · {city(person.profile.cityId)}
        </span>
      </span>
      {match && <MatchBadge score={match.score} />}
    </Link>
  );
}
