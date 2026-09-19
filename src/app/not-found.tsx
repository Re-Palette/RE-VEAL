import Link from "next/link";
import { Compass, Globe, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <PageContainer>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="mb-6 flex size-16 items-center justify-center rounded-3xl bg-lavender-soft">
          <Compass className="size-7 text-[#4B3BA0]" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-30">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {t("notFound.title")}
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-50">
          {t("notFound.description")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/">
              <Home />
              {t("notFound.home")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/map">
              <Globe />
              {t("notFound.map")}
            </Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
