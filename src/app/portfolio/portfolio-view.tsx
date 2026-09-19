"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, LayoutGrid, Share2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { PortfolioCard } from "@/components/cards/content-cards";
import { ChipGroup } from "@/components/filters/chip-group";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { CATEGORY_LABELS, OPEN_TO_LABELS } from "@/lib/labels";
import { formatCount } from "@/lib/utils";
import type { PersonView, PortfolioItem } from "@/lib/types";

type KindFilter = PortfolioItem["kind"] | "all";

const KINDS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "work", label: "Work" },
  { value: "project", label: "Projects" },
  { value: "campaign", label: "Campaigns" },
  { value: "editorial", label: "Editorial" },
  { value: "product", label: "Product" },
  { value: "award", label: "Awards" },
];

/**
 * Portfolio is the payoff of the whole product: what you have actually done in
 * the beauty industry, in a form you can send to a brand, a course or a job.
 */
export function PortfolioView({
  viewer,
  items,
  community,
}: {
  viewer: PersonView;
  items: PortfolioItem[];
  community: PortfolioItem[];
}) {
  const [kind, setKind] = useState<KindFilter>("all");

  const filtered = useMemo(
    () => (kind === "all" ? items : items.filter((item) => item.kind === kind)),
    [items, kind],
  );

  const totalReactions = items.reduce((sum, item) => sum + item.reactions, 0);
  const years = items.length > 0 ? Math.max(...items.map((i) => i.year)) - Math.min(...items.map((i) => i.year)) + 1 : 0;
  const categories = Array.from(new Set(items.flatMap((item) => item.categories)));

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Grow"
        title="Portfolio"
        description="Not a feed of posts — a record of what you have made, who you made it with, and what it was for."
        action={
          <>
            <Button variant="outline" size="md">
              <Share2 />
              Share
            </Button>
            <Button variant="primary" size="md">
              <Download />
              Export PDF
            </Button>
          </>
        }
      />

      <Card sheen className="mb-7 p-6 sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">
              {viewer.name} — {items.length} published {items.length === 1 ? "piece" : "pieces"}
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-70">
              This is what a brand, a project lead or a course sees when you apply. Everything here links back
              to the project it came from and the people credited on it.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Badge key={c} variant="lavender" size="sm">
                  {CATEGORY_LABELS[c]}
                </Badge>
              ))}
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-6">
            {[
              ["Pieces", String(items.length)],
              ["Reactions", formatCount(totalReactions)],
              ["Years", String(years)],
            ].map(([label, value]) => (
              <div key={label}>
                <dd className="font-display text-2xl font-semibold tracking-[-0.03em]">{value}</dd>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-ink-30">{label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 border-t border-ink-08 pt-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-30">
            This portfolio is visible to brands looking for
          </p>
          <div className="flex flex-wrap gap-1.5">
            {viewer.profile.openTo.map((o) => (
              <Badge key={o} variant="mint" size="md">
                {OPEN_TO_LABELS[o]}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <ChipGroup value={kind} onChange={setKind} options={KINDS} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="Nothing here yet"
          description="Join a project and the work you do on it lands here automatically, with credits attached."
          action={
            <Button asChild variant="accent">
              <Link href="/projects?status=recruiting">Find a project</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <section className="mt-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-30">
              From the community
            </p>
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              Work published this month
            </h2>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-70 transition-colors hover:text-lavender"
          >
            Discover more
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {community.map((item) => (
            <PortfolioCard key={item.id} item={item} showOwner />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
