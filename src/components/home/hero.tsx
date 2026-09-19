"use client";

import Link from "next/link";
import { ArrowRight, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { formatCount } from "@/lib/utils";

export function HomeHero({
  stats,
  children,
}: {
  stats: { people: number; brands: number; projects: number; cities: number };
  children?: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden rounded-panel border border-white/70 glass shadow-lift">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(90% 120% at 8% 0%, #f0eaff 0%, transparent 58%), radial-gradient(80% 120% at 96% 12%, #e4f0fd 0%, transparent 55%), radial-gradient(70% 100% at 40% 110%, #fde9f1 0%, transparent 60%)",
        }}
      />

      <div className="relative grid grid-cols-[minmax(0,1fr)] gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:p-10 xl:p-12">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-50 backdrop-blur">
            <span className="size-1.5 rounded-full gradient-accent" />
            Global Beauty Ecosystem
          </span>

          <h1 className="mt-5 font-display text-[34px] font-semibold uppercase leading-[1.05] tracking-[-0.035em] sm:text-[46px] lg:text-[54px] xl:text-[60px]">
            <span className="text-gradient">{t("home.hero.title")}</span>
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-70 sm:text-base">
            {t("home.hero.subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/match?ai=1">
                <Sparkles />
                Start AI Match
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/map">
                <Globe />
                Open Global Map
              </Link>
            </Button>
          </div>

          <dl className="mt-8 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {[
              ["People", stats.people],
              ["Brands", stats.brands],
              ["Projects", stats.projects],
              ["Cities", stats.cities],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-30">{label}</dt>
                <dd className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]">
                  {formatCount(value as number)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative min-w-0">
          {children}
          <Link
            href="/map"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-70 transition-colors hover:text-lavender"
          >
            Explore every city
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
