"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { AiMatch, type AiMatchResponse } from "@/app/match/ai-match";
import { PersonCard } from "@/components/cards/person-card";
import { BrandCard } from "@/components/cards/brand-card";
import { ProjectCard } from "@/components/cards/project-card";
import { EventCard } from "@/components/cards/event-card";
import { ChipGroup } from "@/components/filters/chip-group";
import { Card } from "@/components/ui/card";
import { EmptyState, SectionHeader } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n/context";
import type {
  BeautyEvent,
  Brand,
  ConnectionStatus,
  MatchResult,
  MatchTargetKind,
  PersonView,
  Project,
} from "@/lib/types";

type Scope = "all" | MatchTargetKind;

export function MatchBoard({
  people,
  brands,
  projects,
  events,
  matches,
  connections,
}: {
  people: PersonView[];
  brands: Brand[];
  projects: Project[];
  events: BeautyEvent[];
  matches: Record<string, MatchResult[]>;
  connections: Record<string, ConnectionStatus>;
}) {
  const params = useSearchParams();
  const { t } = useI18n();
  const [scope, setScope] = useState<Scope>("all");
  const [ai, setAi] = useState<AiMatchResponse | undefined>();

  const SCOPES: { value: Scope; label: string }[] = [
    { value: "all", label: t("match.scope.all") },
    { value: "person", label: t("common.people") },
    { value: "brand", label: t("common.brands") },
    { value: "project", label: t("common.projects") },
    { value: "event", label: t("common.events") },
  ];

  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const eventById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  const baseline = useMemo(() => {
    const all = [...matches.person, ...matches.brand, ...matches.project, ...matches.event];
    return all.sort((a, b) => b.score - a.score);
  }, [matches]);

  const active = ai?.results ?? baseline;
  const visible = scope === "all" ? active : active.filter((m) => m.targetKind === scope);

  const render = (match: MatchResult) => {
    switch (match.targetKind) {
      case "person": {
        const person = personById.get(match.targetId);
        return person ? (
          <PersonCard
            key={match.id}
            person={person}
            match={match}
            connection={connections[person.id] ?? "none"}
          />
        ) : null;
      }
      case "brand": {
        const brand = brandById.get(match.targetId);
        return brand ? <BrandCard key={match.id} brand={brand} match={match} /> : null;
      }
      case "project": {
        const project = projectById.get(match.targetId);
        return project ? <ProjectCard key={match.id} project={project} match={match} /> : null;
      }
      case "event": {
        const event = eventById.get(match.targetId);
        return event ? <EventCard key={match.id} event={event} match={match} /> : null;
      }
      default:
        return null;
    }
  };

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow={t("nav.match")}
        title={t("match.title")}
        description={t("match.description")}
      />

      <AiMatch onResults={setAi} autoOpen={params.get("ai") === "1"} />

      <section className="mt-10">
        <SectionHeader
          eyebrow={ai ? t("match.results.eyebrowAi") : t("match.results.eyebrowBase")}
          title={
            ai ? t("match.results.titleAi", { count: active.length }) : t("match.results.titleBase")
          }
          description={ai ? t("match.results.descriptionAi") : t("match.results.descriptionBase")}
          action={<ChipGroup value={scope} onChange={setScope} options={SCOPES} />}
        />

        {visible.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title={t("match.empty.title")}
            description={t("match.empty.description")}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.slice(0, 24).map(render)}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        {[
          { title: t("match.explain.1.title"), body: t("match.explain.1.body") },
          { title: t("match.explain.2.title"), body: t("match.explain.2.body") },
          { title: t("match.explain.3.title"), body: t("match.explain.3.body") },
        ].map((item) => (
          <Card key={item.title} className="p-6">
            <h3 className="font-display text-base font-semibold tracking-[-0.015em]">{item.title}</h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-50">{item.body}</p>
          </Card>
        ))}
      </section>
    </PageContainer>
  );
}
