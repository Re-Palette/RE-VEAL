import type { LanguageCode, Message, MessageThread } from "@/lib/types";

export interface SendMessageInput {
  threadId: string;
  senderId: string;
  body: string;
  language: LanguageCode;
}

/**
 * Where conversations live.
 *
 * Split out of `DataSource` because messaging is the one part of RE:VEAL that
 * is written as well as read: the catalogue (people, brands, projects) stays
 * seeded while threads and messages move to a real database. Two
 * implementations exist — a seed-only store that keeps the prototype
 * explorable with no backend, and a Supabase-backed store that persists.
 */
export interface MessagingStore {
  readonly id: string;

  /** False when sends are accepted by the UI but not stored anywhere. */
  readonly persists: boolean;

  listThreads(viewerId: string): Promise<MessageThread[]>;
  listMessages(threadId: string, viewerId: string): Promise<Message[]>;

  /**
   * Every message in several threads at once, keyed by thread id.
   *
   * The inbox renders a preview for each conversation, so asking per thread
   * would multiply round trips by the number of conversations on every page
   * load. Threads the viewer does not belong to are omitted rather than
   * raising, since this is a bulk read.
   */
  listMessagesFor(threadIds: string[], viewerId: string): Promise<Record<string, Message[]>>;

  /** Inserts a message and returns it as stored. */
  sendMessage(input: SendMessageInput): Promise<Message>;

  /**
   * The id of the one-to-one thread between these two people, creating it on
   * first use. Returns the same id on every later call.
   */
  openDirectThread(viewerId: string, otherUserId: string): Promise<string>;

  /** Marks everything in the thread as seen by this viewer. */
  markRead(threadId: string, viewerId: string): Promise<void>;
}

/** Thrown when a viewer asks for a thread they are not part of. */
export class ThreadAccessError extends Error {
  constructor(threadId: string) {
    super(`Viewer is not a participant of thread ${threadId}`);
    this.name = "ThreadAccessError";
  }
}
