import { auth } from "@/auth";
import { isGoogleConfigured } from "@/lib/auth/config";
import type { MemberProfile } from "@/lib/auth/types";
import { CURRENT_USER_ID, PERSON_BY_ID } from "@/lib/data/people";
import { CITY_BY_ID } from "@/lib/data/geo";
import type { PersonView } from "@/lib/types";

/**
 * Who the product is rendering for.
 *
 * `demo` is the seeded profile the prototype has always used — it keeps the
 * app explorable without an account, and is what you get when Google is not
 * configured. `member` is a real signed-in Google account.
 *
 * Everything viewer-relative (match scores, messages, notifications,
 * connections) resolves through here, so there is exactly one place to change
 * when accounts move into a database.
 */
export type Viewer =
  | { kind: "demo"; person: PersonView; member: null }
  | { kind: "member"; person: PersonView; member: MemberProfile };

function demoPerson(): PersonView {
  const person = PERSON_BY_ID.get(CURRENT_USER_ID);
  if (!person) throw new Error(`Demo user ${CURRENT_USER_ID} missing from dataset`);
  return person;
}

/** Projects a signed-in account into the shape the rest of the app reads. */
export function personFromMember(member: MemberProfile): PersonView {
  const countryId = CITY_BY_ID.get(member.cityId)?.countryId ?? member.countryId;
  return {
    id: member.id,
    handle: member.email.split("@")[0] || member.id,
    name: member.name,
    avatarSeed: member.id,
    avatarUrl: member.image,
    createdAt: new Date().toISOString(),
    verified: false,
    profile: {
      userId: member.id,
      headline: member.headline,
      bio: "",
      role: member.role,
      secondaryRoles: member.secondaryRoles,
      categories: member.categories,
      skillIds: member.skillIds,
      interestIds: member.interestIds,
      languages: member.languages,
      countryId,
      cityId: member.cityId,
      experience: member.experience,
      yearsActive: 0,
      availability: member.availability,
      openTo: member.openTo,
      goals: member.goals,
      targetCityIds: member.targetCityIds,
      // A new account genuinely has none of these yet. Inventing numbers here
      // would be the one dishonest thing in the whole product.
      followers: 0,
      following: 0,
      connections: 0,
      achievements: [],
    },
  };
}

export async function getViewer(): Promise<Viewer> {
  if (isGoogleConfigured) {
    const session = await auth();
    if (session?.reveal) {
      return { kind: "member", person: personFromMember(session.reveal), member: session.reveal };
    }
  }
  return { kind: "demo", person: demoPerson(), member: null };
}

/** True when the signed-in account still has to answer the sign-up questions. */
export async function needsOnboarding(): Promise<boolean> {
  const viewer = await getViewer();
  return viewer.kind === "member" && !viewer.member.onboarded;
}
