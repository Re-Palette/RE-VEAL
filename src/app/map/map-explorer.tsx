"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Globe, Sparkles, X } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { WorldMap } from "@/components/map/world-map";
import { AUDIENCE_FILTERS, matchesAudience, type AudienceFilter, type MapEntity } from "@/components/map/map-entities";
import type { MapMarker } from "@/components/map/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/misc";
import { MatchBadge, MatchReasons } from "@/components/match/match-score";
import { useI18n } from "@/lib/i18n/context";
import type { UIKey } from "@/lib/i18n";
import { COUNTRY_BY_ID } from "@/lib/data/geo";
import { BEAUTY_CATEGORIES, REGIONS, type BeautyCategory, type City, type MatchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CityInfo {
  city: City;
  match?: MatchResult;
  personalCounts: { projects: number; brands: number; events: number; people: number };
  totals: { projects: number; brands: number; events: number; people: number };
}

const KIND_KEY: Record<MapEntity["kind"], UIKey> = {
  person: "common.people",
  brand: "common.brands",
  project: "common.projects",
  event: "common.events",
};

const KIND_ORDER: MapEntity["kind"][] = ["project", "brand", "person", "event"];

export function MapExplorer({
  cities,
  entities,
  viewerCityName,
  viewerRole,
  viewerCategories,
}: {
  cities: CityInfo[];
  entities: MapEntity[];
  viewerCityName: string;
  viewerRole: string;
  viewerCategories: BeautyCategory[];
}) {
  const params = useSearchParams();
  const { t, L, city: cityName } = useI18n();
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(params.get("city") ?? undefined);
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [region, setRegion] = useState<string>("worldwide");
  const [personalised, setPersonalised] = useState(true);

  const toggleCategory = (category: BeautyCategory) =>
    setCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
    );

  const filtered = useMemo(
    () =>
      entities.filter((entity) => {
        if (!matchesAudience(entity, audience)) return false;
        if (categories.length > 0 && !entity.categories.some((c) => categories.includes(c))) return false;
        return true;
      }),
    [entities, audience, categories],
  );

  const visibleCities = useMemo(
    () => cities.filter((c) => region === "worldwide" || c.city.region === region),
    [cities, region],
  );

  // Marker weight always reflects the current filters — the map is the query
  // result, not a static illustration.
  const perCity = useMemo(() => {
    const map = new Map<string, MapEntity[]>();
    for (const entity of filtered) {
      for (const cityId of entity.cityIds) {
        const list = map.get(cityId);
        if (list) list.push(entity);
        else map.set(cityId, [entity]);
      }
    }
    return map;
  }, [filtered]);

  const markers: MapMarker[] = useMemo(
    () =>
      visibleCities.flatMap((info) => {
        const list = perCity.get(info.city.id) ?? [];
        if (list.length === 0) return [];
        return [
          {
            city: info.city,
            count: list.length,
            score: info.match?.score ?? 60,
            breakdown: personalised ? info.personalCounts : info.totals,
          },
        ];
      }),
    [visibleCities, perCity, personalised],
  );

  const selected = selectedCityId ? cities.find((c) => c.city.id === selectedCityId) : undefined;
  const selectedEntities = selectedCityId ? (perCity.get(selectedCityId) ?? []) : [];

  const topCities = useMemo(
    () =>
      [...visibleCities]
        .filter((c) => (perCity.get(c.city.id)?.length ?? 0) > 0)
        .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
        .slice(0, 5),
    [visibleCities, perCity],
  );

  const activeFilters = (categories.length > 0 ? 1 : 0) + (audience !== "all" ? 1 : 0) + (region !== "worldwide" ? 1 : 0);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow={t("map.eyebrow")}
        title={t("map.title")}
        description={t("map.description")}
        action={
          <label className="flex cursor-pointer items-center gap-2.5 rounded-full border border-ink-15 bg-white/70 px-4 py-2 text-sm">
            <Sparkles className={cn("size-4", personalised ? "text-lavender" : "text-ink-30")} />
            <span className="font-medium">{t("map.personalise")}</span>
            <Switch
              checked={personalised}
              onCheckedChange={setPersonalised}
              aria-label={t("map.personaliseAria")}
            />
          </label>
        }
      />

      {/* Filters ---------------------------------------------------------- */}
      <div className="mb-5 space-y-3.5 rounded-panel border border-ink-08 bg-white/70 p-4 backdrop-blur">
        <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {AUDIENCE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setAudience(filter.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                audience === filter.id
                  ? "bg-ink text-white shadow-soft"
                  : "border border-ink-08 bg-white text-ink-50 hover:border-lavender/40 hover:text-ink",
              )}
            >
              {t(filter.labelKey)}
            </button>
          ))}
        </div>

        <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {BEAUTY_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all",
                categories.includes(category)
                  ? "border-lavender/40 bg-lavender-soft text-[#4B3BA0]"
                  : "border-ink-08 bg-white text-ink-50 hover:border-ink-30 hover:text-ink",
              )}
            >
              {L.category[category]}
            </button>
          ))}
        </div>

        <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {["worldwide", ...REGIONS].map((key) => (
            <button
              key={key}
              onClick={() => setRegion(key)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all",
                region === key
                  ? "border-sky/40 bg-sky-soft text-[#2F5E9E]"
                  : "border-ink-08 bg-white text-ink-50 hover:border-ink-30 hover:text-ink",
              )}
            >
              {key === "worldwide" ? t("common.worldwide") : L.region[key as keyof typeof L.region]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end">
          <span className="flex items-center gap-3 text-xs text-ink-50">
            <span className="font-semibold text-ink">
              {t("map.resultsAcross", { count: filtered.length, cities: markers.length })}
            </span>
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setAudience("all");
                  setCategories([]);
                  setRegion("worldwide");
                }}
                className="inline-flex items-center gap-1 font-medium text-ink-30 transition-colors hover:text-lavender"
              >
                <X className="size-3.5" />
                {t("common.clear")}
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Map + panel ------------------------------------------------------ */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <WorldMap
          markers={markers}
          selectedCityId={selectedCityId}
          onSelectCity={setSelectedCityId}
          focus={region}
          personalised={personalised}
          className="aspect-[4/3] w-full self-start sm:aspect-[2/1] xl:sticky xl:top-24 xl:aspect-[2.1/1]"
        />

        <aside className="min-w-0">
          {selected ? (
            <CityPanel
              info={selected}
              entities={selectedEntities}
              personalised={personalised}
              onClose={() => setSelectedCityId(undefined)}
            />
          ) : (
            <RecommendedPanel
              cities={topCities}
              onSelect={setSelectedCityId}
              viewerCityName={viewerCityName}
              viewerRole={viewerRole}
              personalised={personalised}
            />
          )}
        </aside>
      </div>
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */

function RecommendedPanel({
  cities,
  onSelect,
  viewerCityName,
  viewerRole,
  personalised,
}: {
  cities: CityInfo[];
  onSelect: (id: string) => void;
  viewerCityName: string;
  viewerRole: string;
  personalised: boolean;
}) {
  const { t, city: cityName, content } = useI18n();
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-ink-08 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-30">
          {personalised ? t("map.panel.recommendedEyebrow") : t("map.panel.activeEyebrow")}
        </p>
        <h2 className="mt-2 font-display text-lg font-semibold tracking-[-0.02em]">
          {personalised
            ? t("map.panel.bestCities", { role: viewerRole, city: viewerCityName })
            : t("map.panel.whereWork")}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-50">
          {t("map.panel.selectHint")}
        </p>
      </div>

      <ul className="flex-1 divide-y divide-ink-08 overflow-y-auto">
        {cities.map((info) => (
          <li key={info.city.id}>
            <button
              onClick={() => onSelect(info.city.id)}
              className="group flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-lavender-soft/35"
            >
              <Avatar seed={info.city.id} name={info.city.name} size="md" square />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-display text-[15px] font-semibold">
                    {cityName(info.city.id)} {COUNTRY_BY_ID.get(info.city.countryId)?.flag}
                  </span>
                  {info.match && <MatchBadge score={info.match.score} className="ml-auto" />}
                </span>
                <span className="mt-1 block line-clamp-2 text-[13px] leading-relaxed text-ink-50">
                  {content(`${info.city.id}.tagline`, info.city.tagline)}
                </span>
                {info.match && <MatchReasons reasons={info.match.reasons} limit={2} className="mt-2" />}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-ink-08 p-4">
        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-50">
          <Globe className="mt-0.5 size-4 shrink-0 text-ink-30" />
          {t("map.panel.note")}
        </p>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */

function CityPanel({
  info,
  entities,
  personalised,
  onClose,
}: {
  info: CityInfo;
  entities: MapEntity[];
  personalised: boolean;
  onClose: () => void;
}) {
  const { t, L, city: cityName, content } = useI18n();
  const counts = personalised ? info.personalCounts : info.totals;
  const country = COUNTRY_BY_ID.get(info.city.countryId);
  const grouped = KIND_ORDER.map((kind) => ({
    kind,
    items: entities.filter((e) => e.kind === kind).sort((a, b) => b.score - a.score),
  })).filter((group) => group.items.length > 0);

  return (
    <Card className="flex h-full max-h-[80vh] flex-col overflow-hidden xl:max-h-none">
      <div className="relative shrink-0 border-b border-ink-08 p-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-30 transition-colors hover:bg-ink-08 hover:text-ink"
          aria-label={t("map.city.close")}
        >
          <X className="size-4" />
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-30">
          {country?.name} · {L.region[info.city.region]}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
            {cityName(info.city.id)} {country?.flag}
          </h2>
          {info.match && <MatchBadge score={info.match.score} showLabel />}
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-50">
          {content(`${info.city.id}.tagline`, info.city.tagline)}
        </p>

        <dl className="mt-4 grid grid-cols-4 gap-2">
          {[
            [t("common.projects"), counts.projects],
            [t("common.brands"), counts.brands],
            [t("common.events"), counts.events],
            [t("common.people"), counts.people],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl bg-canvas px-2 py-2.5 text-center">
              <dd className="font-display text-lg font-semibold leading-none">{value as number}</dd>
              <dt className="mt-1 text-[10px] uppercase tracking-[0.1em] text-ink-30">{label}</dt>
            </div>
          ))}
        </dl>

        {info.match && info.match.reasons.length > 0 && (
          <div className="mt-4 rounded-2xl bg-lavender-soft/50 p-3.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4B3BA0]">
              {t("map.city.why")}
            </p>
            <MatchReasons reasons={info.match.reasons} limit={3} />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {grouped.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-50">
            {t("map.city.nothing")}
          </p>
        ) : (
          grouped.map((group) => (
            <section key={group.kind} className="border-b border-ink-08 last:border-0">
              <h3 className="sticky top-0 z-10 bg-white/90 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-30 backdrop-blur">
                {t(KIND_KEY[group.kind])} · {group.items.length}
              </h3>
              <ul className="px-2 pb-2">
                {group.items.slice(0, 8).map((entity) => (
                  <li key={entity.id}>
                    <Link
                      href={entity.href}
                      className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-lavender-soft/35"
                    >
                      <Avatar
                        seed={entity.seed}
                        name={entity.name}
                        size="sm"
                        square={entity.kind !== "person"}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium group-hover:text-lavender">
                            {entity.name}
                          </span>
                          {entity.recruiting && (
                            <Badge variant="mint" size="sm" className="shrink-0">
                              {t("common.open")}
                            </Badge>
                          )}
                        </span>
                        <span className="block truncate text-xs text-ink-50">{entity.subtitle}</span>
                        <span className="mt-1 block line-clamp-2 text-[12px] leading-relaxed text-ink-50">
                          {entity.detail}
                        </span>
                      </span>
                      <MatchBadge score={entity.score} className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-ink-08 p-4">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/projects?city=${info.city.id}`}>
            {t("map.city.seeProjects", { city: cityName(info.city.id) })}
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
