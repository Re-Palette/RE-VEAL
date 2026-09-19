import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { blankProfile, type MemberProfile } from "@/lib/auth/types";

/**
 * Google is only registered when credentials are present, so the app still
 * runs — in demo mode — for anyone who clones the repo without setting up an
 * OAuth client. See README for the Google Cloud Console steps.
 */
export const isGoogleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const authConfig: NextAuthConfig = {
  // Auth.js only auto-trusts the request host on Vercel, so without this a
  // local `npm start` or any self-hosted deployment fails with UntrustedHost.
  // Deployments behind a proxy that does not normalise the Host header should
  // pin AUTH_URL instead, which takes precedence over this.
  trustHost: true,

  providers: isGoogleConfigured
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID,
          clientSecret: process.env.AUTH_GOOGLE_SECRET,
          // Always show the account chooser: people testing this will have
          // several Google accounts and silently reusing one is confusing.
          authorization: { params: { prompt: "select_account" } },
        }),
      ]
    : [],

  // No database, so sessions are stateless and signed into a cookie.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/signin", error: "/signin" },

  callbacks: {
    async jwt({ token, account, profile, trigger, session }) {
      // First sign-in: seed the RE:VEAL profile from the Google account.
      if (account && profile) {
        const existing = token.reveal;
        const seeded = blankProfile({
          id: `g-${profile.sub ?? token.sub ?? "unknown"}`,
          name: (profile.name as string) ?? "",
          email: (profile.email as string) ?? "",
          image: (profile.picture as string) ?? undefined,
        });
        // Keep whatever the person already told us if they sign in again.
        token.reveal = existing ? { ...seeded, ...existing } : seeded;
      }

      // Onboarding and profile edits come back through update().
      if (trigger === "update" && session && typeof session === "object") {
        const patch = (session as unknown as { reveal?: Partial<MemberProfile> }).reveal;
        if (patch && token.reveal) token.reveal = { ...token.reveal, ...patch };
      }

      return token;
    },

    async session({ session, token }) {
      if (token.reveal) session.reveal = token.reveal;
      return session;
    },
  },
};
