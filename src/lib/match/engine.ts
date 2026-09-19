import { CITY_BY_ID } from "@/lib/data/geo";
import { SKILL_BY_ID } from "@/lib/data/taxonomy";
import type { I18n } from "@/lib/i18n";
import type {
  BeautyEvent,
  Brand,
  City,
  MatchReason,
  MatchResult,
  MatchTargetKind,
  PersonView,
  Profile,
  Project,
} from "@/lib/types";
import { clamp, overlapCount } from "@/lib/utils";

/**
 * Rule-based match scoring.
 *
 * The rules are deliberately explicit and additive rather than a single opaque
 * similarity number, because RE:VEAL always has to answer "why did this match?"
 * on screen. Each rule contributes points and, when it fires, a reason the UI
 * can render. Every string it produces goes through `i18n`, so the reasoning is
 * readable in whichever language the viewer has chosen.
 */

interface Rule {
  points: number;
  max: number;
  reason?: MatchReason;
}

function accumulate(rules: Rule[]): { score: number; reasons: MatchReason[] } {
  const earned = rules.reduce((total, r) => total + r.points, 0);
  const possible = rules.reduce((total, r) => total + r.max, 0) || 1;
  // No rule set ever fires completely, so a raw ratio would top out in the
  // seventies and make a genuinely strong match look lukewarm. The stretch
  // below puts real top matches in the nineties and keeps weak ones honest.
  const score = clamp(Math.round(45 + 71 * (earned / possible)), 51, 99);
  const reasons = rules
    .flatMap((r) => (r.reason && r.points > 0 ? [r.reason] : []))
    .sort((a, b) => b.weight - a.weight);
  return { score, reasons };
}

function reason(kind: MatchReason["kind"], label: string, weight: number): MatchReason {
  return { kind, label, weight };
}

type LocationContext = "person" | "brand" | "project" | "event";

/**
 * Location wording has to stay literally true: a brand whose products sell in
 * Tokyo is not "based in Tokyo", and a three-city project is not "in" any one
 * of them. The context decides the phrasing; the scoring is the same.
 */
function locationRule(
  viewer: Profile,
  cityIds: string[],
  max: number,
  context: LocationContext,
  i18n: I18n,
): Rule {
  const unique = Array.from(new Set(cityIds));
  const wanted = unique.filter((id) => viewer.targetCityIds.includes(id));

  if (wanted.length > 0) {
    const names = wanted.map((id) => i18n.city(id));
    const includesHome = wanted.includes(viewer.cityId);
    let label: string;
    if (context === "project" && unique.length > 1) {
      label = unique.map((id) => i18n.city(id)).join(" × ");
    } else if (context === "brand") {
      label = i18n.t("reason.location.brandActive", { cities: i18n.list(names.slice(0, 3)) });
    } else if (includesHome) {
      label = i18n.t("reason.location.home", { city: i18n.city(viewer.cityId) });
    } else {
      label = i18n.t("reason.location.target", { cities: i18n.list(names.slice(0, 2)) });
    }
    return { points: max, max, reason: reason("location", label, 90) };
  }

  const regions = new Set(unique.map((id) => CITY_BY_ID.get(id)?.region).filter(Boolean));
  const viewerRegion = CITY_BY_ID.get(viewer.cityId)?.region;
  if (viewerRegion && regions.has(viewerRegion)) {
    return { points: max * 0.5, max, reason: reason("location", i18n.t("reason.location.sameRegion"), 55) };
  }
  return { points: max * 0.15, max };
}

function categoryRule(viewer: Profile, categories: string[], max: number, i18n: I18n): Rule {
  const shared = categories.filter((c) => (viewer.categories as string[]).includes(c));
  if (shared.length === 0) return { points: 0, max };
  const label = shared
    .slice(0, 3)
    .map((c) => i18n.L.category[c as keyof typeof i18n.L.category] ?? c)
    .join(" · ");
  // Proportional to how much of the target's own profile you cover, not to how
  // much of yours they cover — otherwise a narrow target scores full marks
  // against everybody and the whole scale collapses at the top.
  return {
    points: (shared.length / categories.length) * max,
    max,
    reason: reason("category", label, 85),
  };
}

