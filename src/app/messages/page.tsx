import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { MessagesView } from "@/app/messages/messages-view";

export const metadata: Metadata = {
  title: "Messages",
  description: "Direct, group, project and brand collaboration conversations.",
};

export default async function MessagesPage() {
  const [viewer, threads, people] = await Promise.all([
    db.getCurrentUser(),
    db.listThreads(),
    db.listPeople(),
  ]);

  const entries = await Promise.all(
    threads.map(async (thread) => [thread.id, await db.listMessages(thread.id)] as const),
  );

  return (
    <MessagesView
      viewer={viewer}
      threads={threads}
      messages={Object.fromEntries(entries)}
      people={people}
    />
  );
}
