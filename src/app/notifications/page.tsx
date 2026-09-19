import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { NotificationsView } from "@/app/notifications/notifications-view";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Matches, invitations, applications and collaboration requests.",
};

export default async function NotificationsPage() {
  const [notifications, people, brands] = await Promise.all([
    db.listNotifications(),
    db.listPeople(),
    db.listBrands(),
  ]);
  return <NotificationsView notifications={notifications} people={people} brands={brands} />;
}
