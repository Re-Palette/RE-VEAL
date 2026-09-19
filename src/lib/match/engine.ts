import { CITY_BY_ID } from "@/lib/data/geo";
import { SKILL_BY_ID } from "@/lib/data/taxonomy";
import { AVAILABILITY_LABELS, CATEGORY_LABELS, ROLE_LABELS } from "@/lib/labels";
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
 * can render. Swapping in an LLM later means implementing MatchProvider — the
 * shape of what comes out does not change.
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

function locationRule(viewer: Profile, cityIds: string[], max: number): Rule {
  const wanted = cityIds.filter((id) => viewer.targetCityIds.includes(id));
  if (wanted.length > 0) {
    const names = wanted.map((id) => CITY_BY_ID.get(id)?.name ?? id);
    const viewerCity = CITY_BY_ID.get(viewer.cityId)?.name ?? viewer.cityId;
    const label = wanted.includes(viewer.cityId)
      ? `Based in ${viewerCity}, where you are`
      : `${viewerCity} × ${names.filter((n) => n !== viewerCity).join(" × ")}`;
    return { points: max, max, reason: reason("location", label, 90) };
  }
  const regions = new Set(cityIds.map((id) => CITY_BY_ID.get(id)?.region).filter(Boolean));
  const viewerRegion = CITY_BY_ID.get(viewer.cityId)?.region;
  if (viewerRegion && regions.has(viewerRegion)) {
    return { points: max * 0.5, max, reason: reason("location", "Same region as you", 55) };
  }
  return { points: max * 0.15, max };
}

function categoryRule(viewer: Profile, categories: string[], max: number): Rule {
  const shared = categories.filter((c) => (viewer.categories as string[]).includes(c));
  if (shared.length === 0) return { points: 0, max };
  const label = shared
    .slice(0, 3)
    .map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] ?? c)
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

function skillRule(viewer: Profile, skillIds: string[], max: number, label = "Shared skills"): Rule {
  const shared = skillIds.filter((s) => viewer.skillIds.includes(s));
  if (shared.length === 0) return { points: 0, max };
  const names = shared.slice(0, 3).map((s) => SKILL_BY_ID.get(s)?.label ?? s);
  return {
    points: (shared.length / skillIds.length) * max,
    max,
    reason: reason("skill", `${label}: ${names.join(", ")}`, 95),
  };
}

function languageRule(viewer: Profile, languages: string[], max: number): Rule {
  const shared = languages.filter((l) => (viewer.languages as string[]).includes(l));
  if (shared.length === 0) return { points: 0, max };
  return {
    points: (shared.length / languages.length) * max,
    max,
    reason: reason("language", `You share ${shared.length} language${shared.length > 1 ? "s" : ""}`, 60),
  };
}

/* -------------------------------------------------------------------------- */
/* Person → Person                                                            */
/* -------------------------------------------------------------------------- */

export function scorePerson(viewer: PersonView, target: PersonView): MatchResult {
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
    categoryRule(v, t.categories, 22),
    skillRule(v, t.skillIds, 16),
    {
      points: complementary.length > 0 ? Math.min(12, complementary.length * 3) : 0,
      max: 12,
      reason:
        complementary.length > 0
          ? reason(
              "skill",
              `Complementary: ${complementary
                .slice(0, 2)
                .map((s) => SKILL_BY_ID.get(s)?.label ?? s)
                .join(", ")}`,
              80,
            )
          : undefined,
    },
    locationRule(v, [t.cityId], 20),
    languageRule(v, t.languages, 12),
    {
      points: interestShared > 0 ? Math.min(14, interestShared * 4) : 0,
      max: 14,
      reason: interestShared > 0 ? reason("interest", `${interestShared} shared interests`, 70) : undefined,
    },
    {
      points: openToShared.length > 0 ? Math.min(12, openToShared.length * 4) : 0,
      max: 12,
      reason:
        openToShared.length > 0
          ? reason("opportunity", `Both open to ${openToShared[0].replace(/-/g, " ")}`, 75)
          : undefined,
    },
    {
      points: t.availability === "open-now" ? 10 : t.availability === "next-month" ? 6 : 2,
      max: 10,
      reason: t.availability === "open-now" ? reason("availability", "Available now", 50) : undefined,
    },
    {
      points: mentorshipFit ? 12 : 0,
      max: 12,
      reason: mentorshipFit ? reason("experience", `${ROLE_LABELS[t.role]} open to mentorship`, 78) : undefined,
    },
    {
      points: t.targetCityIds.includes(v.cityId) ? 10 : 0,
      max: 10,
      reason: t.targetCityIds.includes(v.cityId)
        ? reason("goal", `Wants to work in ${CITY_BY_ID.get(v.cityId)?.name}`, 88)
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
    narrative: personNarrative(viewer, target),
  };
}

