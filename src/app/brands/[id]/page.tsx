import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Building2, CalendarDays, MapPin, Package, Sparkles, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { TranslatableText } from "@/components/content/translatable-text";
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
import { getI18n } from "@/lib/i18n/server";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { LANGUAGE_LABELS } from "@/lib/i18n";
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
  const i18n = await getI18n();
  const { id } = await params;
  const brand = await db.getBrand(id);
  if (!brand) notFound();

  const [matches, allPeople, allProjects, allEvents] = await Promise.all([
    db.matchesFor("brand", 200, i18n.language),
    db.listPeople(),
    db.listProjects(),
    db.listEvents(),
  ]);

  const match = matches.find((m) => m.targetId === brand.id);
  const team = allPeople.filter((p) => brand.memberUserIds.includes(p.id));
  const projects = allProjects.filter((p) => p.brandIds.includes(brand.id));
  const events = allEvents.filter((e) => e.hostBrandId === brand.id);
  const countryId = CITY_BY_ID.get(brand.cityId)?.countryId ?? brand.countryId;
  const country = COUNTRY_BY_ID.get(countryId);

  return (
    <PageContainer>
      <Card className="overflow-hidden">
        <div className="relative h-28 sm:h-32" style={gradientStyle(brand.avatarSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent" />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-5 sm:-mt-16">
            <div className="min-w-0">
              <Avatar seed={brand.avatarSeed} name={brand.name} size="2xl" square ring className="shadow-lift" />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">
                  {brand.name}
                </h1>
                {brand.verified && <BadgeCheck className="size-5 text-sky" />}
                <Badge variant="lavender" size="md">
                  {i18n.L.brandType[brand.type]}
                </Badge>
              </div>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-70">
                {i18n.content(`${brand.id}.tagline`, brand.tagline)}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-ink-30" />
                  {i18n.city(brand.cityId)}, {i18n.country(countryId)} {country?.flag}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4 text-ink-30" />
                  {i18n.t("brandDetail.founded", { year: brand.founded, size: brand.teamSize })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-ink-30" />
                  {i18n.t("common.followers", { count: formatCount(brand.followers) })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {match && <MatchRing score={match.score} />}
              <SaveButton label={i18n.t("common.follow")} savedLabel={i18n.t("common.following")} size="md" />
              <Button asChild variant="primary">
                <Link href="/messages">{i18n.t("brandDetail.contact")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:gap-8">
        <aside className="space-y-5">
          {match && (
            <Card sheen className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                {i18n.t("common.whyMatch")}
              </h2>
              <p className="mb-4 text-[13px] leading-relaxed text-ink-70">{match.narrative}</p>
              <MatchReasons reasons={match.reasons} limit={5} variant="list" />
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              {i18n.t("brandDetail.lookingFor")}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {brand.lookingFor.map((role) => (
                <Link key={role} href={`/people?role=${role}`}>
                  <Badge variant="mint" size="md">
                    {i18n.L.role[role]}
                  </Badge>
                </Link>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              {i18n.t("common.categories")}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {brand.categories.map((c) => (
                <Badge key={c} variant="blush" size="sm">
                  {i18n.L.category[c]}
                </Badge>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              {i18n.t("brandDetail.markets")}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {brand.marketCityIds.map((cityId) => (
                <Link key={cityId} href={`/map?city=${cityId}`}>
                  <Badge variant="sky" size="sm">
                    {i18n.city(cityId)}
                  </Badge>
                </Link>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-30">
              {i18n.t("common.languages")}
            </h3>
            <p className="text-sm text-ink-70">{brand.languages.map((l) => LANGUAGE_LABELS[l]).join(" · ")}</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              {i18n.t("brandDetail.values")}
            </h2>
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
                label: i18n.t("brandDetail.tab.story"),
                node: (
                  <Card className="p-6 sm:p-8">
                    <TranslatableText
                      text={brand.story}
                      from="en"
                      contentKey={`${brand.id}.story`}
                      className="whitespace-pre-line text-[15px] leading-[1.75]"
                    />
                  </Card>
                ),
              },
              {
                value: "opportunities",
                label: i18n.t("brandDetail.tab.opportunities"),
                count: brand.openOpportunities.length,
                node:
                  brand.openOpportunities.length > 0 ? (
                    <div className="space-y-4">
                      {brand.openOpportunities.map((opportunity) => (
                        <Card key={opportunity.id} className="p-5 sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Badge variant="mint" size="sm" className="mb-2">
                                {i18n.L.opportunityType[opportunity.type]}
                              </Badge>
                              <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">
                                {opportunity.title}
                              </h3>
                              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-50">
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="size-3.5 text-ink-30" />
                                  {i18n.city(opportunity.cityId)}
                                  {opportunity.remote && ` · ${i18n.t("common.remoteFriendly")}`}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5 text-ink-30" />
                                  {i18n.t("brandDetail.closes", { date: formatDate(opportunity.deadline, i18n.language) })}
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
                              label={i18n.t("common.apply")}
                              size="sm"
                            />
                          </div>

                          <p className="mt-4 text-[14px] leading-relaxed text-ink-70">{opportunity.description}</p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {opportunity.roles.map((role) => (
                              <Badge key={role} variant="lavender" size="sm">
                                {i18n.L.role[role]}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text={i18n.t("brandDetail.empty.opportunities")} />
                  ),
              },
              {
                value: "products",
                label: i18n.t("brandDetail.tab.products"),
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
                    <EmptyNote text={i18n.t("brandDetail.empty.products")} />
                  ),
              },
              {
                value: "projects",
                label: i18n.t("common.projects"),
                count: projects.length,
                node:
                  projects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text={i18n.t("brandDetail.empty.projects")} />
                  ),
              },
              {
                value: "team",
                label: i18n.t("brandDetail.tab.creators"),
                count: team.length,
                node:
                  team.length > 0 ? (
                    <Card className="divide-y divide-ink-08 p-2">
                      {team.map((person) => (
                        <PersonRow key={person.id} person={person} />
                      ))}
                    </Card>
                  ) : (
                    <EmptyNote text={i18n.t("brandDetail.empty.team")} />
                  ),
              },
              {
                value: "events",
                label: i18n.t("common.events"),
                count: events.length,
                node:
                  events.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <EmptyNote text={i18n.t("brandDetail.empty.events")} />
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
