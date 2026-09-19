import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { loadProfile } from "@/lib/profile-data";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Your Global Beauty Portfolio on RE:VEAL.",
};

export default async function MyProfilePage() {
  const viewer = await db.getCurrentUser();
  const data = await loadProfile(viewer);
  return <ProfileView person={viewer} connection="none" isSelf {...data} />;
}
