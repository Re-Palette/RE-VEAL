import { MESSAGES, THREADS } from "@/lib/data/social";
import { CURRENT_USER_ID } from "@/lib/data/people";
import type { Message, MessageThread } from "@/lib/types";
import type { MessagingStore, SendMessageInput } from "@/lib/messaging/types";

/** The seeded conversation for a thread id, oldest first. */
export function seedMessages(threadId: string): Message[] {
  return MESSAGES.filter((m) => m.threadId === threadId).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function seedThread(threadId: string): MessageThread | undefined {
  return THREADS.find((t) => t.id === threadId);
}

export function isSeedThreadId(threadId: string): boolean {
  return THREADS.some((t) => t.id === threadId);
}

/**
 * Conversations with no backend: the seeded inbox belongs to the demo profile,
 * and a real signed-in account starts empty, which is the honest answer —
 * inventing an inbox for a brand-new user would be a lie.
 *
 * Sends are echoed back so the composer still feels alive, but `persists` is
 * false and the caller is expected to say so rather than imply delivery.
 */
export class SeedMessagingStore implements MessagingStore {
  readonly id = "seed";
  readonly persists = false;

  async listThreads(viewerId: string): Promise<MessageThread[]> {
    if (viewerId !== CURRENT_USER_ID) return [];
    return [...THREADS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listMessages(threadId: string, viewerId: string): Promise<Message[]> {
    if (viewerId !== CURRENT_USER_ID) return [];
    return seedMessages(threadId);
  }

  async listMessagesFor(threadIds: string[], viewerId: string): Promise<Record<string, Message[]>> {
    if (viewerId !== CURRENT_USER_ID) return {};
    return Object.fromEntries(threadIds.map((id) => [id, seedMessages(id)]));
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    return {
      id: `unsaved-${input.threadId}-${Date.now()}`,
      threadId: input.threadId,
      senderUserId: input.senderId,
      body: input.body,
      language: input.language,
      createdAt: new Date().toISOString(),
    };
  }

  async openDirectThread(viewerId: string, otherUserId: string): Promise<string> {
    const existing = THREADS.find(
      (t) =>
        t.kind === "direct" &&
        t.participantUserIds.includes(viewerId) &&
        t.participantUserIds.includes(otherUserId),
    );
    // Without storage a new conversation cannot outlive the request, so the
    // caller gets the seeded one when there is any, and nothing when not.
    if (!existing) throw new Error("Starting a conversation needs a configured database");
    return existing.id;
  }

  async markRead(): Promise<void> {
    // Nothing to write to.
  }
}
