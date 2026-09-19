import { cookies } from "next/headers";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE, createI18n, isLanguageCode, type I18n } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/types";

/**
 * Server-side locale.
 *
 * The language lives in a cookie rather than localStorage precisely so the
 * server can read it: page headings, filter labels and match reasons are all
 * rendered on the server, and a client-only locale would leave every one of
 * them stuck in English.
 */
export async function getLanguage(): Promise<LanguageCode> {
  const store = await cookies();
  const value = store.get(LANGUAGE_COOKIE)?.value;
  return isLanguageCode(value) ? value : DEFAULT_LANGUAGE;
}

export async function getI18n(): Promise<I18n> {
  return createI18n(await getLanguage());
}
