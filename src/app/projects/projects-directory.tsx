"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ProjectCard } from "@/components/cards/project-card";
import { ChipGroup, FilterPanel, MultiChipGroup } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n/context";
import { CITY_BY_ID } from "@/lib/data/geo";
import {
  BEAUTY_CATEGORIES,
  PROJECT_TYPES,
  REGIONS,
  ROLES,
  type BeautyCategory,
  type MatchResult,
  type Project,
  type ProjectStatus,
  type ProjectType,
  type Role,
} from "@/lib/types";

type SortKey = "match" | "newest" | "starting" | "members";

export function ProjectsDirectory({ projects, matches }: { projects: Project[]; matches: MatchResult[] }) {
  const params = useSearchParams();
  const { t, L, city: cityName } = useI18n();
  const cityFilter = params.get("city") ?? undefined;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">(
    (params.get("status") as ProjectStatus | null) ?? "all",
  );
  const [categories, setCategories] = useState<BeautyCategory[]>([]);
  const [type, setType] = useState<ProjectType | "all">("all");
  const [region, setRegion] = useState<string>("all");
  const [roles, setRoles] = useState<Role[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("match");

  const SORTS: { value: SortKey; label: string }[] = [
    { value: "match", label: t("people.sort.match") },
    { value: "newest", label: t("people.sort.newest") },
    { value: "starting", label: t("projects.sort.starting") },
    { value: "members", label: t("projects.sort.members") },
  ];

  const STATUSES: { value: ProjectStatus | "all"; label: string }[] = [
    { value: "all", label: t("projects.filter.allProjects") },
    { value: "recruiting", label: L.projectStatus.recruiting },
    { value: "in-progress", label: L.projectStatus["in-progress"] },
    { value: "completed", label: L.projectStatus.completed },
  ];

  const scoreById = useMemo(() => new Map(matches.map((m) => [m.targetId, m])), [matches]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = projects.filter((project) => {
      if (cityFilter && !project.cityIds.includes(cityFilter)) return false;
      if (status !== "all" && project.status !== status) return false;
      if (type !== "all" && project.type !== type) return false;
      if (categories.length > 0 && !project.categories.some((c) => categories.includes(c))) return false;
      if (region !== "all" && !project.cityIds.some((c) => CITY_BY_ID.get(c)?.region === region)) return false;
      if (remoteOnly && !project.remoteFriendly) return false;
      if (
        roles.length > 0 &&
        !project.roleSlots.some((slot) => roles.includes(slot.role) && slot.filled < slot.count)
      )
        return false;
      if (q) {
        const haystack = [
          project.title,
          project.code,
          project.summary,
          project.overview,
          ...project.cityIds.map((c) => cityName(c)),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "starting":
          return a.startDate.localeCompare(b.startDate);
        case "members":
          return b.memberIds.length - a.memberIds.length;
        default:
          return (scoreById.get(b.id)?.score ?? 0) - (scoreById.get(a.id)?.score ?? 0);
      }
    });
  }, [projects, query, status, type, categories, region, roles, remoteOnly, sort, scoreById, cityFilter]);

  const activeCount =
    (status !== "all" ? 1 : 0) +
    (type !== "all" ? 1 : 0) +
    (categories.length > 0 ? 1 : 0) +
    (region !== "all" ? 1 : 0) +
    (roles.length > 0 ? 1 : 0) +
    (remoteOnly ? 1 : 0) +
    (query ? 1 : 0);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow={t("nav.connect")}
        title={t("projects.title")}
        description={
          cityFilter
            ? t("projects.descriptionCity", { city: cityName(cityFilter) })
            : t("projects.description")
        }
      />

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder={t("projects.searchPlaceholder")}
        resultCount={filtered.length}
        activeCount={activeCount}
        onClear={() => {
          setQuery("");
          setStatus("all");
          setType("all");
          setCategories([]);
          setRegion("all");
          setRoles([]);
          setRemoteOnly(false);
        }}
        advancedCount={(region !== "all" ? 1 : 0) + (roles.length > 0 ? 1 : 0) + (remoteOnly ? 1 : 0) + (type !== "all" ? 1 : 0)}
        advanced={
          <>
            <ChipGroup
              label={t("projects.filter.type")}
              tone="lavender"
              value={type}
              onChange={setType}
              options={[
                { value: "all" as const, label: t("projects.filter.anyType") },
                ...PROJECT_TYPES.map((type) => ({ value: type, label: L.projectType[type] })),
              ]}
            />
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
              label={t("projects.filter.recruitingRole")}
              tone="mint"
              values={roles}
              onToggle={(value) =>
                setRoles((current) =>
                  current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
                )
              }
              options={ROLES.map((r) => ({ value: r, label: L.role[r] }))}
            />
            <ChipGroup
              label={t("projects.filter.workingStyle")}
              tone="sky"
              value={remoteOnly ? "remote" : "any"}
              onChange={(value) => setRemoteOnly(value === "remote")}
              options={[
                { value: "any", label: t("common.any") },
                { value: "remote", label: t("common.remoteFriendly") },
              ]}
            />
          </>
        }
      >
        <ChipGroup label={t("projects.filter.status")} value={status} onChange={setStatus} options={STATUSES} />
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
          icon={Briefcase}
          title={t("projects.empty.title")}
          description={t("projects.empty.description")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} match={scoreById.get(project.id)} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
