import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { getI18n } from "@/lib/i18n/server";
import { BrandsDirectory } from "@/app/brands/brands-directory";
import { ListingSkeleton } from "@/components/ui/skeletons";

export const metadata: Metadata = {
  title: "Brands",
  description: "New beauty brands, student brands, D2C labels and established companies worldwide.",
};

export default async function BrandsPage() {
  const i18n = await getI18n();
  const [brands, matches] = await Promise.all([db.listBrands(), db.matchesFor("brand", 200, i18n.language)]);
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <BrandsDirectory brands={brands} matches={matches} />
    </Suspense>
  );
}
