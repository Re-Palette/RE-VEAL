"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { CourseCard } from "@/components/cards/content-cards";
import { ChipGroup, FilterPanel } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { LEARN_TRACK_LABELS } from "@/lib/labels";
import { LEARN_TRACKS, type Course, type LearnTrack } from "@/lib/types";

type Level = Course["level"] | "all";
type SortKey = "popular" | "rating" | "shortest";

export function LearnCatalogue({ courses }: { courses: Course[] }) {
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
        eyebrow="Grow"
        title="Learn"
        description="The parts of the beauty industry nobody teaches properly: margins, claims, shade development, retail readiness, and the craft underneath all of it."
      />

      <FilterPanel
        query={query}
        onQueryChange={setQuery}
        placeholder="Search courses…"
        resultCount={filtered.length}
        activeCount={(track !== "all" ? 1 : 0) + (level !== "all" ? 1 : 0) + (query ? 1 : 0)}
        onClear={() => {
          setQuery("");
          setTrack("all");
          setLevel("all");
        }}
      >
        <ChipGroup
          label="Track"
          value={track}
          onChange={setTrack}
          options={[
            { value: "all" as const, label: "All tracks" },
            ...LEARN_TRACKS.map((t) => ({ value: t, label: LEARN_TRACK_LABELS[t] })),
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ChipGroup
            label="Level"
            tone="lavender"
            value={level}
            onChange={setLevel}
            options={[
              { value: "all", label: "Any level" },
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
          />
          <ChipGroup
            label="Sort"
            tone="sky"
            value={sort}
            onChange={setSort}
            options={[
              { value: "popular", label: "Most enrolled" },
              { value: "rating", label: "Highest rated" },
              { value: "shortest", label: "Shortest" },
            ]}
          />
        </div>
      </FilterPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No courses match"
          description="Try another track, or clear the level filter."
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
