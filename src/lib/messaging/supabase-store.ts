import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/lib/supabase/server";
import { CURRENT_USER_ID } from "@/lib/data/people";
import { isSeedThreadId, seedMessages, seedThread } from "@/lib/messaging/seed-store";
import { THREADS } from "@/lib/data/social";
import type { LanguageCode, Message, MessageThread, ThreadKind } from "@/lib/types";
import { ThreadAccessError, type MessagingStore, type SendMessageInput } from "@/lib/messaging/types";

interface ThreadRow {
  id: string;
  kind: ThreadKind;
  title: string | null;
  project_id: string | null;
  brand_id: string | null;
  updated_at: string;
}

interface MessageRow {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  language: LanguageCode;
  created_at: string;
}

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`Supabase ${context} failed: ${error.message}`);
}

/**
 * Conversations in Postgres.
 *
 * The seeded conversations stay in the repository rather than being copied
 * into the database up front, because most of them are never touched. A seed
 * thread is materialised — thread row plus participant rows — the first time
 * someone actually writes to it, which keeps the foreign key honest without a
 * migration that has to be re-run whenever the seed data changes.
 *
 * Reads therefore merge two sources; writes only ever go to the database.
 */
export class SupabaseMessagingStore implements MessagingStore {
  readonly id = "supabase";
  readonly persists = true;

  private client(): SupabaseClient {
    const client = supabaseAdmin();
    if (!client) throw new Error("Supabase is not configured");
    return client;
  }

  /** Thread ids the viewer belongs to in the database, with their read marks. */
  private async memberships(viewerId: string): Promise<Map<string, string | null>> {
    const { data, error } = await this.client()
      .from("thread_participants")
      .select("thread_id, last_read_at")
      .eq("user_id", viewerId);
    fail("membership lookup", error);
    return new Map((data ?? []).map((row) => [row.thread_id as string, row.last_read_at as string | null]));
  }

  /** Seed threads this viewer can see. Only the demo profile owns any. */
  private seedThreadsFor(viewerId: string): MessageThread[] {
    return viewerId === CURRENT_USER_ID ? THREADS : [];
  }

  private async participantsOf(threadId: string): Promise<string[]> {
    const { data, error } = await this.client()
      .from("thread_participants")
      .select("user_id")
      .eq("thread_id", threadId);
    fail("participant lookup", error);
    return (data ?? []).map((row) => row.user_id as string);
  }

  /**
   * Copies a seeded thread into the database so messages can reference it.
   * Idempotent: a second call finds the row already there and does nothing.
   */
  private async materialise(threadId: string): Promise<void> {
    const seed = seedThread(threadId);
    if (!seed) return;

    const client = this.client();
    const { error: threadError } = await client.from("threads").upsert(
      {
        id: seed.id,
        kind: seed.kind,
        title: seed.title ?? null,
        project_id: seed.projectId ?? null,
        brand_id: seed.brandId ?? null,
        created_by: CURRENT_USER_ID,
        updated_at: seed.updatedAt,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    fail("thread materialisation", threadError);

    const { error: participantError } = await client.from("thread_participants").upsert(
      seed.participantUserIds.map((userId) => ({ thread_id: seed.id, user_id: userId })),
      { onConflict: "thread_id,user_id", ignoreDuplicates: true },
    );
    fail("participant materialisation", participantError);
  }

  /** Every participant of a thread, whether it is seeded, stored, or both. */
  private async allParticipants(threadId: string): Promise<string[]> {
    const seeded = seedThread(threadId)?.participantUserIds ?? [];
    const stored = await this.participantsOf(threadId);
    return [...new Set([...seeded, ...stored])];
  }

  private async assertMember(threadId: string, viewerId: string): Promise<void> {
    const participants = await this.allParticipants(threadId);
    if (!participants.includes(viewerId)) throw new ThreadAccessError(threadId);
  }

  async listThreads(viewerId: string): Promise<MessageThread[]> {
    const memberships = await this.memberships(viewerId);
    const storedIds = [...memberships.keys()];

    let storedThreads: ThreadRow[] = [];
    if (storedIds.length > 0) {
      const { data, error } = await this.client()
        .from("threads")
        .select("id, kind, title, project_id, brand_id, updated_at")
        .in("id", storedIds);
      fail("thread listing", error);
      storedThreads = (data ?? []) as ThreadRow[];
    }

    // Unread is "messages from someone else since I last opened this thread".
    const unreadByThread = new Map<string, number>();
    if (storedIds.length > 0) {
      const { data, error } = await this.client()
        .from("messages")
        .select("thread_id, sender_id, created_at")
        .in("thread_id", storedIds)
        .neq("sender_id", viewerId);
      fail("unread count", error);
      for (const row of (data ?? []) as Pick<MessageRow, "thread_id" | "sender_id" | "created_at">[]) {
        const readAt = memberships.get(row.thread_id) ?? null;
        if (readAt && row.created_at <= readAt) continue;
        unreadByThread.set(row.thread_id, (unreadByThread.get(row.thread_id) ?? 0) + 1);
      }
    }

    const participantsByThread = new Map<string, string[]>();
    if (storedIds.length > 0) {
      const { data, error } = await this.client()
        .from("thread_participants")
        .select("thread_id, user_id")
        .in("thread_id", storedIds);
      fail("participant listing", error);
      for (const row of data ?? []) {
        const key = row.thread_id as string;
        participantsByThread.set(key, [...(participantsByThread.get(key) ?? []), row.user_id as string]);
      }
    }

    const stored: MessageThread[] = storedThreads.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title ?? undefined,
      participantUserIds: participantsByThread.get(row.id) ?? [],
      projectId: row.project_id ?? undefined,
      brandId: row.brand_id ?? undefined,
      updatedAt: row.updated_at,
      unread: unreadByThread.get(row.id) ?? 0,
    }));

