import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, Clock, FileText, PlayCircle, Star, Users, Wrench } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SaveButton } from "@/components/actions/save-button";
import { CourseCard } from "@/components/cards/content-cards";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { LANGUAGE_LABELS } from "@/lib/i18n";
import { formatCount } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";
import type { Lesson } from "@/lib/types";

const LESSON_ICON: Record<Lesson["kind"], React.ComponentType<{ className?: string }>> = {
  video: PlayCircle,
  reading: FileText,
  workshop: Wrench,
  assignment: BookOpen,
};

export async function generateStaticParams() {
  const courses = await db.listCourses();
  return courses.map((course) => ({ id: course.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const course = await db.getCourse(id);
  if (!course) return { title: "Course" };
  return { title: course.title, description: course.summary };
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const i18n = await getI18n();
  const { id } = await params;
  const course = await db.getCourse(id);
  if (!course) notFound();

  const [courses, instructor] = await Promise.all([
    db.listCourses(),
    db.getPerson(course.instructorUserId),
  ]);

  const related = courses.filter((c) => c.id !== course.id && c.track === course.track).slice(0, 3);
  const hours = Math.floor(course.durationMinutes / 60);
  const minutes = course.durationMinutes % 60;

  return (
    <PageContainer>
      <Card className="overflow-hidden">
        <div className="relative h-28 sm:h-32" style={gradientStyle(course.coverSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          <Badge variant="ink" size="md" className="absolute left-5 top-5 sm:left-8">
            {i18n.L.learnTrack[course.track]}
          </Badge>
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 max-w-3xl">
              <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">
                {course.title}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-70">{course.summary}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-ink-50">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="size-4 text-ink-30" />
                  {i18n.L.courseLevel[course.level]}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-ink-30" />
                  {i18n.t("learn.lessonCount", { hours, minutes, count: course.lessons.length })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-4 fill-gold text-gold" />
                  {course.rating}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-ink-30" />
                  {i18n.t("learn.enrolled", { count: formatCount(course.enrolled) })}
                </span>
                <span>{course.languages.map((l) => LANGUAGE_LABELS[l]).join(" · ")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="accent" size="lg">
                {i18n.t("learn.startCourse")}
              </Button>
              <SaveButton size="sm" />
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
        <div className="min-w-0 space-y-6">
          <Card className="p-6 sm:p-8">
            <h2 className="mb-4 font-display text-lg font-semibold tracking-[-0.02em]">
              {i18n.t("learn.about")}
            </h2>
            <p className="text-[15px] leading-[1.75] text-ink-70">{course.description}</p>

            <h3 className="mb-3 mt-7 font-display text-sm font-semibold uppercase tracking-[0.14em]">
              {i18n.t("learn.outcomes")}
            </h3>
            <ul className="space-y-2.5">
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-70">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full gradient-accent" />
                  {outcome}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="mb-5 font-display text-lg font-semibold tracking-[-0.02em]">{i18n.t("learn.lessons")}</h2>
            <ol className="divide-y divide-ink-08">
              {course.lessons.map((lesson, index) => {
                const Icon = LESSON_ICON[lesson.kind];
                return (
                  <li key={lesson.id} className="flex items-center gap-4 py-3.5">
                    <span className="w-6 shrink-0 text-center font-display text-sm font-semibold text-ink-30">
                      {index + 1}
                    </span>
                    <Icon className="size-4 shrink-0 text-lavender" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{lesson.title}</span>
                      <span className="block text-xs text-ink-30">{i18n.L.lessonKind[lesson.kind]}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-50">
                      {i18n.t("learn.minutes", { count: lesson.minutes })}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <aside className="space-y-5">
          {instructor && (
            <Card className="p-5">
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                {i18n.t("learn.taughtBy")}
              </h2>
              <Link href={`/people/${instructor.id}`} className="flex items-center gap-3">
                <Avatar seed={instructor.avatarSeed} name={instructor.name} size="lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{instructor.name}</span>
                  <span className="block truncate text-xs text-ink-50">
                    {i18n.L.role[instructor.profile.role]}
                  </span>
                </span>
              </Link>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-50">{instructor.profile.headline}</p>
            </Card>
          )}

          {related.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.14em]">
                More in {i18n.L.learnTrack[course.track]}
              </h2>
              <div className="space-y-4">
                {related.map((other) => (
                  <CourseCard key={other.id} course={other} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}

export const dynamicParams = false;
