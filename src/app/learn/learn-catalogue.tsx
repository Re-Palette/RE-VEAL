"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { CourseCard } from "@/components/cards/content-cards";
import { ChipGroup, FilterPanel } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n/context";
import { LEARN_TRACKS, type Course, type LearnTrack } from "@/lib/types";

type Level = Course["level"] | "all";
type SortKey = "popular" | "rating" | "shortest";

export function LearnCatalogue({ courses }: { courses: Course[] }) {
  const { t, L } = useI18n();
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<LearnTrack | "all">("all");
  const [level, setLevel] = useState<Level>("all");
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = courses.filter((course) => {
      if (track !== "all" && course.track !== track) return false;
      if (level !== "all" && course.level !== level) return false;
      if (q && !`${course.title} ${course.summary} ${course.description}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "shortest":
          return a.durationMinutes - b.durationMinutes;
        default:
          return b.enrolled - a.enrolled;
      }
    });
  }, [courses, query, track, level, sort]);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow={t("nav.grow")}
        title={t("learn.title")}
        description={t("learn.description")}
      />

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder={t("learn.searchPlaceholder")}
        resultCount={filtered.length}
        activeCount={(track !== "all" ? 1 : 0) + (level !== "all" ? 1 : 0) + (query ? 1 : 0)}
        onClear={() => {
          setQuery("");
          setTrack("all");
          setLevel("all");
        }}
      >
        <ChipGroup
          label={t("learn.filter.track")}
          value={track}
          onChange={setTrack}
          options={[
            { value: "all" as const, label: t("learn.filter.allTracks") },
            ...LEARN_TRACKS.map((track) => ({ value: track, label: L.learnTrack[track] })),
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ChipGroup
            label={t("learn.filter.level")}
            tone="lavender"
            value={level}
            onChange={setLevel}
            options={[
              { value: "all", label: t("learn.filter.anyLevel") },
              { value: "beginner", label: L.courseLevel.beginner },
              { value: "intermediate", label: L.courseLevel.intermediate },
              { value: "advanced", label: L.courseLevel.advanced },
            ]}
          />
          <ChipGroup
            label={t("common.sort")}
            tone="sky"
            value={sort}
            onChange={setSort}
            options={[
              { value: "popular", label: t("learn.sort.popular") },
              { value: "rating", label: t("learn.sort.rating") },
              { value: "shortest", label: t("learn.sort.shortest") },
            ]}
          />
        </div>
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={t("learn.empty.title")}
          description={t("learn.empty.description")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
