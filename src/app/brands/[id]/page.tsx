import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Building2, CalendarDays, MapPin, Package, Sparkles, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SaveButton } from "@/components/actions/save-button";
import { ApplyButton } from "@/components/actions/apply-button";
import { MatchReasons, MatchRing } from "@/components/match/match-score";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { PersonRow } from "@/components/cards/person-card";
import { ProjectCard } from "@/components/cards/project-card";
import { EventCard } from "@/components/cards/event-card";
import { db } from "@/lib/data-source";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { BRAND_TYPE_LABELS, CATEGORY_LABELS, LANGUAGE_LABELS, ROLE_LABELS } from "@/lib/labels";
import { formatCount, formatDate } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

export async function generateStaticParams() {
  const brands = await db.listBrands();
  return brands.map((brand) => ({ id: brand.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const brand = await db.getBrand(id);
  if (!brand) return { title: "Brand" };
  return { title: brand.name, description: brand.tagline };
}

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await db.getBrand(id);
  if (!brand) notFound();

  const [matches, allPeople, allProjects, allEvents] = await Promise.all([
    db.matchesFor("brand", 200),
    db.listPeople(),
    db.listProjects(),
    db.listEvents(),
  ]);

  const match = matches.find((m) => m.targetId === brand.id);
  const team = allPeople.filter((p) => brand.memberUserIds.includes(p.id));
  const projects = allProjects.filter((p) => p.brandIds.includes(brand.id));
  const events = allEvents.filter((e) => e.hostBrandId === brand.id);
  const city = CITY_BY_ID.get(brand.cityId);
  const country = COUNTRY_BY_ID.get(brand.countryId);

  return (
    <PageContainer>
      <Card className="overflow-hidden">
        <div className="relative h-40 sm:h-48" style={gradientStyle(brand.avatarSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-16 flex flex-wrap items-end justify-between gap-5 sm:-mt-20">
            <div className="min-w-0">
              <Avatar seed={brand.avatarSeed} name={brand.name} size="2xl" square ring className="shadow-lift" />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">
                  {brand.name}
                </h1>
                {brand.verified && <BadgeCheck className="size-5 text-sky" />}
                <Badge variant="lavender" size="md">
                  {BRAND_TYPE_LABELS[brand.type]}
                </Badge>
              </div>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-70">{brand.tagline}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-ink-30" />
                  {city?.name}, {country?.name} {country?.flag}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4 text-ink-30" />
                  Founded {brand.founded} · {brand.teamSize} people
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-ink-30" />
                  {formatCount(brand.followers)} followers
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {match && <MatchRing score={match.score} />}
              <SaveButton label="Follow" savedLabel="Following" size="md" />
              <Button asChild variant="primary">
                <Link href="/messages">Contact brand</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:gap-8">
        <aside className="space-y-5">
          {match && (
            <Card sheen className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                Why this matches you
              </h2>
              <p className="mb-4 text-[13px] leading-relaxed text-ink-70">{match.narrative}</p>
              <MatchReasons reasons={match.reasons} limit={5} variant="list" />
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">Looking for</h2>
            <div className="flex flex-wrap gap-1.5">
              {brand.lookingFor.map((role) => (
                <Link key={role} href={`/people?role=${role}`}>
                  <Badge variant="mint" size="md">
                    {ROLE_LABELS[role]}
                  </Badge>
                </Link>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              Categories
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {brand.categories.map((c) => (
                <Badge key={c} variant="blush" size="sm">
                  {CATEGORY_LABELS[c]}
                </Badge>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              Markets
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {brand.marketCityIds.map((cityId) => (
                <Link key={cityId} href={`/map?city=${cityId}`}>
                  <Badge variant="sky" size="sm">
                    {CITY_BY_ID.get(cityId)?.name}
                  </Badge>
                </Link>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              Languages
            </h3>
            <p className="text-sm text-ink-70">{brand.languages.map((l) => LANGUAGE_LABELS[l]).join(" · ")}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">Values</h2>
            <ul className="space-y-2">
              {brand.values.map((value) => (
                <li key={value} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-70">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full gradient-accent" />
                  {value}
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        <div className="min-w-0">
          <ProfileTabs
            panes={[
              {
                value: "story",
                label: "Story",
                node: (
                  <Card className="p-6 sm:p-8">
                    <p className="whitespace-pre-line text-[15px] leading-[1.75] text-ink-70">{brand.story}</p>
                  </Card>
                ),
              },
              {
                value: "opportunities",
                label: "Creators Wanted",
                count: brand.openOpportunities.length,
                node:
                  brand.openOpportunities.length > 0 ? (
                    <div className="space-y-4">
                      {brand.openOpportunities.map((opportunity) => (
                        <Card key={opportunity.id} className="p-5 sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Badge variant="mint" size="sm" className="mb-2 capitalize">
                                {opportunity.type.replace(/-/g, " ")}
                              </Badge>
                              <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">
                                {opportunity.title}
                              </h3>
                              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-50">
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="size-3.5 text-ink-30" />
                                  {CITY_BY_ID.get(opportunity.cityId)?.name}
                                  {opportunity.remote && " · Remote friendly"}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5 text-ink-30" />
                                  Closes {formatDate(opportunity.deadline)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Sparkles className="size-3.5 text-ink-30" />
                                  {opportunity.compensation}
                                </span>
                              </p>
                            </div>
                            <ApplyButton
                              target={opportunity.title}
                              roles={opportunity.roles}
                              label="Apply"
                              size="sm"
                            />
                          </div>

                          <p className="mt-4 text-[14px] leading-relaxed text-ink-70">{opportunity.description}</p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {opportunity.roles.map((role) => (
                              <Badge key={role} variant="lavender" size="sm">
                                {ROLE_LABELS[role]}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="No open opportunities right now. Follow the brand to hear first." />
                  ),
              },
              {
                value: "products",
                label: "Products",
                count: brand.products.length,
                node:
                  brand.products.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {brand.products.map((product) => (
                        <Card key={product.id} className="flex gap-4 p-4">
                          <span
                            className="size-16 shrink-0 rounded-2xl"
                            style={gradientStyle(product.id)}
                            aria-hidden
                          />
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">{product.name}</span>
                              <Package className="size-3.5 shrink-0 text-ink-30" />
                            </span>
                            <span className="mt-1 block text-[13px] leading-relaxed text-ink-50">
                              {product.description}
                            </span>
                            {product.price && (
                              <span className="mt-2 block text-xs font-semibold text-ink-70">
                                {product.price}
                              </span>
                            )}
                          </span>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="This brand has not published products on RE:VEAL." />
                  ),
              },
              {
                value: "projects",
                label: "Projects",
                count: projects.length,
                node:
                  projects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="No projects with this brand yet." />
                  ),
              },
              {
                value: "team",
                label: "Creators",
                count: team.length,
                node:
                  team.length > 0 ? (
                    <Card className="divide-y divide-ink-08 p-2">
                      {team.map((person) => (
                        <PersonRow key={person.id} person={person} />
                      ))}
                    </Card>
                  ) : (
                    <EmptyNote text="No team members listed." />
                  ),
              },
              {
                value: "events",
                label: "Events",
                count: events.length,
                node:
                  events.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text="No events hosted by this brand." />
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

export const dynamicParams = false;
