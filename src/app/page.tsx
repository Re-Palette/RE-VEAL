import Link from "next/link";
import { ArrowRight, Bell, Compass, MessageCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { HomeHero } from "@/components/home/hero";
import { HomeMatchTabs } from "@/components/home/match-tabs";
import { MapPreview } from "@/components/home/map-preview";
import { PersonCard } from "@/components/cards/person-card";
import { BrandCard } from "@/components/cards/brand-card";
import { ProjectCard } from "@/components/cards/project-card";
import { EventCard } from "@/components/cards/event-card";
import { CityCard } from "@/components/cards/city-card";
import { PostCard } from "@/components/cards/content-cards";
import { SectionHeader } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { CITY_BY_ID } from "@/lib/data/geo";
import { cityOpportunityCounts } from "@/lib/match/city-stats";
import { PERSON_BY_ID } from "@/lib/data/people";
import { relativeTime } from "@/lib/utils";
import type { MapMarker } from "@/components/map/types";

export default async function HomePage() {
  const i18n = await getI18n();
  const [viewer, people, brands, projects, events, cities, posts, notifications, threads] = await Promise.all([
    db.getCurrentUser(),
    db.listPeople(),
    db.listBrands(),
    db.listProjects(),
    db.listEvents(),
    db.listCities(),
    db.listPosts(),
    db.listNotifications(),
    db.listThreads(),
  ]);

  const connections = await db.connectionStatuses();

  const [personMatches, brandMatches, projectMatches, eventMatches, cityMatches] = await Promise.all([
    db.matchesFor("person", 4, i18n.language),
    db.matchesFor("brand", 4, i18n.language),
    db.matchesFor("project", 4, i18n.language),
    db.matchesFor("event", 4, i18n.language),
    db.matchesFor("city", 6, i18n.language),
  ]);

  const personById = new Map(people.map((p) => [p.id, p]));
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const eventById = new Map(events.map((e) => [e.id, e]));
  const cityById = new Map(cities.map((c) => [c.id, c]));

  // The home map shows the viewer's strongest cities rather than every pin.
  const markers: MapMarker[] = cityMatches.flatMap((match) => {
    const city = cityById.get(match.targetId);
    if (!city) return [];
    const counts = cityOpportunityCounts(viewer, city.id);
    return [
      {
        city,
        count: counts.projects + counts.brands + counts.events,
        score: match.score,
        breakdown: counts,
      },
    ];
  });

  const unread = notifications.filter((n) => !n.read).slice(0, 3);
  const activeThreads = threads.filter((t) => t.unread > 0).slice(0, 3);

  const grid = "grid gap-4 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <PageContainer wide>
      <HomeHero
        stats={{
          people: 128_400,
          brands: 6_240,
          projects: 3_180,
          cities: cities.length,
        }}
      >
        <MapPreview markers={markers} />
      </HomeHero>

      {/* Your Match ------------------------------------------------------- */}
      <section className="mt-12">
        <HomeMatchTabs
          people={
            <div className={grid}>
              {personMatches.flatMap((match) => {
                const person = personById.get(match.targetId);
                return person
                  ? [
                      <PersonCard
                        key={person.id}
                        person={person}
                        match={match}
                        connection={connections[person.id] ?? "none"}
                      />,
                    ]
                  : [];
              })}
            </div>
          }
          brands={
            <div className={grid}>
              {brandMatches.flatMap((match) => {
                const brand = brandById.get(match.targetId);
                return brand ? [<BrandCard key={brand.id} brand={brand} match={match} />] : [];
              })}
            </div>
          }
          projects={
            <div className={grid}>
              {projectMatches.flatMap((match) => {
                const project = projectById.get(match.targetId);
                return project ? [<ProjectCard key={project.id} project={project} match={match} />] : [];
              })}
            </div>
          }
          events={
            <div className={grid}>
              {eventMatches.flatMap((match) => {
                const event = eventById.get(match.targetId);
                return event ? [<EventCard key={event.id} event={event} match={match} />] : [];
              })}
            </div>
          }
        />
      </section>

      {/* Cities ----------------------------------------------------------- */}
      <section className="mt-14">
        <SectionHeader
          eyebrow={i18n.t("home.cities.eyebrow")}
          title={i18n.t("home.cities.title")}
          description={i18n.t("home.cities.description")}
          action={
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-70 transition-colors hover:text-lavender"
            >
              {i18n.t("home.cities.open")}
              <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {cityMatches.flatMap((match) => {
            const city = cityById.get(match.targetId);
            return city
              ? [
                  <CityCard
                    key={city.id}
                    city={city}
                    match={match}
                    counts={cityOpportunityCounts(viewer, city.id)}
                  />,
                ]
              : [];
          })}
        </div>
      </section>

      {/* Activity + Discover --------------------------------------------- */}
      <section className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1fr_340px] xl:gap-10">
        <div className="min-w-0">
          <SectionHeader
            eyebrow="Discover"
            title="What the community is working on"
            action={
              <Link
                href="/discover"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-70 transition-colors hover:text-lavender"
              >
                <Compass className="size-4" />
                {i18n.t("nav.discover")}
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                <Bell className="size-4 text-lavender" />
                {i18n.t("home.activity")}
              </h3>
              <Link href="/notifications" className="text-xs font-medium text-ink-30 hover:text-lavender">
                {i18n.t("home.activity.all")}
              </Link>
            </div>
            <ul className="space-y-3">
              {unread.map((notification) => {
                const actor = notification.actorUserId ? PERSON_BY_ID.get(notification.actorUserId) : undefined;
                return (
                  <li key={notification.id}>
                    <Link href={notification.href} className="group flex gap-3">
                      {actor ? (
                        <Avatar seed={actor.avatarSeed} name={actor.name} size="sm" />
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lavender-soft">
                          <Bell className="size-4 text-[#4B3BA0]" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <Badge variant="lavender" size="sm" className="mb-1">
                          {i18n.L.notification[notification.kind]}
                        </Badge>
                        <span className="block text-[13px] font-medium leading-snug group-hover:text-lavender">
                          {notification.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-ink-30">
                          {relativeTime(notification.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                <MessageCircle className="size-4 text-sky" />
                {i18n.t("nav.messages")}
              </h3>
              <Link href="/messages" className="text-xs font-medium text-ink-30 hover:text-lavender">
                {i18n.t("home.messages.inbox")}
              </Link>
            </div>
            <ul className="space-y-3">
              {activeThreads.map((thread) => {
                const other = thread.participantUserIds.find((id) => id !== viewer.id);
                const person = other ? PERSON_BY_ID.get(other) : undefined;
                const title = thread.title ?? person?.name ?? i18n.t("nav.messages");
                return (
                  <li key={thread.id}>
                    <Link href="/messages" className="group flex items-center gap-3">
                      <Avatar
                        seed={person?.avatarSeed ?? thread.id}
                        name={title}
                        size="sm"
                        square={thread.kind !== "direct"}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium group-hover:text-lavender">
                          {title}
                        </span>
                        <span className="block truncate text-[11px] text-ink-30">
                          {relativeTime(thread.updatedAt)}
                        </span>
                      </span>
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full gradient-accent text-[10px] font-semibold text-white">
                        {thread.unread}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card sheen className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-30">
              {i18n.t("home.yourCity")}
            </p>
            <p className="mt-2 font-display text-lg font-semibold tracking-[-0.02em]">
              {i18n.city(viewer.profile.cityId)}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-50">
              {CITY_BY_ID.get(viewer.profile.cityId)?.tagline}
            </p>
            <Link
              href={`/map?city=${viewer.profile.cityId}`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-70 transition-colors hover:text-lavender"
            >
              {i18n.t("home.yourCity.link")}
              <ArrowRight className="size-4" />
            </Link>
          </Card>
        </aside>
      </section>
    </PageContainer>
  );
}
