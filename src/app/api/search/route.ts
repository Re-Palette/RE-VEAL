import { NextResponse } from "next/server";
import { db } from "@/lib/data-source";
import { DEFAULT_LANGUAGE, isLanguageCode } from "@/lib/i18n";

/**
 * Global search endpoint. The client never touches the data layer directly, so
 * moving from mock data to Supabase does not change a single component.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q") ?? "";
  const lang = params.get("lang");
  const language = isLanguageCode(lang) ? lang : DEFAULT_LANGUAGE;
  const results = await db.search(query, 24, language);
  return NextResponse.json({ query, results });
}
