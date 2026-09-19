import { db } from "@/lib/data-source";
import type { PersonView } from "@/lib/types";

/**
 * Everything a profile page renders, resolved in one place so /people/[id] and
 * /profile stay identical apart from the self flag.
 */
export async function loadProfile(person: PersonView) {
  const [portfolio, allProjects, allEvents, allBrands, allPeople] = await Promise.all([
    db.listPortfolio(person.id),
    db.listProjects(),
    db.listEvents(),
    db.listBrands(),
    db.listPeople(),
  ]);

  const projects = allProjects.filter((p) => p.memberIds.includes(person.id));
  const events = allEvents.filter((e) => e.speakerUserIds.includes(person.id));
  const brands = allBrands.filter((b) => b.memberUserIds.includes(person.id));

  const collaboratorIds = new Set(
    projects.flatMap((p) => p.memberIds).filter((id) => id !== person.id),
  );
  const collaborators = allPeople.filter((p) => collaboratorIds.has(p.id));

  return { portfolio, projects, events, brands, collaborators };
}