function listPhrase(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Built from the underlying data rather than by stitching reason labels
 * together — reason labels are written for chips, and read badly in a sentence.
 */
function personNarrative(viewer: PersonView, target: PersonView): string {
  const v = viewer.profile;
  const t = target.profile;

  const sharedSkills = t.skillIds
    .filter((s) => v.skillIds.includes(s))
    .map((s) => SKILL_BY_ID.get(s)?.label ?? s);
  const sharedCategories = t.categories.filter((c) => v.categories.includes(c)).map((c) => CATEGORY_LABELS[c]);
  const targetCity = CITY_BY_ID.get(t.cityId)?.name ?? "";
  const viewerCity = CITY_BY_ID.get(v.cityId)?.name ?? "";

  const clauses: string[] = [];
  if (sharedSkills.length > 0) {
    clauses.push(`shares ${listPhrase(sharedSkills.slice(0, 2))} with you`);
  } else if (sharedCategories.length > 0) {
    clauses.push(`works in ${listPhrase(sharedCategories.slice(0, 2))}, like you`);
  }

  if (t.targetCityIds.includes(v.cityId) && v.cityId !== t.cityId) {
    clauses.push(`wants to work in ${viewerCity}`);
  } else if (t.cityId === v.cityId) {
    clauses.push(`is in ${targetCity} too`);
  } else if (v.targetCityIds.includes(t.cityId)) {
    clauses.push(`is based in ${targetCity}, a city on your list`);
  } else {
    clauses.push(`is based in ${targetCity}`);
  }

  const availability =
    t.availability === "open-now"
      ? "Open to new work right now."
      : `Currently ${AVAILABILITY_LABELS[t.availability].toLowerCase()}.`;

  return `${target.name} ${listPhrase(clauses)}. ${availability}`;
}

/* -------------------------------------------------------------------------- */
/* Person → Brand                                                             */
/* -------------------------------------------------------------------------- */

export function scoreBrand(viewer: PersonView, brand: Brand): MatchResult {
  const v = viewer.profile;
  const roles = [v.role, ...v.secondaryRoles];
  const roleMatch = brand.lookingFor.filter((r) => roles.includes(r));
  const openRoles = brand.openOpportunities.flatMap((o) => o.roles).filter((r) => roles.includes(r));
  const marketOverlap = brand.marketCityIds.filter((c) => v.targetCityIds.includes(c));

  const rules: Rule[] = [
    categoryRule(v, brand.categories, 24),
    locationRule(v, [brand.cityId, ...brand.marketCityIds], 20),
    languageRule(v, brand.languages, 12),
    {
      points: (roleMatch.length / brand.lookingFor.length) * 20,
      max: 20,
      reason:
        roleMatch.length > 0
          ? reason("opportunity", `Looking for ${roleMatch.map((r) => ROLE_LABELS[r]).slice(0, 2).join(" and ")}`, 96)
          : undefined,
    },
    {
      points: openRoles.length > 0 ? Math.min(16, openRoles.length * 8) : 0,
      max: 16,
      reason:
        openRoles.length > 0
          ? reason("opportunity", `${brand.openOpportunities.length} open opportunit${brand.openOpportunities.length === 1 ? "y" : "ies"}`, 92)
          : undefined,
    },
    {
      points: marketOverlap.length > 0 ? Math.min(14, marketOverlap.length * 5) : 0,
      max: 14,
      reason:
        marketOverlap.length > 0
          ? reason(
              "goal",
              `Active in ${marketOverlap.slice(0, 2).map((c) => CITY_BY_ID.get(c)?.name).join(" and ")}`,
              84,
            )
          : undefined,
    },
    {
      points: v.openTo.includes("brand-partnership") ? 10 : 4,
      max: 10,
      reason: v.openTo.includes("brand-partnership")
        ? reason("opportunity", "You are open to brand partnership", 58)
        : undefined,
    },
    {
      points: brand.type === "student-brand" && v.experience === "student" ? 10 : 0,
      max: 10,
      reason:
        brand.type === "student-brand" && v.experience === "student"
          ? reason("experience", "Student-run brand", 66)
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
        ? `${brand.name} is actively looking for ${openRoles.slice(0, 2).map((r) => ROLE_LABELS[r]).join(" and ")} — which is what you do.`
        : `${brand.name} works in ${brand.categories.map((c) => CATEGORY_LABELS[c]).slice(0, 2).join(" and ")}, overlapping with your focus.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Person → Project                                                           */
/* -------------------------------------------------------------------------- */

export function scoreProject(viewer: PersonView, project: Project): MatchResult {
  const v = viewer.profile;
  const roles = [v.role, ...v.secondaryRoles];
  const openSlots = project.roleSlots.filter((s) => s.filled < s.count);
  const matchingSlots = openSlots.filter((s) => roles.includes(s.role));
  const slotSkills = matchingSlots.flatMap((s) => s.skillIds);
  const skillHit = slotSkills.filter((s) => v.skillIds.includes(s));

  const rules: Rule[] = [
    categoryRule(v, project.categories, 24),
    skillRule(v, project.requiredSkillIds, 20, "Required skills you have"),
    locationRule(v, project.cityIds, 22),
    languageRule(v, project.languages, 10),
    {
      points: openSlots.length > 0 ? (matchingSlots.length / openSlots.length) * 20 : 0,
      max: 20,
      reason:
        matchingSlots.length > 0
          ? reason(
              "opportunity",
              `Open place for ${matchingSlots.map((s) => ROLE_LABELS[s.role]).slice(0, 2).join(" / ")}`,
              98,
            )
          : undefined,
    },
    {
      points: skillHit.length > 0 ? Math.min(14, skillHit.length * 7) : 0,
      max: 14,
      reason:
        skillHit.length > 0
          ? reason("skill", `Role needs ${skillHit.map((s) => SKILL_BY_ID.get(s)?.label).slice(0, 2).join(", ")}`, 94)
          : undefined,
    },
    {
      points: project.status === "recruiting" ? 12 : project.status === "in-progress" ? 5 : 0,
      max: 12,
      reason: project.status === "recruiting" ? reason("availability", "Recruiting now", 72) : undefined,
    },
    {
      points: project.remoteFriendly && v.availability !== "busy" ? 8 : 0,
      max: 8,
      reason: project.remoteFriendly ? reason("availability", "Remote friendly", 46) : undefined,
    },
    {
      points: v.openTo.includes("projects") ? 6 : 0,
      max: 6,
    },
  ];

  const { score, reasons } = accumulate(rules);
  const sharedCats = project.categories.filter((c) => v.categories.includes(c)).map((c) => CATEGORY_LABELS[c]);
  return {
    id: `m-project-${project.id}`,
    targetKind: "project",
    targetId: project.id,
    score,
    reasons,
    narrative:
      sharedCats.length > 0
        ? `Your skills in ${sharedCats.slice(0, 2).join(" and ")} strongly match this project${
            matchingSlots.length > 0 ? `, and there is an open ${ROLE_LABELS[matchingSlots[0].role]} place.` : "."
          }`
        : `This project works across ${project.cityIds.map((c) => CITY_BY_ID.get(c)?.name).slice(0, 2).join(" and ")} — cities on your list.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Person → Event                                                             */
/* -------------------------------------------------------------------------- */

export function scoreEvent(viewer: PersonView, event: BeautyEvent): MatchResult {
  const v = viewer.profile;
  const rules: Rule[] = [
    categoryRule(v, event.categories, 26),
    locationRule(v, [event.cityId], 24),
    languageRule(v, event.languages, 12),
    {
      points: event.online ? 12 : 0,
      max: 12,
      reason: event.online ? reason("availability", "Join online from anywhere", 55) : undefined,
    },
    {
      points: event.type === "meetup" || event.type === "networking" ? 12 : 6,
      max: 12,
      reason:
        event.type === "meetup" || event.type === "networking"
          ? reason("opportunity", "Built for meeting people", 68)
          : undefined,
    },
    {
      points: event.type === "workshop" && v.experience === "student" ? 12 : 4,
      max: 12,
      reason:
        event.type === "workshop" && v.experience === "student"
          ? reason("experience", "Hands-on, good for students", 64)
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
    narrative: `${event.title} in ${CITY_BY_ID.get(event.cityId)?.name} covers ${event.categories
      .map((c) => CATEGORY_LABELS[c])
      .slice(0, 2)
      .join(" and ")}.`,
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

export function scoreCity(viewer: PersonView, city: City, counts: CityOpportunityCounts): MatchResult {
  const v = viewer.profile;
  const sceneOverlap = city.scenes.filter((s) => v.categories.includes(s));
  const isTarget = v.targetCityIds.includes(city.id);
  const isHome = v.cityId === city.id;

  const rules: Rule[] = [
    {
      points: isHome ? 22 : isTarget ? 20 : 4,
      max: 22,
      reason: isHome
        ? reason("location", "Your home city", 90)
        : isTarget
          ? reason("goal", "On your target list", 92)
          : undefined,
    },
    {
      points: sceneOverlap.length > 0 ? Math.min(24, sceneOverlap.length * 9) : 0,
      max: 24,
      reason:
        sceneOverlap.length > 0
          ? reason("category", `Strong in ${sceneOverlap.map((s) => CATEGORY_LABELS[s]).slice(0, 2).join(" and ")}`, 86)
          : undefined,
    },
    {
      points: Math.min(20, counts.projects * 4),
      max: 20,
      reason: counts.projects > 0 ? reason("opportunity", `${counts.projects} matching projects`, 96) : undefined,
    },
    {
      points: Math.min(14, counts.brands * 3),
      max: 14,
      reason: counts.brands > 0 ? reason("opportunity", `${counts.brands} brands hiring or collaborating`, 82) : undefined,
    },
    {
      points: Math.min(10, counts.events * 3),
      max: 10,
      reason: counts.events > 0 ? reason("opportunity", `${counts.events} upcoming events`, 62) : undefined,
    },
    {
      points: Math.min(10, counts.people * 1.5),
      max: 10,
      reason: counts.people > 0 ? reason("interest", `${counts.people} people in your field`, 58) : undefined,
    },
  ];

  const { score, reasons } = accumulate(rules);
  return {
    id: `m-city-${city.id}`,
    targetKind: "city",
    targetId: city.id,
    score,
    reasons,
    narrative: `${city.name}: ${city.tagline}`,
  };
}

export type { MatchTargetKind };
