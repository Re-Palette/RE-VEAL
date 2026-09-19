import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { isGoogleConfigured } from "@/lib/auth/config";
import { getI18n } from "@/lib/i18n/server";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function OnboardingPage() {
  if (!isGoogleConfigured) redirect("/");

  const [session, i18n] = await Promise.all([auth(), getI18n()]);
  if (!session?.reveal) redirect("/signin");
  if (session.reveal.onboarded) redirect("/");

  return (
    <OnboardingForm
      name={session.reveal.name}
      defaultLanguage={i18n.language}
      defaultCityId={session.reveal.cityId}
    />
  );
}
