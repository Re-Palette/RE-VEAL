"use client";

import Link from "next/link";
import { CalendarRange, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { MatchBadge, MatchReasons } from "@/components/match/match-score";
import { useI18n } from "@/lib/i18n/context";
import type { MatchResult, Project } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

const STATUS_VARIANT = {
  recruiting: "mint",
  "in-progress": "sky",
  completed: "default",
} as const;

export function ProjectCard({ project, match }: { project: Project; match?: MatchResult }) {
  const { t, L, city, content, language } = useI18n();
  const cities = project.cityIds.map((id) => city(id));
  const openSlots = project.roleSlots.filter((s) => s.filled < s.count);
  const filledTotal = project.roleSlots.reduce((sum, s) => sum + s.filled, 0);
  const capacityTotal = project.roleSlots.reduce((sum, s) => sum + s.count, 0) || project.capacity;

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <Link href={`/projects/${project.id}`} className="flex h-full flex-col">
        <div className="relative h-32 shrink-0" style={gradientStyle(project.coverSeed)}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-white/70" />
          <div className="absolute inset-x-4 top-3 flex items-start justify-between gap-2">
            <Badge variant={STATUS_VARIANT[project.status]} size="sm" className="bg-white/85 backdrop-blur">
              {L.projectStatus[project.status]}
            </Badge>
            {match && <MatchBadge score={match.score} className="bg-white/85 backdrop-blur" />}
          </div>
          <p className="absolute bottom-3 left-4 right-4 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-70">
            {project.code}
          </p>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.015em]">
            {content(`${project.id}.title`, project.title)}
          </h3>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-50">
            <MapPin className="size-3.5 shrink-0 text-ink-30" />
            <span className="truncate">{cities.join(" × ")}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-50">
            <CalendarRange className="size-3.5 shrink-0 text-ink-30" />
            {formatDateRange(project.startDate, project.endDate, language)}
          </p>

          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-70">
            {content(`${project.id}.summary`, project.summary)}
          </p>

          {openSlots.length > 0 && (
            <div className="mt-3.5">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
                {t("projectDetail.recruiting")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {openSlots.slice(0, 4).map((slot) => (
                  <Badge key={slot.role} variant="lavender" size="sm">
                    {L.role[slot.role]}
                    <span className="opacity-60">{slot.count - slot.filled}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {match && <MatchReasons reasons={match.reasons} limit={2} className="mt-3" />}

          <div className="mt-auto pt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] text-ink-50">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 text-ink-30" />
                {t("projects.membersCount", { filled: filledTotal, total: capacityTotal })}
              </span>
              <span>{L.projectType[project.type]}</span>
            </div>
            <Progress value={(filledTotal / capacityTotal) * 100} />
          </div>
        </div>
      </Link>
    </Card>
  );
}
