import Link from "next/link";
import { BadgeCheck, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MatchBadge, MatchReasons } from "@/components/match/match-score";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { BRAND_TYPE_LABELS, CATEGORY_LABELS, ROLE_LABELS } from "@/lib/labels";
import type { Brand, MatchResult } from "@/lib/types";
import { formatCount } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

export function BrandCard({ brand, match }: { brand: Brand; match?: MatchResult }) {
  const city = CITY_BY_ID.get(brand.cityId);
  const country = COUNTRY_BY_ID.get(brand.countryId);
  const openings = brand.openOpportunities.length;

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <Link href={`/brands/${brand.id}`} className="flex h-full flex-col">
        <div className="relative h-24" style={gradientStyle(brand.avatarSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
          {match && <MatchBadge score={match.score} className="absolute right-3 top-3 bg-white/85 backdrop-blur" />}
          <Badge variant="default" size="sm" className="absolute left-3 top-3 bg-white/85 backdrop-blur">
            {BRAND_TYPE_LABELS[brand.type]}
          </Badge>
        </div>

        <div className="-mt-8 flex flex-1 flex-col px-5 pb-5">
          <Avatar seed={brand.avatarSeed} name={brand.name} size="lg" square ring />

          <div className="mt-3 flex items-center gap-1.5">
            <h3 className="truncate font-display text-base font-semibold tracking-[-0.01em]">{brand.name}</h3>
            {brand.verified && <BadgeCheck className="size-4 shrink-0 text-sky" />}
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-70">{brand.tagline}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-50">
            <MapPin className="size-3.5 text-ink-30" />
            {city?.name}, {country?.name} {country?.flag}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {brand.categories.slice(0, 3).map((c) => (
              <Badge key={c} variant="sky" size="sm">
                {CATEGORY_LABELS[c]}
              </Badge>
            ))}
          </div>

          {match && <MatchReasons reasons={match.reasons} limit={2} className="mt-3" />}

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-08 pt-3.5">
            <span className="text-[11px] text-ink-30">{formatCount(brand.followers)} followers</span>
            {openings > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-semibold text-[#37796C]">
                <Sparkles className="size-3" />
                {openings} open {openings === 1 ? "role" : "roles"}
              </span>
            ) : (
              <span className="text-[11px] text-ink-30">Following only</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

/** "Creators Wanted" row used on brand pages and the opportunities rail. */
export function OpportunityRow({ brand, opportunityId }: { brand: Brand; opportunityId: string }) {
  const opportunity = brand.openOpportunities.find((o) => o.id === opportunityId);
  if (!opportunity) return null;
  const city = CITY_BY_ID.get(opportunity.cityId);

  return (
    <div className="rounded-2xl border border-ink-08 bg-white p-4 transition-colors hover:border-lavender/30">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{opportunity.title}</p>
          <p className="mt-1 text-xs text-ink-50">
            {city?.name}
            {opportunity.remote && " · Remote friendly"} · Closes {opportunity.deadline}
          </p>
        </div>
        <Badge variant="mint" size="sm">
          {opportunity.compensation}
        </Badge>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink-70">{opportunity.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {opportunity.roles.map((r) => (
          <Badge key={r} variant="lavender" size="sm">
            {ROLE_LABELS[r]}
          </Badge>
        ))}
      </div>
    </div>
  );
}
