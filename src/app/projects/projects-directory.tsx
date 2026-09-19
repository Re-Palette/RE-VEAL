"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ProjectCard } from "@/components/cards/project-card";
import { ChipGroup, FilterPanel, MultiChipGroup } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { CITY_BY_ID } from "@/lib/data/geo";
import { CATEGORY_LABELS, PROJECT_STATUS_LABELS, PROJECT_TYPE_LABELS, REGION_LABELS, ROLE_LABELS } from "@/lib/labels";
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

const SORTS: { value: SortKey; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "newest", label: "Newest" },
  { value: "starting", label: "Starting soonest" },
  { value: "members", label: "Most members" },
];

const STATUSES: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All projects" },
  { value: "recruiting", label: PROJECT_STATUS_LABELS.recruiting },
  { value: "in-progress", label: PROJECT_STATUS_LABELS["in-progress"] },
  { value: "completed", label: PROJECT_STATUS_LABELS.completed },
];

export function ProjectsDirectory({ projects, matches }: { projects: Project[]; matches: MatchResult[] }) {
  const params = useSearchParams();
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
          ...project.cityIds.map((c) => CITY_BY_ID.get(c)?.name ?? ""),
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
        eyebrow="Connect"
        title="Projects"
        description={
          cityFilter
            ? `Projects running in ${CITY_BY_ID.get(cityFilter)?.name}. Real briefs, real crews, real credits.`
            : "Campaigns, photoshoots, product development and brand launches — most of them spanning more than one city."
        }
      />

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder="Search projects by title, city or brief…"
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
              label="Project type"
              tone="lavender"
              value={type}
              onChange={setType}
              options={[
                { value: "all" as const, label: "Any type" },
                ...PROJECT_TYPES.map((t) => ({ value: t, label: PROJECT_TYPE_LABELS[t] })),
              ]}
            />
            <ChipGroup
              label="Location"
              tone="sky"
              value={region}
              onChange={setRegion}
              options={[
                { value: "all", label: "Worldwide" },
                ...REGIONS.map((r) => ({ value: r as string, label: REGION_LABELS[r] })),
              ]}
            />
            <MultiChipGroup
              label="Recruiting role"
              tone="mint"
              values={roles}
              onToggle={(value) =>
                setRoles((current) =>
                  current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
                )
              }
              options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            />
            <ChipGroup
              label="Working style"
              tone="sky"
              value={remoteOnly ? "remote" : "any"}
              onChange={(value) => setRemoteOnly(value === "remote")}
              options={[
                { value: "any", label: "Any" },
                { value: "remote", label: "Remote friendly" },
              ]}
            />
          </>
        }
      >
        <ChipGroup label="Status" value={status} onChange={setStatus} options={STATUSES} />
        <MultiChipGroup
          label="Beauty category"
          values={categories}
          onToggle={(value) =>
            setCategories((current) =>
              current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
            )
          }
          options={BEAUTY_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        />
        <ChipGroup label="Sort" value={sort} onChange={setSort} options={SORTS} />
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects match those filters"
          description="Widen the category or region — or check the completed projects to see what has already been built here."
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
