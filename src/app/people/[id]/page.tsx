import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { connectionStatusFor } from "@/lib/data/social";
import { loadProfile } from "@/lib/profile-data";
import { ProfileView } from "@/components/profile/profile-view";
import { ROLE_LABELS } from "@/lib/labels";

export async function generateStaticParams() {
  const people = await db.listPeople();
  return people.map((person) => ({ id: person.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const person = await db.getPerson(id);
  if (!person) return { title: "Profile" };
  return {
    title: `${person.name} — ${ROLE_LABELS[person.profile.role]}`,
    description: person.profile.headline,
  };
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, viewer] = await Promise.all([db.getPerson(id), db.getCurrentUser()]);
  if (!person) notFound();

  const matches = await db.matchesFor("person", 500);
  const data = await loadProfile(person);

  return (
    <ProfileView
      person={person}
      match={matches.find((m) => m.targetId === person.id)}
      connection={connectionStatusFor(person.id)}
      isSelf={person.id === viewer.id}
      {...data}
    />
  );
}

export const dynamicParams = false;
