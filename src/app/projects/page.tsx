import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { ProjectsDirectory } from "@/app/projects/projects-directory";
import { ListingSkeleton } from "@/components/ui/skeletons";

export const metadata: Metadata = {
  title: "Projects",
  description: "Global beauty projects recruiting makeup artists, photographers, video creators and designers.",
};

export default async function ProjectsPage() {
  const i18n = await getI18n();
  const [projects, matches] = await Promise.all([db.listProjects(), db.matchesFor("project", 200, i18n.language)]);
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <ProjectsDirectory projects={projects} matches={matches} />
    </Suspense>
  );
}
