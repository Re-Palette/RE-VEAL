import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { messaging } from "@/lib/messaging";
import { MessagesView } from "@/app/messages/messages-view";

export const metadata: Metadata = {
  title: "Messages",
  description: "Direct, group, project and brand collaboration conversations.",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const [{ thread }, viewer, threads, people] = await Promise.all([
    searchParams,
    db.getCurrentUser(),
    db.listThreads(),
    db.listPeople(),
  ]);

  const messages = await messaging.listMessagesFor(
    threads.map((item) => item.id),
    viewer.id,
  );

  return (
    <MessagesView
      viewer={viewer}
      threads={threads}
      messages={messages}
      people={people}
      persists={messaging.persists}
      initialThreadId={thread}
    />
  );
}
