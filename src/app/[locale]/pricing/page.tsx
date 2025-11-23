/**
 * Pricing Page - Simple Airbnb-style Platform Fee
 *
 * Clear, transparent pricing with 15% service fee.
 * Professionals keep 100% of their rate.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { PricingPageClient } from "./pricing-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing.meta");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <PricingPageClient />
      </main>
      <SiteFooter />
    </div>
  );
}
