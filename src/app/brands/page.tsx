import { Suspense } from "react";
import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { BrandsDirectory } from "@/app/brands/brands-directory";
import { ListingSkeleton } from "@/components/ui/skeletons";

export const metadata: Metadata = {
  title: "Brands",
  description: "New beauty brands, student brands, D2C labels and established companies worldwide.",
};

export default async function BrandsPage() {
  const [brands, matches] = await Promise.all([db.listBrands(), db.matchesFor("brand", 200)]);
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <BrandsDirectory brands={brands} matches={matches} />
    </Suspense>
  );
}