    // A seeded thread that has been written to now exists in both places; the
    // stored row is the current one, so it wins.
    const storedById = new Set(stored.map((t) => t.id));
    const seedOnly = this.seedThreadsFor(viewerId).filter((t) => !storedById.has(t.id));

    return [...stored, ...seedOnly].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listMessages(threadId: string, viewerId: string): Promise<Message[]> {
    await this.assertMember(threadId, viewerId);

    const { data, error } = await this.client()
      .from("messages")
      .select("id, thread_id, sender_id, body, language, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    fail("message listing", error);

    const stored: Message[] = ((data ?? []) as MessageRow[]).map((row) => ({
      id: row.id,
      threadId: row.thread_id,
      senderUserId: row.sender_id,
      body: row.body,
      language: row.language,
      createdAt: row.created_at,
    }));

    const seeded = isSeedThreadId(threadId) ? seedMessages(threadId) : [];
    return [...seeded, ...stored].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listMessagesFor(threadIds: string[], viewerId: string): Promise<Record<string, Message[]>> {
    if (threadIds.length === 0) return {};

    // One membership read covers the whole batch, and a seeded thread counts
    // as the viewer's even before it has been written to.
    const memberships = await this.memberships(viewerId);
    const seededIds = new Set(this.seedThreadsFor(viewerId).map((t) => t.id));
    const allowed = threadIds.filter((id) => memberships.has(id) || seededIds.has(id));
    if (allowed.length === 0) return {};

    const { data, error } = await this.client()
      .from("messages")
      .select("id, thread_id, sender_id, body, language, created_at")
      .in("thread_id", allowed)
      .order("created_at", { ascending: true });
    fail("bulk message listing", error);

    const byThread: Record<string, Message[]> = {};
    for (const id of allowed) byThread[id] = isSeedThreadId(id) ? [...seedMessages(id)] : [];

    for (const row of (data ?? []) as MessageRow[]) {
      (byThread[row.thread_id] ??= []).push({
        id: row.id,
        threadId: row.thread_id,
        senderUserId: row.sender_id,
        body: row.body,
        language: row.language,
        createdAt: row.created_at,
      });
    }

    for (const list of Object.values(byThread)) {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    return byThread;
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const body = input.body.trim();
    if (body.length === 0) throw new Error("Cannot send an empty message");

    await this.assertMember(input.threadId, input.senderId);
    if (isSeedThreadId(input.threadId)) await this.materialise(input.threadId);

    const { data, error } = await this.client()
      .from("messages")
      .insert({
        thread_id: input.threadId,
        sender_id: input.senderId,
        body,
        language: input.language,
      })
      .select("id, thread_id, sender_id, body, language, created_at")
      .single();
    fail("message insert", error);
    if (!data) throw new Error("Supabase message insert returned no row");

    const row = data as MessageRow;
    return {
      id: row.id,
      threadId: row.thread_id,
      senderUserId: row.sender_id,
      body: row.body,
      language: row.language,
      createdAt: row.created_at,
    };
  }

  async openDirectThread(viewerId: string, otherUserId: string): Promise<string> {
    if (viewerId === otherUserId) throw new Error("Cannot open a conversation with yourself");

    // A seeded conversation between these two is the same conversation, so
    // reuse it rather than opening a second empty one beside it.
    const seeded = this.seedThreadsFor(viewerId).find(
      (t) => t.kind === "direct" && t.participantUserIds.includes(otherUserId),
    );
    if (seeded) {
      await this.materialise(seeded.id);
      return seeded.id;
    }

    const client = this.client();
    const mine = await this.memberships(viewerId);
    if (mine.size > 0) {
      const { data, error } = await client
        .from("thread_participants")
        .select("thread_id")
        .eq("user_id", otherUserId)
        .in("thread_id", [...mine.keys()]);
      fail("direct thread lookup", error);

      const shared = (data ?? []).map((row) => row.thread_id as string);
      if (shared.length > 0) {
        const { data: threads, error: threadError } = await client
          .from("threads")
          .select("id")
          .eq("kind", "direct")
          .in("id", shared)
          .limit(1);
        fail("direct thread lookup", threadError);
        const existing = threads?.[0]?.id as string | undefined;
        if (existing) return existing;
      }
    }

    const { data, error } = await client
      .from("threads")
      .insert({ kind: "direct", created_by: viewerId })
      .select("id")
      .single();
    fail("thread insert", error);
    const threadId = data?.id as string | undefined;
    if (!threadId) throw new Error("Supabase thread insert returned no row");

    const { error: participantError } = await client.from("thread_participants").insert([
      { thread_id: threadId, user_id: viewerId },
      { thread_id: threadId, user_id: otherUserId },
    ]);
    fail("participant insert", participantError);

    return threadId;
  }

  async markRead(threadId: string, viewerId: string): Promise<void> {
    await this.assertMember(threadId, viewerId);
    if (isSeedThreadId(threadId)) await this.materialise(threadId);

    const { error } = await this.client()
      .from("thread_participants")
      .upsert(
        { thread_id: threadId, user_id: viewerId, last_read_at: new Date().toISOString() },
        { onConflict: "thread_id,user_id" },
      );
    fail("read receipt", error);
  }
}
