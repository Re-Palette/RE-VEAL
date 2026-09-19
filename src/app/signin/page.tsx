import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { auth, signIn } from "@/auth";
import { isGoogleConfigured } from "@/lib/auth/config";
import { getI18n } from "@/lib/i18n/server";
import { GoogleMark } from "@/components/auth/google-mark";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const [{ error, next }, i18n, session] = await Promise.all([searchParams, getI18n(), auth()]);
  const { t } = i18n;

  if (session?.reveal) redirect(session.reveal.onboarded ? (next ?? "/") : "/onboarding");

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="card-sheen px-7 pb-7 pt-8 sm:px-9">
          <Logo />
          <h1 className="mt-6 font-display text-[26px] font-semibold tracking-[-0.03em]">
            {t("auth.signIn.title")}
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-70">{t("auth.signIn.subtitle")}</p>

          {error && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-blush/30 bg-blush-soft/60 p-3.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#A85B7C]" />
              <div>
                <p className="text-[13px] font-semibold text-[#A85B7C]">{t("auth.error.title")}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-70">{t("auth.error.body")}</p>
              </div>
            </div>
          )}

          {isGoogleConfigured ? (
            <>
              <form
                className="mt-7"
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: next ?? "/onboarding" });
                }}
              >
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-ink-15 bg-white text-[15px] font-medium text-ink shadow-soft transition-all hover:border-lavender/40 hover:shadow-lift active:scale-[0.99]"
                >
                  <GoogleMark className="size-5" />
                  {t("auth.continueWithGoogle")}
                </button>
              </form>

              <p className="mt-4 text-[13px] leading-relaxed text-ink-50">{t("auth.signUpNote")}</p>
            </>
          ) : (
            <div className="mt-7 rounded-2xl border border-gold/30 bg-gold-soft/60 p-4">
              <p className="text-[13px] font-semibold text-[#7A6420]">{t("auth.notConfigured.title")}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-70">{t("auth.notConfigured.body")}</p>
            </div>
          )}

          <div className="mt-7 flex items-start gap-2.5 border-t border-ink-08 pt-5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint" />
            <p className="text-[12px] leading-relaxed text-ink-50">{t("auth.privacy")}</p>
          </div>

          <Button asChild variant="ghost" size="sm" className="mt-4 -ml-3">
            <Link href="/">
              {t("auth.exploreDemo")}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
