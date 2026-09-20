import { SeedMessagingStore } from "@/lib/messaging/seed-store";
import { SupabaseMessagingStore } from "@/lib/messaging/supabase-store";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { MessagingStore } from "@/lib/messaging/types";

/**
 * Conversations persist when Supabase is configured and fall back to the
 * seeded, read-only inbox when it is not, so the prototype still runs for
 * anyone who clones the repository without a database.
 */
export const messaging: MessagingStore = isSupabaseConfigured
  ? new SupabaseMessagingStore()
  : new SeedMessagingStore();

export type { MessagingStore } from "@/lib/messaging/types";
export { ThreadAccessError } from "@/lib/messaging/types";
