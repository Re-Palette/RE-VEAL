import { NextResponse } from "next/server";
import { db } from "@/lib/data-source";

/**
 * Global search endpoint. The client never touches the data layer directly, so
 * moving from mock data to Supabase does not change a single component.
 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results = await db.search(query, 24);
  return NextResponse.json({ query, results });
}
