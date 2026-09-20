import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isGoogleConfigured } from "@/lib/auth/config";

/** Surfaces that only make sense for a real account. */
const PERSONAL = ["/messages", "/notifications", "/settings", "/portfolio", "/profile"];

/**
 * Discovery stays open — the map, people, brands, projects and events are the
 * point of the product and work fine as a demo. Only the personal surfaces
 * require an account, and only once Google is actually configured, so a fresh
 * clone still runs end to end without credentials.
 */
const guarded = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const member = request.auth?.reveal;

  if (!member) {
    if (PERSONAL.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
      const url = new URL("/signin", request.nextUrl);
      url.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Signed in but the sign-up questions are unanswered: nothing is personalised
  // until they are, so finish that first.
  if (!member.onboarded && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.nextUrl));
  }
  if (member.onboarded && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
});

/**
 * `auth()` spins up the session machinery for every request it wraps, and that
 * needs AUTH_SECRET — so wrapping unconditionally made a credential-free clone
 * log a MissingSecret error on every page view. With no Google credentials
 * there is nothing to gate anyway, so the wrapper is skipped entirely.
 */
export default isGoogleConfigured ? guarded : () => NextResponse.next();

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
