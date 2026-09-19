"use client";

import Link from "next/link";
import { Clock, Heart, MessageSquare, Star, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BRAND_BY_ID } from "@/lib/data/brands";
import { PERSON_BY_ID } from "@/lib/data/people";
import { useI18n } from "@/lib/i18n/context";
import type { Course, LanguageCode, PortfolioItem, Post } from "@/lib/types";
import { formatCount, relativeTime } from "@/lib/utils";
import { gradientStyle } from "@/lib/visual";
import { TranslatableText } from "@/components/content/translatable-text";

/* Post --------------------------------------------------------------------- */

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const { L, city } = useI18n();
  const author = post.authorUserId ? PERSON_BY_ID.get(post.authorUserId) : undefined;
  const brand = post.authorBrandId ? BRAND_BY_ID.get(post.authorBrandId) : undefined;
  const authorName = author?.name ?? brand?.name ?? "RE:VEAL";
  const authorSeed = author?.avatarSeed ?? brand?.avatarSeed ?? post.coverSeed;
  const authorHref = author ? `/people/${author.id}` : brand ? `/brands/${brand.id}` : "/discover";

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      {/* The featured card spans two grid rows, so its cover grows to absorb the
          extra height rather than leaving a block of empty white beneath. */}
      <div
        className={featured ? "relative min-h-52 flex-1" : "relative h-36 shrink-0"}
        style={gradientStyle(post.coverSeed)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        <Badge variant="ink" size="sm" className="absolute left-4 top-3">
          {L.postKind[post.kind]}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3
          className={
            featured
              ? "font-display text-xl font-semibold leading-snug tracking-[-0.02em]"
              : "font-display text-[15px] font-semibold leading-snug tracking-[-0.01em]"
          }
        >
          {post.title}
        </h3>

        <TranslatableText
          text={post.body}
          from={post.language as LanguageCode}
          className={featured ? "mt-2.5 text-sm" : "mt-2 line-clamp-3 text-[13px]"}
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="sky" size="sm">
              {L.category[c]}
            </Badge>
          ))}
          {post.tags.slice(0, featured ? 3 : 1).map((tag) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2.5 border-t border-ink-08 pt-3.5">
          <Link href={authorHref} className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar seed={authorSeed} name={authorName} size="xs" square={Boolean(brand)} />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">{authorName}</span>
              <span className="block truncate text-[11px] text-ink-30">
                {city(post.cityId)} · {relativeTime(post.createdAt)}
              </span>
            </span>
          </Link>
          <span className="flex shrink-0 items-center gap-3 text-[11px] text-ink-30">
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" />
              {formatCount(post.likes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {post.comments}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}

/* Course ------------------------------------------------------------------- */

export function CourseCard({ course }: { course: Course }) {
  const { t, L } = useI18n();
  const instructor = PERSON_BY_ID.get(course.instructorUserId);
  const hours = Math.floor(course.durationMinutes / 60);
  const minutes = course.durationMinutes % 60;

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <Link href={`/learn/${course.id}`} className="flex h-full flex-col">
        <div className="relative h-24 shrink-0" style={gradientStyle(course.coverSeed)}>
          <div className="absolute inset-0 bg-gradient-to-t from-white/85 to-transparent" />
          <Badge variant="ink" size="sm" className="absolute left-4 top-3">
            {L.learnTrack[course.track]}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-ink-30">
            <span>{L.courseLevel[course.level]}</span>
            <span className="size-1 rounded-full bg-ink-15" />
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {t("learn.duration", { hours, minutes })}
            </span>
          </div>

          <h3 className="font-display text-[15px] font-semibold leading-snug tracking-[-0.01em]">{course.title}</h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-70">{course.summary}</p>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-08 pt-3.5">
            {instructor && (
              <span className="flex min-w-0 items-center gap-2">
                <Avatar seed={instructor.avatarSeed} name={instructor.name} size="xs" />
                <span className="truncate text-xs text-ink-50">{instructor.name}</span>
              </span>
            )}
            <span className="flex shrink-0 items-center gap-2.5 text-[11px] text-ink-50">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-gold text-gold" />
                {course.rating}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5 text-ink-30" />
                {formatCount(course.enrolled)}
              </span>
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

/* Portfolio ---------------------------------------------------------------- */

export function PortfolioCard({ item, showOwner = false }: { item: PortfolioItem; showOwner?: boolean }) {
  const { t, L, city } = useI18n();
  const owner = PERSON_BY_ID.get(item.userId);

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] shrink-0" style={gradientStyle(item.coverSeed)}>
        <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-transparent to-transparent" />
        <Badge variant="default" size="sm" className="absolute left-4 top-3 bg-white/85 backdrop-blur">
          {L.portfolioKind[item.kind]}
        </Badge>
        {item.featured && (
          <Badge variant="gold" size="sm" className="absolute right-4 top-3 bg-white/85 backdrop-blur">
            {t("portfolio.featured")}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[15px] font-semibold leading-snug tracking-[-0.01em]">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-70">{item.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="lavender" size="sm">
              {L.category[c]}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-08 pt-3.5 text-[11px] text-ink-30">
          {showOwner && owner ? (
            <Link href={`/people/${owner.id}`} className="flex min-w-0 items-center gap-2 hover:text-ink">
              <Avatar seed={owner.avatarSeed} name={owner.name} size="xs" />
              <span className="truncate">{owner.name}</span>
            </Link>
          ) : (
            <span>
              {city(item.cityId)} · {item.year}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3.5" />
            {formatCount(item.reactions)}
          </span>
        </div>
      </div>
    </Card>
  );
}
