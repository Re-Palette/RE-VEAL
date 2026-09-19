import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { DiscoverFeed } from "@/app/discover/discover-feed";

export const metadata: Metadata = {
  title: "Discover",
  description: "Trending beauty stories, new creators, new brands, open projects and upcoming events.",
};

export default async function DiscoverPage() {
  const i18n = await getI18n();
  const [viewer, posts, people, brands, projects, events] = await Promise.all([
    db.getCurrentUser(),
    db.listPosts(),
    db.listPeople(),
    db.listBrands(),
    db.listProjects(),
    db.listEvents(),
  ]);

  const [person, brand, project, event] = await Promise.all([
    db.matchesFor("person", 200, i18n.language),
    db.matchesFor("brand", 200, i18n.language),
    db.matchesFor("project", 200, i18n.language),
    db.matchesFor("event", 200, i18n.language),
  ]);

  const newCreators = people
    .filter((p) => p.id !== viewer.id && (p.profile.experience === "emerging" || p.profile.experience === "student"))
    .slice(0, 4);

  const newBrands = [...brands].sort((a, b) => b.founded - a.founded).slice(0, 4);

  const openProjects = projects
    .filter((p) => p.status === "recruiting")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);

  const upcoming = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 4);

  return (
    <DiscoverFeed
      posts={[...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
      newCreators={newCreators}
      newBrands={newBrands}
      projects={openProjects}
      events={upcoming}
      matches={{ person, brand, project, event }}
    />
  );
}
