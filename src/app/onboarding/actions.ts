"use server";

import { redirect } from "next/navigation";
import { unstable_update } from "@/auth";
import type { MemberProfile } from "@/lib/auth/types";

export interface OnboardingInput {
  headline: string;
  role: MemberProfile["role"];
  cityId: string;
  categories: MemberProfile["categories"];
  skillIds: string[];
  openTo: MemberProfile["openTo"];
  targetCityIds: string[];
  languages: MemberProfile["languages"];
}

/**
 * Writes the sign-up answers into the session.
 *
 * With no database the profile lives in the encrypted session cookie, so
 * "saving" is updating the JWT. When Supabase lands this writes a row and the
 * session keeps only the id — the call site does not change.
 */
export async function completeOnboarding(input: OnboardingInput) {
  const patch: Partial<MemberProfile> = {
    ...input,
    headline: input.headline.trim(),
    onboarded: true,
  };

  // The payload is a patch that the jwt callback merges onto the existing
  // profile; Auth.js types it as a whole Session, hence the cast.
  await unstable_update({ reveal: patch } as unknown as Parameters<typeof unstable_update>[0]);
  redirect("/");
}
