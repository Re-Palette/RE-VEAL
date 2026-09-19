import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarRange, Coins, Globe2, Languages, MapPin, MessageCircle, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { TranslatableText } from "@/components/content/translatable-text";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { ApplyButton } from "@/components/actions/apply-button";
import { SaveButton } from "@/components/actions/save-button";
import { MatchReasons, MatchRing } from "@/components/match/match-score";
import { PersonRow } from "@/components/cards/person-card";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { LANGUAGE_LABELS } from "@/lib/i18n";
import { formatDateRange } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

export async function generateStaticParams() {
  const projects = await db.listProjects();
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await db.getProject(id);
  if (!project) return { title: "Project" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const i18n = await getI18n();
  const { id } = await params;
  const project = await db.getProject(id);
  if (!project) notFound();

  const [matches, allPeople, allBrands] = await Promise.all([
    db.matchesFor("project", 200, i18n.language),
    db.listPeople(),
    db.listBrands(),
  ]);

  const match = matches.find((m) => m.targetId === project.id);
  const members = allPeople.filter((p) => project.memberIds.includes(p.id));
  const owner = allPeople.find((p) => p.id === project.ownerUserId);
  const brands = allBrands.filter((b) => project.brandIds.includes(b.id));
  const openSlots = project.roleSlots.filter((slot) => slot.filled < slot.count);
  const filledTotal = project.roleSlots.reduce((sum, s) => sum + s.filled, 0);
  const capacityTotal = project.roleSlots.reduce((sum, s) => sum + s.count, 0) || project.capacity;

  return (
    <PageContainer>
      {/* Hero ------------------------------------------------------------- */}
      <Card className="overflow-hidden">
        <div className="relative h-32 sm:h-40" style={gradientStyle(project.coverSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          <div className="absolute inset-x-5 top-5 flex flex-wrap gap-2 sm:inset-x-8">
            <Badge variant="ink" size="md">
              {project.code}
            </Badge>
            <Badge
              variant={project.status === "recruiting" ? "mint" : project.status === "in-progress" ? "sky" : "default"}
              size="md"
              className="bg-white/85 backdrop-blur"
            >
              {i18n.L.projectStatus[project.status]}
            </Badge>
            <Badge variant="default" size="md" className="bg-white/85 backdrop-blur">
              {i18n.L.projectType[project.type]}
            </Badge>
          </div>
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 max-w-3xl">
              <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[36px]">
                {i18n.content(`${project.id}.title`, project.title)}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-70">
                {i18n.content(`${project.id}.summary`, project.summary)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-ink-50">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-ink-30" />
                  {project.cityIds
                    .map(
                      (cityId) =>
                        `${i18n.city(cityId)} ${COUNTRY_BY_ID.get(CITY_BY_ID.get(cityId)?.countryId ?? "")?.flag ?? ""}`,
                    )
                    .join(" × ")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarRange className="size-4 text-ink-30" />
                  {formatDateRange(project.startDate, project.endDate, i18n.language)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Coins className="size-4 text-ink-30" />
                  {i18n.content(`${project.id}.budget`, project.budget)}
                </span>
                {project.remoteFriendly && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="size-4 text-ink-30" />
                    {i18n.t("common.remoteFriendly")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="size-4 text-ink-30" />
                  {project.languages.map((l) => LANGUAGE_LABELS[l]).join(" · ")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {match && <MatchRing score={match.score} size={88} />}
              <div className="flex flex-col gap-2">
                <ApplyButton
                  target={project.title}
                  roles={openSlots.map((s) => s.role)}
                  label={i18n.t("projectDetail.apply")}
                  size="lg"
                />
                <SaveButton size="sm" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
        {/* Main ----------------------------------------------------------- */}
        <div className="min-w-0 space-y-6">
          {match && (
            <Card sheen className="p-6">
              <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                {i18n.t("projectDetail.whyMatch")}
              </h2>
              <p className="text-[15px] leading-relaxed text-ink-70">{match.narrative}</p>
              <MatchReasons reasons={match.reasons} limit={6} className="mt-4" />
            </Card>
          )}

          <Card className="p-6 sm:p-8">
            <h2 className="mb-4 font-display text-lg font-semibold tracking-[-0.02em]">
              {i18n.t("projectDetail.overview")}
            </h2>
            <TranslatableText
              text={project.overview}
              from="en"
              contentKey={`${project.id}.overview`}
              className="whitespace-pre-line text-[15px] leading-[1.75]"
            />

            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.categories.map((c) => (
                <Badge key={c} variant="blush" size="md">
                  {i18n.L.category[c]}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 font-display text-lg font-semibold tracking-[-0.02em]">
              {i18n.t("projectDetail.recruiting")}
            </h2>
            <div className="space-y-4">
              {project.roleSlots.map((slot) => {
                const open = slot.count - slot.filled;
                return (
                  <div key={slot.role} className="rounded-2xl border border-ink-08 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{i18n.L.role[slot.role]}</p>
                        {slot.skillIds.length > 0 && (
                          <p className="mt-1 text-xs text-ink-50">
                            {i18n.t("projectDetail.needs", {
                              skills: i18n.list(slot.skillIds.map((id) => i18n.skill(id))),
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-ink-50">
                          {i18n.t("projectDetail.filled", { filled: slot.filled, total: slot.count })}
                        </span>
                        {open > 0 ? (
                          <Badge variant="mint" size="sm">
                            {i18n.t("projectDetail.openCount", { count: open })}
                          </Badge>
                        ) : (
                          <Badge size="sm">{i18n.t("common.full")}</Badge>
                        )}
                      </div>
                    </div>
                    <Progress value={(slot.filled / slot.count) * 100} className="mt-3" />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 font-display text-lg font-semibold tracking-[-0.02em]">
              {i18n.t("projectDetail.timeline")}
            </h2>
            <ol className="relative space-y-6 border-l border-ink-08 pl-6">
              {project.timeline.map((phase) => (
                <li key={phase.id} className="relative">
                  <span
                    className={`absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full border-2 border-white ${
                      phase.status === "done"
                        ? "bg-mint"
                        : phase.status === "active"
                          ? "gradient-accent"
                          : "bg-ink-15"
                    }`}
                  />
                  <p className="text-sm font-semibold">{phase.label}</p>
                  <p className="mt-0.5 text-xs text-ink-50">{phase.period}</p>
                  {phase.status === "active" && (
                    <Badge variant="lavender" size="sm" className="mt-2">
                      {i18n.t("projectDetail.inProgressNow")}
                    </Badge>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Sidebar -------------------------------------------------------- */}
        <aside className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                <Users className="size-4 text-lavender" />
                {i18n.t("common.members")}
              </h2>
              <span className="text-xs text-ink-50">
                {filledTotal} / {capacityTotal}
              </span>
            </div>
            <Progress value={(filledTotal / capacityTotal) * 100} className="mb-4" />
            <AvatarStack items={members.map((m) => ({ seed: m.avatarSeed, name: m.name }))} max={8} />
            <div className="mt-4 divide-y divide-ink-08">
              {members.slice(0, 6).map((member) => (
                <PersonRow key={member.id} person={member} />
              ))}
            </div>
          </Card>

          {owner && (
            <Card className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                {i18n.t("projectDetail.ledBy")}
              </h2>
              <Link href={`/people/${owner.id}`} className="flex items-center gap-3">
                <Avatar seed={owner.avatarSeed} name={owner.name} size="lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{owner.name}</span>
                  <span className="block truncate text-xs text-ink-50">{owner.profile.headline}</span>
                </span>
              </Link>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href="/messages">
                  <MessageCircle />
                  {i18n.t("projectDetail.messageLead")}
                </Link>
              </Button>
            </Card>
          )}

          {brands.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                {i18n.t("projectDetail.relatedBrands")}
              </h2>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.id}`}
                    className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-canvas"
                  >
                    <Avatar seed={brand.avatarSeed} name={brand.name} size="md" square />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{brand.name}</span>
                      <span className="block truncate text-xs text-ink-50">{brand.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              {i18n.t("projectDetail.requiredSkills")}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {project.requiredSkillIds.map((skillId) => (
                <Link key={skillId} href={`/people?skill=${skillId}`}>
                  <Badge variant="lavender" size="sm">
                    {i18n.skill(skillId)}
                  </Badge>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-50">
              {i18n.t("projectDetail.applications", {
                count: project.applicationsCount,
                cities: project.cityIds.length,
              })}
            </p>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

export const dynamicParams = false;
