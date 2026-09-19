import type {} from "next-auth/jwt";
import type {
  Availability,
  BeautyCategory,
  ExperienceLevel,
  LanguageCode,
  OpenTo,
  Role,
} from "@/lib/types";

/**
 * The RE:VEAL half of a signed-in account.
 *
 * There is no database yet, so this travels inside the encrypted session
 * cookie. Every field here is one the matching engine reads — a Google account
 * on its own tells us a name and an email, which is not enough to score a
 * single match, so sign-up has to collect the rest.
 *
 * When Supabase lands this becomes a row and the session carries only the id.
 */
export interface MemberProfile {
  /** Namespaced so a real account id can never collide with a seeded one. */
  id: string;
  name: string;
  email: string;
  image?: string;
  /** False until the sign-up questions are answered. */
  onboarded: boolean;
  headline: string;
  role: Role;
  secondaryRoles: Role[];
  categories: BeautyCategory[];
  skillIds: string[];
  interestIds: string[];
  languages: LanguageCode[];
  cityId: string;
  countryId: string;
  experience: ExperienceLevel;
  availability: Availability;
  openTo: OpenTo[];
  targetCityIds: string[];
  goals: string[];
}

/** What a brand-new Google account starts as, before onboarding. */
export function blankProfile(input: {
  id: string;
  name: string;
  email: string;
  image?: string;
}): MemberProfile {
  return {
    ...input,
    onboarded: false,
    headline: "",
    role: "creator",
    secondaryRoles: [],
    categories: [],
    skillIds: [],
    interestIds: [],
    languages: ["en"],
    cityId: "tokyo",
    countryId: "jp",
    experience: "emerging",
    availability: "open-now",
    openTo: ["collaboration"],
    targetCityIds: [],
    goals: [],
  };
}

declare module "next-auth" {
  interface Session {
    reveal: MemberProfile;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    reveal?: MemberProfile;
  }
}
