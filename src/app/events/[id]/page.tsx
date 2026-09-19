import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Languages, MapPin, Ticket, Users, Wifi } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/avatar";
import { SaveButton } from "@/components/actions/save-button";
import { MatchReasons, MatchRing } from "@/components/match/match-score";
import { PersonRow } from "@/components/cards/person-card";
import { EventCard } from "@/components/cards/event-card";
import { CityMap } from "@/components/map/city-map";
import { db } from "@/lib/data-source";
import { CITY_BY_ID, COUNTRY_BY_ID } from "@/lib/data/geo";
import { CATEGORY_LABELS, EVENT_TYPE_LABELS, LANGUAGE_LABELS } from "@/lib/labels";
import { daysUntil, formatDateRange } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";

export async function generateStaticParams() {
  const events = await db.listEvents();
  return events.map((event) => ({ id: event.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await db.getEvent(id);
  if (!event) return { title: "Event" };
  return { title: event.title, description: event.summary };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.getEvent(id);
  if (!event) notFound();

  const [matches, allPeople, allEvents, allBrands] = await Promise.all([
    db.matchesFor("event", 200),
    db.listPeople(),
    db.listEvents(),
    db.listBrands(),
  ]);

  const match = matches.find((m) => m.targetId === event.id);
  const speakers = allPeople.filter((p) => event.speakerUserIds.includes(p.id));
  const host = allBrands.find((b) => b.id === event.hostBrandId);
  const city = CITY_BY_ID.get(event.cityId);
  const country = COUNTRY_BY_ID.get(city?.countryId ?? "");
  const nearby = allEvents.filter((e) => e.id !== event.id && e.cityId === event.cityId).slice(0, 2);
  const until = daysUntil(event.startDate);

  return (
    <PageContainer>
      <Card className="overflow-hidden">
        <div className="relative h-32 sm:h-40" style={gradientStyle(event.coverSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          <div className="absolute inset-x-5 top-5 flex flex-wrap gap-2 sm:inset-x-8">
            <Badge variant="ink" size="md">
              {EVENT_TYPE_LABELS[event.type]}
            </Badge>
            {event.online && (
              <Badge variant="sky" size="md" className="bg-white/85 backdrop-blur">
                <Wifi className="size-3.5" />
                Online available
              </Badge>
            )}
            {until > 0 && (
              <Badge variant="blush" size="md" className="bg-white/85 backdrop-blur">
                In {until} days
              </Badge>
            )}
          </div>
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 max-w-3xl">
              <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[36px]">
                {event.title}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-70">{event.summary}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-ink-50">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-ink-30" />
                  {formatDateRange(event.startDate, event.endDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-ink-30" />
                  {event.venue}, {city?.name} {country?.flag}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Ticket className="size-4 text-ink-30" />
                  {event.price}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="size-4 text-ink-30" />
                  {event.languages.map((l) => LANGUAGE_LABELS[l]).join(" · ")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {match && <MatchRing score={match.score} size={88} />}
              <div className="flex flex-col gap-2">
                <Button size="lg" variant="accent">
                  <Ticket />
                  Register
                </Button>
                <SaveButton size="sm" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          {match && (
            <Card sheen className="p-6">
              <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                Why this matches you
              </h2>
              <p className="text-[15px] leading-relaxed text-ink-70">{match.narrative}</p>
              <MatchReasons reasons={match.reasons} limit={5} className="mt-4" />
            </Card>
          )}

          <Card className="p-6 sm:p-8">
            <h2 className="mb-4 font-display text-lg font-semibold tracking-[-0.02em]">About this event</h2>
            <p className="whitespace-pre-line text-[15px] leading-[1.75] text-ink-70">{event.description}</p>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {event.categories.map((c) => (
                <Badge key={c} variant="blush" size="md">
                  {CATEGORY_LABELS[c]}
                </Badge>
              ))}
            </div>
          </Card>

          {city && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between p-5">
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">Where</h2>
                <Link
                  href={`/map?city=${city.id}`}
                  className="text-sm font-medium text-ink-50 transition-colors hover:text-lavender"
                >
                  Open in map
                </Link>
              </div>
              <CityMap city={city} className="aspect-[2/1] w-full rounded-none border-0 border-t" />
            </Card>
          )}

          {nearby.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold tracking-[-0.02em]">
                Also in {city?.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {nearby.map((other) => (
                  <EventCard key={other.id} event={other} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              <Users className="size-4 text-lavender" />
              Attending
            </h2>
            <p className="font-display text-2xl font-semibold tracking-[-0.03em]">
              {event.attending}
              <span className="ml-1.5 text-sm font-medium text-ink-30">of {event.capacity}</span>
            </p>
            <Progress value={(event.attending / event.capacity) * 100} className="mt-3" />
            <p className="mt-3 text-xs text-ink-50">
              Hosted by {event.hostName}
              {host && (
                <>
                  {" · "}
                  <Link href={`/brands/${host.id}`} className="font-medium text-ink-70 hover:text-lavender">
                    View brand
                  </Link>
                </>
              )}
            </p>
          </Card>

          {host && (
            <Card className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">Host</h2>
              <Link href={`/brands/${host.id}`} className="flex items-center gap-3">
                <Avatar seed={host.avatarSeed} name={host.name} size="lg" square />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{host.name}</span>
                  <span className="block truncate text-xs text-ink-50">{host.tagline}</span>
                </span>
              </Link>
            </Card>
          )}

          {speakers.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                Speakers &amp; hosts
              </h2>
              <div className="divide-y divide-ink-08">
                {speakers.map((speaker) => (
                  <PersonRow key={speaker.id} person={speaker} />
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}

export const dynamicParams = false;
