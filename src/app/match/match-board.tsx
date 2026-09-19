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

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "person", label: "People" },
  { value: "brand", label: "Brands" },
  { value: "project", label: "Projects" },
  { value: "event", label: "Events" },
];

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
  const [scope, setScope] = useState<Scope>("all");
  const [ai, setAi] = useState<AiMatchResponse | undefined>();

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
        eyebrow="Match"
        title="Beauty Collaboration Matching"
        description="Not a follower feed and not a dating app. RE:VEAL scores people, brands, projects and events against your skills, goals, languages and where you want to work — and always shows the reasoning."
      />

      <AiMatch onResults={setAi} autoOpen={params.get("ai") === "1"} />

      <section className="mt-10">
        <SectionHeader
          eyebrow={ai ? "AI Match results" : "Your strongest matches"}
          title={ai ? `${active.length} results for what you described` : "Ranked for you right now"}
          description={
            ai
              ? "Ordered by how much of your request each result satisfies, not by score alone — so a result matching two things you asked for sits above a higher-scoring one that matches one. The first chip on each card says which."
              : "Scored on skills, beauty category, location, language, goals, availability and open opportunities."
          }
          action={<ChipGroup value={scope} onChange={setScope} options={SCOPES} />}
        />

        {visible.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No matches in that scope"
            description="Switch to Everything, or describe what you are looking for in your own words above."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.slice(0, 24).map(render)}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        {[
          {
            title: "What goes into a score",
            body: "Skills, interests, beauty category, city and target cities, shared languages, experience level, availability, stated goals, and whether either side is open to the kind of collaboration the other wants.",
          },
          {
            title: "Why the reasons matter",
            body: "A number on its own is not actionable. Every match on RE:VEAL carries the specific overlaps behind it, so you can judge whether the reasoning holds before you reach out.",
          },
          {
            title: "Complementary, not identical",
            body: "The strongest collaborations are rarely between two people who do the same thing. Scoring rewards skills that fill a gap in your own set as much as skills you share.",
          },
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
