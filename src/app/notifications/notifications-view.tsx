"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  Heart,
  MessageCircle,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipGroup } from "@/components/filters/chip-group";
import { EmptyState } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n/context";
import type { Brand, Notification, NotificationKind, PersonView } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

const ICONS: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  match: Sparkles,
  "connect-request": UserPlus,
  "project-invitation": Users,
  "project-application": Users,
  "brand-collaboration": Building2,
  "event-reminder": CalendarDays,
  message: MessageCircle,
  follow: UserPlus,
  "portfolio-reaction": Heart,
};

type Filter = "all" | "unread" | NotificationKind;

export function NotificationsView({
  notifications,
  people,
  brands,
}: {
  notifications: Notification[];
  people: PersonView[];
  brands: Brand[];
}) {
  const { t, L } = useI18n();
  const [read, setRead] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Filter>("all");

  const personById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);

  const isRead = (notification: Notification) => read[notification.id] ?? notification.read;

  const filtered = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !isRead(notification);
    return notification.kind === filter;
  });

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={t("nav.personal")}
        title={t("notifications.title")}
        description={t("notifications.description")}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setRead(Object.fromEntries(notifications.map((n) => [n.id, true])))}
            >
              <Check />
              {t("notifications.markAllRead")}
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6">
        <ChipGroup
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all" as const, label: t("notifications.filter.all") },
            {
              value: "unread" as const,
              label:
                unreadCount > 0
                  ? t("notifications.filter.unreadCount", { count: unreadCount })
                  : t("notifications.filter.unread"),
            },
            { value: "match" as const, label: L.notification.match },
            { value: "project-invitation" as const, label: L.notification["project-invitation"] },
            { value: "brand-collaboration" as const, label: L.notification["brand-collaboration"] },
            { value: "event-reminder" as const, label: L.notification["event-reminder"] },
            { value: "message" as const, label: L.notification.message },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t("notifications.empty.title")}
          description={
            notifications.length === 0
              ? t("empty.newAccount.notifications")
              : t("notifications.empty.description")
          }
        />
      ) : (
        <Card className="divide-y divide-ink-08 overflow-hidden">
          {filtered.map((notification) => {
            const Icon = ICONS[notification.kind];
            const actor = notification.actorUserId ? personById.get(notification.actorUserId) : undefined;
            const brand = notification.actorBrandId ? brandById.get(notification.actorBrandId) : undefined;
            const unread = !isRead(notification);

            return (
              <Link
                key={notification.id}
                href={notification.href}
                onClick={() => setRead((current) => ({ ...current, [notification.id]: true }))}
                className={cn(
                  "group flex gap-4 p-4 transition-colors sm:p-5",
                  unread ? "bg-lavender-soft/30 hover:bg-lavender-soft/50" : "hover:bg-canvas",
                )}
              >
                {actor ? (
                  <Avatar seed={actor.avatarSeed} name={actor.name} size="md" />
                ) : brand ? (
                  <Avatar seed={brand.avatarSeed} name={brand.name} size="md" square />
                ) : (
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lavender-soft">
                    <Icon className="size-5 text-[#4B3BA0]" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={unread ? "lavender" : "default"} size="sm">
                      <Icon className="size-3" />
                      {L.notification[notification.kind]}
                    </Badge>
                    <span className="text-[11px] text-ink-30">{relativeTime(notification.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] font-medium leading-snug group-hover:text-lavender">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-50">{notification.body}</p>
                </div>

                {unread && <span className="mt-2 size-2 shrink-0 rounded-full gradient-accent" />}
              </Link>
            );
          })}
        </Card>
      )}
    </PageContainer>
  );
}
