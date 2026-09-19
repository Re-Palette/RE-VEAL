import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { SettingsView } from "@/app/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, location, availability, language and matching preferences.",
};

export default async function SettingsPage() {
  const viewer = await db.getCurrentUser();
  return <SettingsView viewer={viewer} />;
}
