import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { DiscoverFeed } from "@/app/discover/discover-feed";

export const metadata: Metadata = {
  title: "Discover",
  description: "Trending beauty stories, new creators, new brands, open projects and upcoming events.",
};

export default async function DiscoverPage() {
  const [viewer, posts, people, brands, projects, events] = await Promise.all([
    db.getCurrentUser(),
    db.listPosts(),
    db.listPeople(),
    db.listBrands(),
    db.listProjects(),
    db.listEvents(),
  ]);

  const [person, brand, project, event] = await Promise.all([
    db.matchesFor("person", 200),
    db.matchesFor("brand", 200),
    db.matchesFor("project", 200),
    db.matchesFor("event", 200),
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