function skillRule(
  viewer: Profile,
  skillIds: string[],
  max: number,
  i18n: I18n,
  key: "reason.skill.shared" | "reason.skill.required" = "reason.skill.shared",
): Rule {
  const shared = skillIds.filter((s) => viewer.skillIds.includes(s));
  if (shared.length === 0) return { points: 0, max };
  const names = shared.slice(0, 3).map((s) => i18n.skill(s));
  return {
    points: (shared.length / skillIds.length) * max,
    max,
    reason: reason("skill", i18n.t(key, { skills: i18n.list(names) }), 95),
  };
}

function languageRule(viewer: Profile, languages: string[], max: number, i18n: I18n): Rule {
  const shared = languages.filter((l) => (viewer.languages as string[]).includes(l));
  if (shared.length === 0) return { points: 0, max };
  return {
    points: (shared.length / languages.length) * max,
    max,
    reason: reason(
      "language",
      shared.length > 1
        ? i18n.t("reason.language.shared", { count: shared.length })
        : i18n.t("reason.language.sharedOne"),
      60,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Person → Person                                                            */
/* -------------------------------------------------------------------------- */

export function scorePerson(viewer: PersonView, target: PersonView, i18n: I18n): MatchResult {
  const v = viewer.profile;
  const t = target.profile;

  const interestShared = overlapCount(t.interestIds, v.interestIds);
  const openToShared = t.openTo.filter((o) => v.openTo.includes(o));
  const mentorshipFit =
    v.openTo.includes("mentorship") &&
    t.openTo.includes("mentorship") &&
    (t.experience === "expert" || t.experience === "established") &&
    (v.experience === "student" || v.experience === "emerging");

  // Complementary skills matter as much as shared ones: a makeup student and a
  // photographer match precisely because one brings what the other lacks. We
  // count skills inside the viewer's own categories that the viewer does not
  // have — close enough to be useful, different enough to be worth the meeting.
  const complementary = t.skillIds.filter((s) => {
    const category = SKILL_BY_ID.get(s)?.category;
    if (category === undefined) return false;
    return v.categories.includes(category) && !v.skillIds.includes(s);
  });

  const rules: Rule[] = [
    categoryRule(v, t.categories, 22, i18n),
    skillRule(v, t.skillIds, 16, i18n),
    {
      points: complementary.length > 0 ? Math.min(12, complementary.length * 3) : 0,
      max: 12,
      reason:
        complementary.length > 0
          ? reason(
              "skill",
              i18n.t("reason.skill.complementary", {
                skills: i18n.list(complementary.slice(0, 2).map((s) => i18n.skill(s))),
              }),
              80,
            )
          : undefined,
    },
    locationRule(v, [t.cityId], 20, "person", i18n),
    languageRule(v, t.languages, 12, i18n),
    {
      points: interestShared > 0 ? Math.min(14, interestShared * 4) : 0,
      max: 14,
      reason:
        interestShared > 0
          ? reason("interest", i18n.t("reason.interest.shared", { count: interestShared }), 70)
          : undefined,
    },
    {
      points: openToShared.length > 0 ? Math.min(12, openToShared.length * 4) : 0,
      max: 12,
      reason:
        openToShared.length > 0
          ? reason(
              "opportunity",
              i18n.t("reason.opportunity.bothOpen", { what: i18n.L.openTo[openToShared[0]] }),
              75,
            )
          : undefined,
    },
    {
      points: t.availability === "open-now" ? 10 : t.availability === "next-month" ? 6 : 2,
      max: 10,
      reason:
        t.availability === "open-now"
          ? reason("availability", i18n.t("reason.availability.openNow"), 50)
          : undefined,
    },
    {
      points: mentorshipFit ? 12 : 0,
      max: 12,
      reason: mentorshipFit
        ? reason("experience", i18n.t("reason.experience.mentorship", { role: i18n.L.role[t.role] }), 78)
        : undefined,
    },
    {
      points: t.targetCityIds.includes(v.cityId) ? 10 : 0,
      max: 10,
      reason: t.targetCityIds.includes(v.cityId)
        ? reason("goal", i18n.t("reason.goal.wantsCity", { city: i18n.city(v.cityId) }), 88)
        : undefined,
    },
  ];

  const { score, reasons } = accumulate(rules);
  return {
    id: `m-person-${target.id}`,
    targetKind: "person",
    targetId: target.id,
    score,
    reasons,
    narrative: personNarrative(viewer, target, i18n),
  };
}

/**
 * Built from the underlying data rather than by stitching reason labels
 * together — reason labels are written for chips, and read badly in a sentence.
 * Each clause is a complete sentence so the three languages that do not join
 * clauses the way English does still come out grammatical.
 */
function personNarrative(viewer: PersonView, target: PersonView, i18n: I18n): string {
  const v = viewer.profile;
  const t = target.profile;

  const sharedSkills = t.skillIds.filter((s) => v.skillIds.includes(s)).map((s) => i18n.skill(s));
  const sharedCategories = t.categories.filter((c) => v.categories.includes(c)).map((c) => i18n.L.category[c]);

  const what =
    sharedSkills.length > 0
      ? i18n.t("narrative.person.skills", { name: target.name, skills: i18n.list(sharedSkills.slice(0, 2)) })
      : sharedCategories.length > 0
        ? i18n.t("narrative.person.categories", {
            name: target.name,
            categories: i18n.list(sharedCategories.slice(0, 2)),
          })
        : i18n.t("narrative.person.different", { name: target.name });

  const where =
    t.targetCityIds.includes(v.cityId) && v.cityId !== t.cityId
      ? i18n.t("narrative.person.wantsCity", { city: i18n.city(v.cityId) })
      : t.cityId === v.cityId
        ? i18n.t("narrative.person.sameCity", { city: i18n.city(t.cityId) })
        : v.targetCityIds.includes(t.cityId)
          ? i18n.t("narrative.person.targetCity", { city: i18n.city(t.cityId) })
          : i18n.t("narrative.person.basedIn", { city: i18n.city(t.cityId) });

  const availability =
    t.availability === "open-now"
      ? i18n.t("narrative.person.openNow")
      : i18n.t("narrative.person.currently", { availability: i18n.L.availability[t.availability] });

  return i18n.sentences([what, where, availability]);
}

/* -------------------------------------------------------------------------- */
/* Person → Brand                                                             */
/* -------------------------------------------------------------------------- */

export function scoreBrand(viewer: PersonView, brand: Brand, i18n: I18n): MatchResult {
  const v = viewer.profile;
  const roles = [v.role, ...v.secondaryRoles];
  const roleMatch = brand.lookingFor.filter((r) => roles.includes(r));
  const openRoles = brand.openOpportunities.flatMap((o) => o.roles).filter((r) => roles.includes(r));
  const marketOverlap = brand.marketCityIds.filter((c) => v.targetCityIds.includes(c));
  const openCount = brand.openOpportunities.length;

  const rules: Rule[] = [
    categoryRule(v, brand.categories, 24, i18n),
    locationRule(v, [brand.cityId, ...brand.marketCityIds], 20, "brand", i18n),
    languageRule(v, brand.languages, 12, i18n),
    {
      points: (roleMatch.length / Math.max(1, brand.lookingFor.length)) * 20,
      max: 20,
      reason:
        roleMatch.length > 0
          ? reason(
              "opportunity",
              i18n.t("reason.opportunity.lookingFor", {
                roles: i18n.list(roleMatch.slice(0, 2).map((r) => i18n.L.role[r])),
              }),
              96,
            )
          : undefined,
    },
    {
      points: openRoles.length > 0 ? Math.min(16, openRoles.length * 8) : 0,
      max: 16,
      reason:
        openRoles.length > 0
          ? reason(
              "opportunity",
              openCount === 1
                ? i18n.t("reason.opportunity.openCountOne")
                : i18n.t("reason.opportunity.openCount", { count: openCount }),
              92,
            )
          : undefined,
    },
    {
      points: marketOverlap.length > 0 ? Math.min(14, marketOverlap.length * 5) : 0,
      max: 14,
      reason:
        marketOverlap.length > 0
          ? reason(
              "goal",
              i18n.t("reason.location.brandActive", {
                cities: i18n.list(marketOverlap.slice(0, 2).map((c) => i18n.city(c))),
              }),
              84,
            )
          : undefined,
    },
    {
      points: v.openTo.includes("brand-partnership") ? 10 : 4,
      max: 10,
      reason: v.openTo.includes("brand-partnership")
        ? reason("opportunity", i18n.t("reason.opportunity.youOpenBrand"), 58)
        : undefined,
    },
    {
      points: brand.type === "student-brand" && v.experience === "student" ? 10 : 0,
      max: 10,
      reason:
        brand.type === "student-brand" && v.experience === "student"
          ? reason("experience", i18n.t("reason.experience.studentBrand"), 66)
          : undefined,
    },
  ];

  const { score, reasons } = accumulate(rules);
  return {
    id: `m-brand-${brand.id}`,
    targetKind: "brand",
    targetId: brand.id,
    score,
    reasons,
    narrative:
      openRoles.length > 0
        ? i18n.t("narrative.brand.looking", {
            name: brand.name,
            roles: i18n.list(openRoles.slice(0, 2).map((r) => i18n.L.role[r])),
          })
        : i18n.t("narrative.brand.overlap", {
            name: brand.name,
            categories: i18n.list(brand.categories.slice(0, 2).map((c) => i18n.L.category[c])),
          }),
  };
}

/* -------------------------------------------------------------------------- */
/* Person → Project                                                           */
/* -------------------------------------------------------------------------- */

export function scoreProject(viewer: PersonView, project: Project, i18n: I18n): MatchResult {
  const v = viewer.profile;
  const roles = [v.role, ...v.secondaryRoles];
  const openSlots = project.roleSlots.filter((s) => s.filled < s.count);
  const matchingSlots = openSlots.filter((s) => roles.includes(s.role));
  const slotSkills = matchingSlots.flatMap((s) => s.skillIds);
  const skillHit = slotSkills.filter((s) => v.skillIds.includes(s));

  const rules: Rule[] = [
    categoryRule(v, project.categories, 24, i18n),
    skillRule(v, project.requiredSkillIds, 20, i18n, "reason.skill.required"),
    locationRule(v, project.cityIds, 22, "project", i18n),
    languageRule(v, project.languages, 10, i18n),
    {
      points: openSlots.length > 0 ? (matchingSlots.length / openSlots.length) * 20 : 0,
      max: 20,
      reason:
        matchingSlots.length > 0
          ? reason(
              "opportunity",
              i18n.t("reason.opportunity.openSlot", {
                roles: i18n.list(matchingSlots.slice(0, 2).map((s) => i18n.L.role[s.role])),
              }),
              98,
            )
          : undefined,
    },
    {
      points: skillHit.length > 0 ? Math.min(14, skillHit.length * 7) : 0,
      max: 14,
      reason:
        skillHit.length > 0
          ? reason(
              "skill",
              i18n.t("reason.skill.roleNeeds", {
                skills: i18n.list(skillHit.slice(0, 2).map((s) => i18n.skill(s))),
              }),
              94,
            )
          : undefined,
    },
    {
      points: project.status === "recruiting" ? 12 : project.status === "in-progress" ? 5 : 0,
      max: 12,
      reason:
        project.status === "recruiting"
          ? reason("availability", i18n.t("reason.availability.recruiting"), 72)
          : undefined,
    },
    {
      points: project.remoteFriendly && v.availability !== "busy" ? 8 : 0,
      max: 8,
      reason: project.remoteFriendly
        ? reason("availability", i18n.t("reason.availability.remote"), 46)
        : undefined,
    },
    {
      points: v.openTo.includes("projects") ? 6 : 0,
      max: 6,
    },
  ];

  const { score, reasons } = accumulate(rules);
  const sharedCats = project.categories
    .filter((c) => v.categories.includes(c))
    .map((c) => i18n.L.category[c]);

  return {
    id: `m-project-${project.id}`,
    targetKind: "project",
    targetId: project.id,
    score,
    reasons,
    narrative:
      sharedCats.length > 0
        ? matchingSlots.length > 0
          ? i18n.t("narrative.project.skillsWithSlot", {
              categories: i18n.list(sharedCats.slice(0, 2)),
              role: i18n.L.role[matchingSlots[0].role],
            })
          : i18n.t("narrative.project.skills", { categories: i18n.list(sharedCats.slice(0, 2)) })
        : i18n.t("narrative.project.cities", {
            cities: i18n.list(project.cityIds.slice(0, 2).map((c) => i18n.city(c))),
          }),
  };
}

/* -------------------------------------------------------------------------- */
/* Person → Event                                                             */
/* -------------------------------------------------------------------------- */

export function scoreEvent(viewer: PersonView, event: BeautyEvent, i18n: I18n): MatchResult {
  const v = viewer.profile;
  const rules: Rule[] = [
    categoryRule(v, event.categories, 26, i18n),
    locationRule(v, [event.cityId], 24, "event", i18n),
    languageRule(v, event.languages, 12, i18n),
    {
      points: event.online ? 12 : 0,
      max: 12,
      reason: event.online
        ? reason("availability", i18n.t("reason.availability.online"), 55)
        : undefined,
    },
    {
      points: event.type === "meetup" || event.type === "networking" ? 12 : 6,
      max: 12,
      reason:
        event.type === "meetup" || event.type === "networking"
          ? reason("opportunity", i18n.t("reason.opportunity.meetPeople"), 68)
          : undefined,
    },
    {
      points: event.type === "workshop" && v.experience === "student" ? 12 : 4,
      max: 12,
      reason:
        event.type === "workshop" && v.experience === "student"
          ? reason("experience", i18n.t("reason.experience.handsOn"), 64)
          : undefined,
    },
  ];

  const { score, reasons } = accumulate(rules);
  return {
    id: `m-event-${event.id}`,
    targetKind: "event",
    targetId: event.id,
    score,
    reasons,
    narrative: i18n.t("narrative.event", {
      title: i18n.content(`${event.id}.title`, event.title),
      city: i18n.city(event.cityId),
      categories: i18n.list(event.categories.slice(0, 2).map((c) => i18n.L.category[c])),
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* Person → City                                                              */
/* -------------------------------------------------------------------------- */

export interface CityOpportunityCounts {
  projects: number;
  brands: number;
  events: number;
  people: number;
}

export function scoreCity(
  viewer: PersonView,
  city: City,
  counts: CityOpportunityCounts,
  i18n: I18n,
): MatchResult {
  const v = viewer.profile;
  const sceneOverlap = city.scenes.filter((s) => v.categories.includes(s));
  const isTarget = v.targetCityIds.includes(city.id);
  const isHome = v.cityId === city.id;

  const rules: Rule[] = [
    {
      points: isHome ? 22 : isTarget ? 20 : 4,
      max: 22,
      reason: isHome
        ? reason("location", i18n.t("reason.location.homeCity"), 90)
        : isTarget
          ? reason("goal", i18n.t("reason.goal.onTargetList"), 92)
          : undefined,
    },
    {
      points: sceneOverlap.length > 0 ? Math.min(24, sceneOverlap.length * 9) : 0,
      max: 24,
      reason:
        sceneOverlap.length > 0
          ? reason(
              "category",
              i18n.t("reason.category.strongIn", {
                categories: i18n.list(sceneOverlap.slice(0, 2).map((s) => i18n.L.category[s])),
              }),
              86,
            )
          : undefined,
    },
    {
      points: Math.min(20, counts.projects * 4),
      max: 20,
      reason:
        counts.projects > 0
          ? reason("opportunity", i18n.t("reason.opportunity.matchingProjects", { count: counts.projects }), 96)
          : undefined,
    },
    {
      points: Math.min(14, counts.brands * 3),
      max: 14,
      reason:
        counts.brands > 0
          ? reason("opportunity", i18n.t("reason.opportunity.brandsHiring", { count: counts.brands }), 82)
          : undefined,
    },
    {
      points: Math.min(10, counts.events * 3),
      max: 10,
      reason:
        counts.events > 0
          ? reason("opportunity", i18n.t("reason.opportunity.upcomingEvents", { count: counts.events }), 62)
          : undefined,
    },
    {
      points: Math.min(10, counts.people * 1.5),
      max: 10,
      reason:
        counts.people > 0
          ? reason("interest", i18n.t("reason.interest.peopleInField", { count: counts.people }), 58)
          : undefined,
    },
  ];

  const { score, reasons } = accumulate(rules);
  return {
    id: `m-city-${city.id}`,
    targetKind: "city",
    targetId: city.id,
    score,
    reasons,
    narrative: i18n.t("narrative.city", {
      city: i18n.city(city.id),
      tagline: i18n.content(`${city.id}.tagline`, city.tagline),
    }),
  };
}

export type { MatchTargetKind };
