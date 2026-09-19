import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { loadProfile } from "@/lib/profile-data";
import { ProfileView } from "@/components/profile/profile-view";
import { createI18n, DEFAULT_LANGUAGE } from "@/lib/i18n";

export async function generateStaticParams() {
  const people = await db.listPeople();
  return people.map((person) => ({ id: person.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const person = await db.getPerson(id);
  if (!person) return { title: "Profile" };
  // Metadata is generated outside the request's render pass, so it uses the
  // default locale rather than the viewer's.
  const { L } = createI18n(DEFAULT_LANGUAGE);
  return {
    title: `${person.name} — ${L.role[person.profile.role]}`,
    description: person.profile.headline,
  };
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const i18n = await getI18n();
  const { id } = await params;
  const [person, viewer] = await Promise.all([db.getPerson(id), db.getCurrentUser()]);
  if (!person) notFound();

  const matches = await db.matchesFor("person", 500, i18n.language);
  const data = await loadProfile(person);

  return (
    <ProfileView
      person={person}
      match={matches.find((m) => m.targetId === person.id)}
      connection={(await db.connectionStatuses())[person.id] ?? "none"}
      isSelf={person.id === viewer.id}
      {...data}
    />
  );
}

export const dynamicParams = false;
