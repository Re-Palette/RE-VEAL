"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { BrandCard } from "@/components/cards/brand-card";
import { ChipGroup, FilterPanel, MultiChipGroup } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n/context";
import { CITY_BY_ID } from "@/lib/data/geo";
import {
  BEAUTY_CATEGORIES,
  BRAND_TYPES,
  REGIONS,
  ROLES,
  type BeautyCategory,
  type Brand,
  type BrandType,
  type MatchResult,
  type Role,
} from "@/lib/types";

type SortKey = "match" | "openings" | "followers" | "newest";

export function BrandsDirectory({ brands, matches }: { brands: Brand[]; matches: MatchResult[] }) {
  const params = useSearchParams();
  const { t, L } = useI18n();

  const [query, setQuery] = useState("");
  const [type, setType] = useState<BrandType | "all">("all");
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [region, setRegion] = useState<string>("all");
  const [lookingFor, setLookingFor] = useState<Role[]>(() => {
    const initial = params.get("looking") as Role | null;
    return initial && ROLES.includes(initial) ? [initial] : [];
  });
  const [onlyOpen, setOnlyOpen] = useState(params.get("looking") !== null);
  const [sort, setSort] = useState<SortKey>("match");

  const SORTS: { value: SortKey; label: string }[] = [
    { value: "match", label: t("people.sort.match") },
    { value: "openings", label: t("brands.sort.openings") },
    { value: "followers", label: t("people.sort.followers") },
    { value: "newest", label: t("people.sort.newest") },
  ];

  const scoreById = useMemo(() => new Map(matches.map((m) => [m.targetId, m])), [matches]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = brands.filter((brand) => {
      if (type !== "all" && brand.type !== type) return false;
      if (categories.length > 0 && !brand.categories.some((c) => categories.includes(c))) return false;
      if (region !== "all" && CITY_BY_ID.get(brand.cityId)?.region !== region) return false;
      if (lookingFor.length > 0 && !brand.lookingFor.some((r) => lookingFor.includes(r))) return false;
      if (onlyOpen && brand.openOpportunities.length === 0) return false;
      if (q) {
        const haystack = [brand.name, brand.tagline, brand.story, CITY_BY_ID.get(brand.cityId)?.name ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "openings":
          return b.openOpportunities.length - a.openOpportunities.length;
        case "followers":
          return b.followers - a.followers;
        case "newest":
          return b.founded - a.founded;
        default:
          return (scoreById.get(b.id)?.score ?? 0) - (scoreById.get(a.id)?.score ?? 0);
      }
    });
  }, [brands, query, type, categories, region, lookingFor, onlyOpen, sort, scoreById]);

  const activeCount =
    (type !== "all" ? 1 : 0) +
    (categories.length > 0 ? 1 : 0) +
    (region !== "all" ? 1 : 0) +
    (lookingFor.length > 0 ? 1 : 0) +
    (onlyOpen ? 1 : 0) +
    (query ? 1 : 0);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow={t("nav.connect")}
        title={t("brands.title")}
        description={t("brands.description")}
      />

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder={t("brands.searchPlaceholder")}
        resultCount={filtered.length}
        activeCount={activeCount}
        onClear={() => {
          setQuery("");
          setType("all");
          setCategories([]);
          setRegion("all");
          setLookingFor([]);
          setOnlyOpen(false);
        }}
        advancedCount={(region !== "all" ? 1 : 0) + (lookingFor.length > 0 ? 1 : 0) + (onlyOpen ? 1 : 0)}
        advanced={
          <>
            <ChipGroup
              label={t("common.location")}
              tone="sky"
              value={region}
              onChange={setRegion}
              options={[
                { value: "all", label: t("common.worldwide") },
                ...REGIONS.map((r) => ({ value: r as string, label: L.region[r] })),
              ]}
            />
            <MultiChipGroup
              label={t("brands.filter.lookingFor")}
              tone="mint"
              values={lookingFor}
              onToggle={(value) =>
                setLookingFor((current) =>
                  current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
                )
              }
              options={ROLES.map((r) => ({ value: r, label: L.role[r] }))}
            />
            <ChipGroup
              label={t("brands.filter.opportunities")}
              tone="lavender"
              value={onlyOpen ? "open" : "any"}
              onChange={(value) => setOnlyOpen(value === "open")}
              options={[
                { value: "any", label: t("brands.filter.allBrands") },
                { value: "open", label: t("brands.filter.creatorsWanted") },
              ]}
            />
          </>
        }
      >
        <ChipGroup
          label={t("brands.filter.type")}
          value={type}
          onChange={setType}
          options={[
            { value: "all" as const, label: t("brands.filter.allBrands") },
            ...BRAND_TYPES.map((type) => ({ value: type, label: L.brandType[type] })),
          ]}
        />
        <MultiChipGroup
          label={t("common.beautyCategory")}
          values={categories}
          onToggle={(value) =>
            setCategories((current) =>
              current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
            )
          }
          options={BEAUTY_CATEGORIES.map((c) => ({ value: c, label: L.category[c] }))}
        />
        <ChipGroup label={t("common.sort")} value={sort} onChange={setSort} options={SORTS} />
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("brands.empty.title")}
          description={t("brands.empty.description")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((brand) => (
            <BrandCard key={brand.id} brand={brand} match={scoreById.get(brand.id)} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
