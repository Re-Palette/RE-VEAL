import type { Connection, Message, MessageThread, Notification } from "@/lib/types";
import { CURRENT_USER_ID } from "@/lib/data/people";

const ME = CURRENT_USER_ID;

/* -------------------------------------------------------------------------- */
/* Connections                                                                */
/* -------------------------------------------------------------------------- */

const CONNECTED_TO = ["u-yuki", "u-hana", "u-mei", "u-yuna", "u-sakura", "u-haruto", "u-aiko", "u-kenji"];
const PENDING_TO = ["u-jihoon", "u-ploy"];

export const CONNECTIONS: Connection[] = [
  ...CONNECTED_TO.map((id, i) => ({
    id: `conn-${i}`,
    fromUserId: ME,
    toUserId: id,
    status: "connected" as const,
    createdAt: new Date(Date.UTC(2026, 5 + (i % 4), 3 + i)).toISOString(),
  })),
  ...PENDING_TO.map((id, i) => ({
    id: `conn-p${i}`,
    fromUserId: ME,
    toUserId: id,
    status: "pending" as const,
    createdAt: new Date(Date.UTC(2026, 8, 12 + i)).toISOString(),
  })),
];

export function connectionStatusFor(userId: string): Connection["status"] {
  return CONNECTIONS.find((c) => c.toUserId === userId)?.status ?? "none";
}

/* -------------------------------------------------------------------------- */
/* Messages                                                                   */
/* -------------------------------------------------------------------------- */

export const THREADS: MessageThread[] = [
  { id: "t-01", kind: "direct", participantUserIds: [ME, "u-jihoon"], updatedAt: "2026-09-19T08:12:00Z", unread: 2 },
  { id: "t-02", kind: "project", title: "GLOBAL BEAUTY PROJECT #012", participantUserIds: [ME, "u-jihoon", "u-yuki", "u-daniel", "u-hana"], projectId: "p-012", updatedAt: "2026-09-19T06:40:00Z", unread: 5 },
  { id: "t-03", kind: "brand", title: "LUMINA — Japan launch", participantUserIds: [ME, "u-mina"], brandId: "b-lumina", updatedAt: "2026-09-18T15:20:00Z", unread: 1 },
  { id: "t-04", kind: "direct", participantUserIds: [ME, "u-yuna"], updatedAt: "2026-09-18T11:05:00Z", unread: 0 },
  { id: "t-05", kind: "group", title: "Student Brand Lab — Asia Cohort", participantUserIds: [ME, "u-mei", "u-yuna", "u-chloe", "u-sakura", "u-kenji"], projectId: "p-018", updatedAt: "2026-09-17T22:31:00Z", unread: 0 },
  { id: "t-06", kind: "direct", participantUserIds: [ME, "u-yuki"], updatedAt: "2026-09-16T09:14:00Z", unread: 0 },
  { id: "t-07", kind: "direct", participantUserIds: [ME, "u-hana"], updatedAt: "2026-09-14T17:48:00Z", unread: 0 },
  { id: "t-08", kind: "brand", title: "Studio Nine — client brief", participantUserIds: [ME, "u-mei", "u-yuna"], brandId: "b-studio9", updatedAt: "2026-09-12T13:02:00Z", unread: 0 },
];

export const MESSAGES: Message[] = [
  { id: "m-0101", threadId: "t-01", senderUserId: "u-jihoon", body: "Rina — I saw your Chromatic Study series. The six-colour constraint is exactly the kind of thing we need for #012.", language: "en", createdAt: "2026-09-18T14:02:00Z" },
  { id: "m-0102", threadId: "t-01", senderUserId: ME, body: "ありがとうございます！嬉しいです。#012 のこと、もっと知りたいです。", language: "ja", createdAt: "2026-09-18T14:31:00Z" },
  { id: "m-0103", threadId: "t-01", senderUserId: "u-jihoon", body: "Short version: three cities, one crew, three weeks in March. We hold four student places and they are not token places — you would be on the floor doing the work.", language: "en", createdAt: "2026-09-19T08:10:00Z" },
  { id: "m-0104", threadId: "t-01", senderUserId: "u-jihoon", body: "Apply through the project page and mention we spoke. I will flag it to Yuki.", language: "en", createdAt: "2026-09-19T08:12:00Z" },

  { id: "m-0201", threadId: "t-02", senderUserId: "u-yuki", body: "Tokyo studio is confirmed for March 2–8. Daylight on the north side until about 3pm.", language: "en", createdAt: "2026-09-18T20:15:00Z" },
  { id: "m-0202", threadId: "t-02", senderUserId: "u-daniel", body: "I can bring the LA motion kit but I need to know by January for the freight.", language: "en", createdAt: "2026-09-19T02:44:00Z" },
  { id: "m-0203", threadId: "t-02", senderUserId: "u-hana", body: "Sending three direction boards tonight. One of them is deliberately bad so we have something to react against.", language: "en", createdAt: "2026-09-19T05:20:00Z" },
  { id: "m-0204", threadId: "t-02", senderUserId: "u-jihoon", body: "Still four makeup places and one designer place open. Keep sending people.", language: "en", createdAt: "2026-09-19T06:40:00Z" },

  { id: "m-0301", threadId: "t-03", senderUserId: "u-mina", body: "We are looking for four creators for the Japan launch who can explain formulation without dumbing it down. Your work reads as someone who would enjoy the science.", language: "en", createdAt: "2026-09-18T15:18:00Z" },
  { id: "m-0302", threadId: "t-03", senderUserId: "u-mina", body: "The brief is open until 15 November. Japanese-language delivery, English coordination.", language: "en", createdAt: "2026-09-18T15:20:00Z" },

  { id: "m-0401", threadId: "t-04", senderUserId: "u-yuna", body: "리나! Student Brand Lab 지원했어? 우리 같은 코호트면 좋겠다.", language: "ko", createdAt: "2026-09-18T10:50:00Z" },
  { id: "m-0402", threadId: "t-04", senderUserId: ME, body: "まだ準備中！来週出します。同じコホートになれたら最高だね。", language: "ja", createdAt: "2026-09-18T11:05:00Z" },

  { id: "m-0501", threadId: "t-05", senderUserId: "u-kenji", body: "Reminder: the cohort decides the category, not me. I will tell you when a decision is technically impossible and otherwise stay out of it.", language: "en", createdAt: "2026-09-17T21:10:00Z" },
  { id: "m-0502", threadId: "t-05", senderUserId: "u-mei", body: "Refill-compatible is non-negotiable for me. Everything else I am flexible on.", language: "en", createdAt: "2026-09-17T22:31:00Z" },

  { id: "m-0601", threadId: "t-06", senderUserId: "u-yuki", body: "Your lighting in the third look — was that one source or two?", language: "en", createdAt: "2026-09-16T08:40:00Z" },
  { id: "m-0602", threadId: "t-06", senderUserId: ME, body: "One source and a white board. 予算がなかっただけです。", language: "ja", createdAt: "2026-09-16T09:14:00Z" },

  { id: "m-0701", threadId: "t-07", senderUserId: "u-hana", body: "If you want a second pair of eyes on the Student Brand Lab application, send it over.", language: "en", createdAt: "2026-09-14T17:48:00Z" },

  { id: "m-0801", threadId: "t-08", senderUserId: "u-mei", body: "Client wants the deck by Friday. I can do layout if someone else writes it.", language: "en", createdAt: "2026-09-12T13:02:00Z" },
];

