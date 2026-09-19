import { BRANDS, BRAND_BY_ID, OPPORTUNITIES } from "@/lib/data/brands";
import { COURSES, COURSE_BY_ID, PORTFOLIO, POSTS } from "@/lib/data/content";
import { EVENTS, EVENT_BY_ID } from "@/lib/data/events";
import { CITIES, CITY_BY_ID, COUNTRIES } from "@/lib/data/geo";
import { CURRENT_USER_ID, PEOPLE, PERSON_BY_ID } from "@/lib/data/people";
import { PROJECTS, PROJECT_BY_ID } from "@/lib/data/projects";
import { CONNECTIONS, MESSAGES, NOTIFICATIONS, THREADS } from "@/lib/data/social";
import { SKILLS } from "@/lib/data/taxonomy";
import { scoreBrand, scoreCity, scoreEvent, scorePerson, scoreProject } from "@/lib/match/engine";
import { cityOpportunityCounts } from "@/lib/match/city-stats";
import type { DataSource } from "@/lib/data-source/types";
import type { MatchResult, SearchResult } from "@/lib/types";
import { CATEGORY_LABELS, ROLE_LABELS } from "@/lib/labels";

function me() {
  const person = PERSON_BY_ID.get(CURRENT_USER_ID);
  if (!person) throw new Error(`Current user ${CURRENT_USER_ID} missing from dataset`);
  return person;
}

export class MockDataSource implements DataSource {
  readonly id = "mock";

  async getCurrentUser() {
    return me();
  }

  async listPeople() {
    return PEOPLE;
  }

  async getPerson(id: string) {
    return PERSON_BY_ID.get(id);
  }

  async listBrands() {
    return BRANDS;
  }

  async getBrand(id: string) {
    return BRAND_BY_ID.get(id);
  }

  async listOpportunities() {
    return OPPORTUNITIES;
  }

  async listProjects() {
    return PROJECTS;
  }

  async getProject(id: string) {
    return PROJECT_BY_ID.get(id);
  }

  async listEvents() {
    return EVENTS;
  }

  async getEvent(id: string) {
    return EVENT_BY_ID.get(id);
  }

  async listPosts() {
    return POSTS;
  }

  async listCourses() {
    return COURSES;
  }

  async getCourse(id: string) {
    return COURSE_BY_ID.get(id);
  }

  async listPortfolio(userId?: string) {
    return userId ? PORTFOLIO.filter((p) => p.userId === userId) : PORTFOLIO;
  }

  async listCities() {
    return CITIES;
  }

  async listCountries() {
    return COUNTRIES;
  }

  async listThreads() {
    return [...THREADS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listMessages(threadId: string) {
    return MESSAGES.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listNotifications() {
    return [...NOTIFICATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listConnections() {
    return CONNECTIONS;
  }

  async matchesFor(kind: MatchResult["targetKind"], limit = 12) {
    const viewer = me();
    let results: MatchResult[];
    switch (kind) {
      case "person":
        results = PEOPLE.filter((p) => p.id !== viewer.id).map((p) => scorePerson(viewer, p));
        break;
      case "brand":
        results = BRANDS.map((b) => scoreBrand(viewer, b));
        break;
      case "project":
        results = PROJECTS.map((p) => scoreProject(viewer, p));
        break;
      case "event":
        results = EVENTS.map((e) => scoreEvent(viewer, e));
        break;
      case "city":
        results = CITIES.map((c) => scoreCity(viewer, c, cityOpportunityCounts(viewer, c.id)));
        break;
      default:
        results = [];
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async search(query: string, limit = 20) {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];
    const results: SearchResult[] = [];

    const push = (r: SearchResult) => results.push(r);
    const hit = (haystack: string[], weight: number) => {
      const joined = haystack.join(" ").toLowerCase();
      if (!joined.includes(q)) return 0;
      // Prefix matches on the primary field rank above mentions buried in a bio.
      return haystack[0]?.toLowerCase().startsWith(q) ? weight + 30 : weight;
    };

    for (const person of PEOPLE) {
      const score = hit(
        [person.name, person.handle, person.profile.headline, person.profile.bio, ROLE_LABELS[person.profile.role]],
        70,
      );
      if (score)
        push({
          id: person.id,
          kind: "person",
          title: person.name,
          subtitle: `${ROLE_LABELS[person.profile.role]} · ${CITY_BY_ID.get(person.profile.cityId)?.name}`,
          href: `/people/${person.id}`,
          seed: person.avatarSeed,
          score,
          badge: person.verified ? "Verified" : undefined,
        });
    }

    for (const brand of BRANDS) {
      const score = hit([brand.name, brand.tagline, brand.story], 68);
      if (score)
        push({
          id: brand.id,
          kind: "brand",
          title: brand.name,
          subtitle: `${brand.tagline} · ${CITY_BY_ID.get(brand.cityId)?.name}`,
          href: `/brands/${brand.id}`,
          seed: brand.avatarSeed,
          score,
        });
    }

    for (const project of PROJECTS) {
      const score = hit([project.title, project.code, project.summary, project.overview], 66);
      if (score)
        push({
          id: project.id,
          kind: "project",
          title: project.title,
          subtitle: project.cityIds.map((c) => CITY_BY_ID.get(c)?.name).join(" × "),
          href: `/projects/${project.id}`,
          seed: project.coverSeed,
          score,
          badge: project.status === "recruiting" ? "Recruiting" : undefined,
        });
    }

    for (const event of EVENTS) {
      const score = hit([event.title, event.summary, event.venue, event.hostName], 62);
      if (score)
        push({
          id: event.id,
          kind: "event",
          title: event.title,
          subtitle: `${CITY_BY_ID.get(event.cityId)?.name} · ${event.startDate}`,
          href: `/events/${event.id}`,
          seed: event.coverSeed,
          score,
        });
    }

    for (const post of POSTS) {
      const score = hit([post.title, post.body, ...post.tags], 54);
      if (score)
        push({
          id: post.id,
          kind: "post",
          title: post.title,
          subtitle: post.tags.join(" · "),
          href: `/discover?post=${post.id}`,
          seed: post.coverSeed,
          score,
        });
    }

    for (const course of COURSES) {
      const score = hit([course.title, course.summary, course.description], 52);
      if (score)
        push({
          id: course.id,
          kind: "course",
          title: course.title,
          subtitle: course.summary,
          href: `/learn/${course.id}`,
          seed: course.coverSeed,
          score,
        });
    }

    for (const city of CITIES) {
      const score = hit([city.name, city.tagline], 58);
      if (score)
        push({
          id: city.id,
          kind: "city",
          title: city.name,
          subtitle: city.tagline,
          href: `/map?city=${city.id}`,
          seed: city.id,
          score,
        });
    }

    for (const skill of SKILLS) {
      const score = hit([skill.label, CATEGORY_LABELS[skill.category]], 48);
      if (score)
        push({
          id: skill.id,
          kind: "skill",
          title: skill.label,
          subtitle: `Skill · ${CATEGORY_LABELS[skill.category]}`,
          href: `/people?skill=${skill.id}`,
          seed: skill.id,
          score,
        });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
