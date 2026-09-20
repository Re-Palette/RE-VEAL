"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getViewer } from "@/lib/auth/viewer";
import { messaging, ThreadAccessError } from "@/lib/messaging";
import type { LanguageCode } from "@/lib/types";

export interface SendResult {
  ok: boolean;
  /** A dictionary key, so the client renders it in the reader's language. */
  errorKey?: "messages.error.send" | "messages.error.access" | "messages.error.noStore";
}

/**
 * Writes a message as the signed-in viewer.
 *
 * The sender is taken from the session rather than the form, so a crafted
 * request cannot post as somebody else, and the store re-checks thread
 * membership before it writes.
 */
export async function sendMessageAction(
  threadId: string,
  body: string,
  language: LanguageCode,
): Promise<SendResult> {
  const trimmed = body.trim();
  if (trimmed.length === 0) return { ok: false, errorKey: "messages.error.send" };

  if (!messaging.persists) return { ok: false, errorKey: "messages.error.noStore" };

  const viewer = (await getViewer()).person;
  try {
    await messaging.sendMessage({ threadId, senderId: viewer.id, body: trimmed, language });
  } catch (error) {
    if (error instanceof ThreadAccessError) return { ok: false, errorKey: "messages.error.access" };
    console.error("sendMessageAction", error);
    return { ok: false, errorKey: "messages.error.send" };
  }

  revalidatePath("/messages");
  return { ok: true };
}

/** Clears the unread badge for this viewer. Best-effort: never blocks reading. */
export async function markThreadReadAction(threadId: string): Promise<void> {
  if (!messaging.persists) return;

  const viewer = (await getViewer()).person;
  try {
    await messaging.markRead(threadId, viewer.id);
  } catch (error) {
    if (error instanceof ThreadAccessError) return;
    console.error("markThreadReadAction", error);
    return;
  }
  revalidatePath("/messages");
}

/**
 * Opens the conversation with someone from their profile, creating it on first
 * use, and lands the viewer in it.
 */
export async function startConversationAction(personId: string): Promise<void> {
  const viewer = (await getViewer()).person;

  let threadId: string;
  try {
    threadId = await messaging.openDirectThread(viewer.id, personId);
  } catch (error) {
    console.error("startConversationAction", error);
    redirect("/messages");
  }

  revalidatePath("/messages");
  redirect(`/messages?thread=${encodeURIComponent(threadId)}`);
}