export function messagesForThread(threadId: string): Message[] {
  return MESSAGES.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export const NOTIFICATIONS: Notification[] = [
  { id: "n-01", kind: "match", title: "New 96% match", body: "Ji-hoon Park in Seoul matches your skills in Makeup and Video, and you both want to work across Japan and Korea.", href: "/people/u-jihoon", createdAt: "2026-09-19T08:30:00Z", read: false, actorUserId: "u-jihoon" },
  { id: "n-02", kind: "project-invitation", title: "Invited to GLOBAL BEAUTY PROJECT #012", body: "Ji-hoon Park invited you to apply for one of four student places on the Tokyo × Seoul × New York campaign.", href: "/projects/p-012", createdAt: "2026-09-19T08:12:00Z", read: false, actorUserId: "u-jihoon" },
  { id: "n-03", kind: "brand-collaboration", title: "LUMINA wants to work with creators in Japan", body: "Your profile matched their Japan launch campaign brief. Four places, open until 15 November.", href: "/brands/b-lumina", createdAt: "2026-09-18T15:20:00Z", read: false, actorBrandId: "b-lumina" },
  { id: "n-04", kind: "message", title: "New message from Mina Seo", body: "The brief is open until 15 November. Japanese-language delivery, English coordination.", href: "/messages", createdAt: "2026-09-18T15:20:00Z", read: false, actorUserId: "u-mina" },
  { id: "n-05", kind: "connect-request", title: "Hana Kimura accepted your connection", body: "You are now connected. She designs identity and packaging for small beauty brands in Osaka.", href: "/people/u-hana", createdAt: "2026-09-18T12:02:00Z", read: true, actorUserId: "u-hana" },
  { id: "n-06", kind: "portfolio-reaction", title: "Yuki Tanaka reacted to Chromatic Study", body: "Your editorial series passed 400 reactions this week.", href: "/portfolio", createdAt: "2026-09-17T19:40:00Z", read: true, actorUserId: "u-yuki" },
  { id: "n-07", kind: "event-reminder", title: "RE:VEAL Tokyo Meetup — 6 December", body: "You saved this event. Registration closes in three weeks and the last two editions sold out.", href: "/events/e-01", createdAt: "2026-09-17T09:00:00Z", read: true },
  { id: "n-08", kind: "project-application", title: "Student Brand Lab applications close soon", body: "The Asia cohort closes applications in December. Five of twelve places are already filled.", href: "/projects/p-018", createdAt: "2026-09-16T11:15:00Z", read: true },
  { id: "n-09", kind: "follow", title: "Ploy Suwan followed you", body: "Colour-maximalist makeup creator in Bangkok. You have four interests in common.", href: "/people/u-ploy", createdAt: "2026-09-15T16:22:00Z", read: true, actorUserId: "u-ploy" },
  { id: "n-10", kind: "match", title: "A new city matched your profile", body: "Seoul moved to 92% for you this week, driven by three new projects recruiting makeup and video.", href: "/map?city=seoul", createdAt: "2026-09-15T08:00:00Z", read: true },
  { id: "n-11", kind: "brand-collaboration", title: "Studio Nine posted an open call", body: "Student creatives in any city — paid client work, revenue share per project.", href: "/brands/b-studio9", createdAt: "2026-09-13T14:30:00Z", read: true, actorBrandId: "b-studio9" },
  { id: "n-12", kind: "portfolio-reaction", title: "Your Tokyo Student Beauty Awards entry was featured", body: "It now appears on the Discover page under Inspiration.", href: "/discover", createdAt: "2026-09-11T10:10:00Z", read: true },
];
