"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { PostCard } from "@/components/cards/content-cards";
import { PersonCard } from "@/components/cards/person-card";
import { BrandCard } from "@/components/cards/brand-card";
import { ProjectCard } from "@/components/cards/project-card";
import { EventCard } from "@/components/cards/event-card";
import { ChipGroup, MultiChipGroup } from "@/components/filters/chip-group";
import { EmptyState, SectionHeader } from "@/components/ui/misc";
import { CATEGORY_LABELS, POST_KIND_LABELS } from "@/lib/labels";
import { BEAUTY_CATEGORIES, POST_KINDS, type BeautyCategory, type BeautyEvent, type Brand, type MatchResult, type PersonView, type Post, type PostKind, type Project } from "@/lib/types";

type Kind = PostKind | "all";

/**
 * Discover is deliberately not an endless scroll. Each category is a finite,
 * editorially framed shelf, and the rails underneath point back at people,
 * brands and projects rather than keeping you reading.
 */
export function DiscoverFeed({
  posts,
  newCreators,
  newBrands,
  projects,
  events,
  matches,
}: {
  posts: Post[];
  newCreators: PersonView[];
  newBrands: Brand[];
  projects: Project[];
  events: BeautyEvent[];
  matches: Record<string, MatchResult[]>;
}) {
  const [kind, setKind] = useState<Kind>("all");
  const [categories, setCategories] = useState<BeautyCategory[]>([]);

  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        if (kind !== "all" && post.kind !== kind) return false;
        if (categories.length > 0 && !post.categories.some((c) => categories.includes(c))) return false;
        return true;
      }),
    [posts, kind, categories],
  );

  const [featured, ...rest] = filtered;
  const scoreFor = (list: MatchResult[], id: string) => list.find((m) => m.targetId === id);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Discover"
        title="What is happening in beauty right now"
        description="Categories, not an infinite feed. Read what is worth reading, then go and meet the people behind it."
      />

      <div className="mb-7 space-y-4 rounded-panel border border-ink-08 bg-white/70 p-4 backdrop-blur sm:p-5">
        <ChipGroup
          label="Category"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all" as const, label: "Everything" },
            ...POST_KINDS.map((k) => ({ value: k, label: POST_KIND_LABELS[k] })),
          ]}
        />
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Nothing in that combination yet"
          description="Clear the beauty category filter, or switch to Everything."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {featured && (
            <div className="lg:col-span-2 lg:row-span-2 2xl:col-span-2">
              <PostCard post={featured} featured />
            </div>
          )}
          {rest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Rails ------------------------------------------------------------ */}
      <section className="mt-14">
        <SectionHeader
          eyebrow="New Creators"
          title="People who joined recently"
          action={<RailLink href="/people" label="All people" />}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {newCreators.map((person) => (
            <PersonCard key={person.id} person={person} match={scoreFor(matches.person, person.id)} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeader
          eyebrow="New Brands"
          title="Labels worth knowing about"
          action={<RailLink href="/brands" label="All brands" />}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {newBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} match={scoreFor(matches.brand, brand.id)} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeader
          eyebrow="Projects"
          title="Open calls closing soon"
          action={<RailLink href="/projects?status=recruiting" label="All projects" />}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} match={scoreFor(matches.project, project.id)} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeader
          eyebrow="Events"
          title="Next up around the world"
          action={<RailLink href="/events" label="All events" />}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} match={scoreFor(matches.event, event.id)} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

function RailLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-70 transition-colors hover:text-lavender"
    >
      {label}
      <ArrowRight className="size-4" />
    </Link>
  );
}
