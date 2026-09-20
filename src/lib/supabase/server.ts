import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase access.
 *
 * Sessions live in an Auth.js JWT rather than Supabase Auth, so there is no
 * `auth.uid()` for row-level policies to key on. The messaging tables instead
 * have RLS enabled with no policies at all — which denies the anon and
 * publishable keys outright — and every query runs here, on the server, with
 * the service role key. Authorisation is the caller's job: the messaging store
 * checks thread membership before it reads or writes.
 *
 * `server-only` makes an accidental client import a build error rather than a
 * leaked credential.
 */

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

export const isSupabaseConfigured = Boolean(url && serviceKey);

let cached: SupabaseClient | null = null;

/** The service-role client, or null when Supabase is not configured. */
export function supabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  cached ??= createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
