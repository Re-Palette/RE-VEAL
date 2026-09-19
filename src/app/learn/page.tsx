import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { LearnCatalogue } from "@/app/learn/learn-catalogue";

export const metadata: Metadata = {
  title: "Learn",
  description: "Beauty business, branding, marketing, craft and AI × Beauty courses taught by working professionals.",
};

export default async function LearnPage() {
  const courses = await db.listCourses();
  return <LearnCatalogue courses={courses} />;
}
