import Link from "next/link";
import { Award, BadgeCheck, Globe2, Languages, MapPin, MessageCircle, Target } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { ConnectButton } from "@/components/actions/connect-button";
import { MatchReasons, MatchRing } from "@/components/match/match-score";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { PortfolioCard } from "@/components/cards/content-cards";
import { ProjectCard } from "@/components/cards/project-card";
import { EventCard } from "@/components/cards/event-card";
import { PersonRow } from "@/components/cards/person-card";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { interestLabel, skillLabel } from "@/lib/data/taxonomy";
import {
  AVAILABILITY_LABELS,
  CATEGORY_LABELS,
  EXPERIENCE_LABELS,
  LANGUAGE_LABELS,
  OPEN_TO_LABELS,
  ROLE_LABELS,
} from "@/lib/labels";
import type {
  BeautyEvent,
  Brand,
  ConnectionStatus,
  MatchResult,
  PersonView,
  PortfolioItem,
  Project,
} from "@/lib/types";
import { formatCount } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

export function ProfileView({
  person,
  match,
  connection,
  portfolio,
  projects,
  events,
  brands,
  collaborators,
  isSelf = false,
}: {
  person: PersonView;
  match?: MatchResult;
  connection: ConnectionStatus;
  portfolio: PortfolioItem[];
  projects: Project[];
  events: BeautyEvent[];
  brands: Brand[];
  collaborators: PersonView[];
  isSelf?: boolean;
}) {
  const p = person.profile;
  const city = CITY_BY_ID.get(p.cityId);
  const country = COUNTRY_BY_ID.get(p.countryId);

  return (
    <PageContainer>
      {/* Header ----------------------------------------------------------- */}
      <Card className="overflow-hidden">
        <div className="relative h-36 sm:h-44" style={gradientStyle(person.avatarSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-16 flex flex-wrap items-end justify-between gap-5 sm:-mt-20">
            <div className="min-w-0">
              <Avatar seed={person.avatarSeed} name={person.name} size="2xl" ring className="shadow-lift" />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">
                  {person.name}
                </h1>
                {person.verified && <BadgeCheck className="size-5 text-sky" />}
                <Badge variant="mint" size="sm">
                  {AVAILABILITY_LABELS[p.availability]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-50">@{person.handle}</p>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-70">{p.headline}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-ink-30" />
                  {city?.name}, {country?.name} {country?.flag}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="size-4 text-ink-30" />
                  {ROLE_LABELS[p.role]} · {EXPERIENCE_LABELS[p.experience]} · {p.yearsActive}y
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="size-4 text-ink-30" />
                  {p.languages.map((l) => LANGUAGE_LABELS[l]).join(" · ")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {match && !isSelf && <MatchRing score={match.score} />}
              {isSelf ? (
                <Button asChild variant="outline">
                  <Link href="/settings">Edit profile</Link>
                </Button>
              ) : (
                <>
                  <ConnectButton initialStatus={connection} name={person.name} size="md" variant="primary" />
                  <Button asChild variant="outline">
                    <Link href="/messages">
                      <MessageCircle />
                      Message
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-ink-08 pt-5">
            {[
              ["Followers", formatCount(p.followers)],
              ["Following", formatCount(p.following)],
              ["Connections", formatCount(p.connections)],
              ["Projects", String(projects.length)],
              ["Portfolio", String(portfolio.length)],
            ].map(([label, value]) => (
              <div key={label}>
                <dd className="font-display text-lg font-semibold tracking-[-0.02em]">{value}</dd>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-ink-30">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:gap-8">
        {/* Sidebar -------------------------------------------------------- */}
        <aside className="space-y-5">
          {match && !isSelf && (
            <Card sheen className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                Why this matches you
              </h2>
              <p className="mb-4 text-[13px] leading-relaxed text-ink-70">{match.narrative}</p>
              <MatchReasons reasons={match.reasons} limit={5} variant="list" />
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">About</h2>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-70">{p.bio}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              <Target className="size-4 text-lavender" />
              Open to
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {p.openTo.map((o) => (
                <Badge key={o} variant="lavender" size="md">
                  {OPEN_TO_LABELS[o]}
                </Badge>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              Goals
            </h3>
            <ul className="space-y-2">
              {p.goals.map((goal) => (
                <li key={goal} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-70">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full gradient-accent" />
                  {goal}
                </li>
              ))}
            </ul>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              Wants to work in
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {p.targetCityIds.map((id) => (
                <Link key={id} href={`/map?city=${id}`}>
                  <Badge variant="sky" size="sm">
                    {CITY_BY_ID.get(id)?.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {p.skillIds.map((id) => (
                <Link key={id} href={`/people?skill=${id}`}>
                  <Badge variant="default" size="md">
                    {skillLabel(id)}
                  </Badge>
                </Link>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              Categories
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {p.categories.map((c) => (
                <Badge key={c} variant="blush" size="sm">
                  {CATEGORY_LABELS[c]}
                </Badge>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              Interests
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {p.interestIds.map((id) => (
                <Badge key={id} variant="mint" size="sm">
                  {interestLabel(id)}
                </Badge>
              ))}
            </div>
          </Card>

          {p.achievements.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                <Award className="size-4 text-gold" />
                Achievements
              </h2>
              <ul className="space-y-3">
                {p.achievements.map((achievement) => (
                  <li key={achievement.id}>
                    <p className="text-sm font-medium">{achievement.label}</p>
                    <p className="text-xs text-ink-50">
                      {achievement.issuer} · {achievement.year}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>

        {/* Main ----------------------------------------------------------- */}
        <div className="min-w-0">
          <ProfileTabs
            panes={[
              {
                value: "portfolio",
                label: "Portfolio",
                count: portfolio.length,
                node:
                  portfolio.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      {portfolio.map((item) => (
                        <PortfolioCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="No portfolio pieces published yet." />
                  ),
              },
              {
                value: "projects",
                label: "Projects",
                count: projects.length,
                node:
                  projects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="Not part of any project on RE:VEAL yet." />
                  ),
              },
              {
                value: "collaborations",
                label: "Collaborations",
                count: collaborators.length,
                node:
                  collaborators.length > 0 ? (
                    <Card className="divide-y divide-ink-08 p-2">
                      {collaborators.map((collaborator) => (
                        <PersonRow key={collaborator.id} person={collaborator} />
                      ))}
                    </Card>
                  ) : (
                    <EmptyNote text="No shared projects yet." />
                  ),
              },
              {
                value: "brands",
                label: "Brands",
                count: brands.length,
                node:
                  brands.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/brands/${brand.id}`}
                          className="flex items-center gap-3 rounded-2xl border border-ink-08 bg-white p-4 transition-colors hover:border-lavender/30"
                        >
                          <Avatar seed={brand.avatarSeed} name={brand.name} size="md" square />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{brand.name}</span>
                            <span className="block truncate text-xs text-ink-50">{brand.tagline}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="Not affiliated with a brand on RE:VEAL." />
                  ),
              },
              {
                value: "events",
                label: "Events",
                count: events.length,
                node:
                  events.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="Not speaking at any upcoming event." />
                  ),
              },
            ]}
          />
        </div>
      </div>
    </PageContainer>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="rounded-panel border border-dashed border-ink-15 bg-white/50 px-6 py-12 text-center text-sm text-ink-50">
      {text}
    </div>
  );
}
