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
import type { LanguageCode, MatchResult, SearchResult } from "@/lib/types";
import { createI18n } from "@/lib/i18n";

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

  async matchesFor(kind: MatchResult["targetKind"], limit = 12, language: LanguageCode = "en") {
    const viewer = me();
    const i18n = createI18n(language);
    let results: MatchResult[];
    switch (kind) {
      case "person":
        results = PEOPLE.filter((p) => p.id !== viewer.id).map((p) => scorePerson(viewer, p, i18n));
        break;
      case "brand":
        results = BRANDS.map((b) => scoreBrand(viewer, b, i18n));
        break;
      case "project":
        results = PROJECTS.map((p) => scoreProject(viewer, p, i18n));
        break;
      case "event":
        results = EVENTS.map((e) => scoreEvent(viewer, e, i18n));
        break;
      case "city":
        results = CITIES.map((c) => scoreCity(viewer, c, cityOpportunityCounts(viewer, c.id), i18n));
        break;
      default:
        results = [];
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async search(query: string, limit = 20, language: LanguageCode = "en") {
    const i18n = createI18n(language);
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
        [
          person.name,
          person.handle,
          person.profile.headline,
          person.profile.bio,
          i18n.L.role[person.profile.role],
        ],
        70,
      );
      if (score)
        push({
          id: person.id,
          kind: "person",
          title: person.name,
          subtitle: `${i18n.L.role[person.profile.role]} · ${i18n.city(person.profile.cityId)}`,
          href: `/people/${person.id}`,
          seed: person.avatarSeed,
          score,
          badge: person.verified ? i18n.t("search.badge.verified") : undefined,
        });
    }

    for (const brand of BRANDS) {
      const score = hit([brand.name, brand.tagline, brand.story], 68);
      if (score)
        push({
          id: brand.id,
          kind: "brand",
          title: brand.name,
          subtitle: `${brand.tagline} · ${i18n.city(brand.cityId)}`,
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
          subtitle: project.cityIds.map((c) => i18n.city(c)).join(" × "),
          href: `/projects/${project.id}`,
          seed: project.coverSeed,
          score,
          badge: project.status === "recruiting" ? i18n.L.projectStatus.recruiting : undefined,
        });
    }

    for (const event of EVENTS) {
      const score = hit([event.title, event.summary, event.venue, event.hostName], 62);
      if (score)
        push({
          id: event.id,
          kind: "event",
          title: event.title,
          subtitle: `${i18n.city(event.cityId)} · ${event.startDate}`,
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
      const score = hit([i18n.city(city.id), city.name, city.tagline], 58);
      if (score)
        push({
          id: city.id,
          kind: "city",
          title: i18n.city(city.id),
          subtitle: city.tagline,
          href: `/map?city=${city.id}`,
          seed: city.id,
          score,
        });
    }

    for (const skill of SKILLS) {
      const score = hit([i18n.skill(skill.id), skill.label, i18n.L.category[skill.category]], 48);
      if (score)
        push({
          id: skill.id,
          kind: "skill",
          title: i18n.skill(skill.id),
          subtitle: `${i18n.t("search.kind.skill")} · ${i18n.L.category[skill.category]}`,
          href: `/people?skill=${skill.id}`,
          seed: skill.id,
          score,
        });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
