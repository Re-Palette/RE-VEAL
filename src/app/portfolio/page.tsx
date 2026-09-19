import type { Metadata } from "next";
import { db } from "@/lib/data-source";
import { PortfolioView } from "@/app/portfolio/portfolio-view";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Your record of work in the beauty industry — projects, campaigns, editorial and awards.",
};

export default async function PortfolioPage() {
  const viewer = await db.getCurrentUser();
  const [mine, all] = await Promise.all([db.listPortfolio(viewer.id), db.listPortfolio()]);

  const community = all
    .filter((item) => item.userId !== viewer.id && item.featured)
    .sort((a, b) => b.reactions - a.reactions)
    .slice(0, 8);

  return <PortfolioView viewer={viewer} items={mine} community={community} />;
}
