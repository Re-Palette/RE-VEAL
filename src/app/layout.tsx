import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { I18nProvider } from "@/lib/i18n/context";
import { getLanguage } from "@/lib/i18n/server";
import { getViewer } from "@/lib/auth/viewer";
import { db } from "@/lib/data-source";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RE:VEAL — Beauty Connects the World",
    template: "%s · RE:VEAL",
  },
  description:
    "RE:VEAL is a global beauty ecosystem. Discover people, brands, projects and events worldwide, match with collaborators, and build a portfolio that opens opportunities.",
  keywords: ["beauty", "global", "collaboration", "creators", "brands", "projects", "portfolio"],
};

export const viewport: Viewport = {
  themeColor: "#f6f7fc",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [language, viewerState, threads, notifications] = await Promise.all([
    getLanguage(),
    getViewer(),
    db.listThreads(),
    db.listNotifications(),
  ]);

  const viewer = viewerState.person;
  const account =
    viewerState.kind === "member"
      ? { kind: "member" as const, email: viewerState.member.email, image: viewerState.member.image }
      : { kind: "demo" as const };

  const counts = {
    messages: threads.reduce((total, thread) => total + (thread.unread > 0 ? 1 : 0), 0),
    notifications: notifications.filter((n) => !n.read).length,
  };

  return (
    <html lang={language} className={inter.variable}>
      <body className="font-sans antialiased">
        <I18nProvider initialLanguage={language}>
          <AppShell
            viewer={viewer}
            counts={counts}
            cityId={viewer.profile.cityId}
            account={account}
          >
            {children}
          </AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
