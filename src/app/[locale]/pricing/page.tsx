/**
 * Pricing Page - Transparent Marketplace Pricing
 *
 * Displays dual-audience pricing (customers vs professionals)
 * with transparent fee structure (15% marketplace, 25% concierge)
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CustomerPricingTab } from "@/components/pricing/customer-pricing-tab";
import { PricingFaqSection } from "@/components/pricing/pricing-faq-section";
import { PricingHero } from "@/components/pricing/pricing-hero";
import { ProfessionalPricingTab } from "@/components/pricing/professional-pricing-tab";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing.meta");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <PricingHero
          customerContent={<CustomerPricingTab />}
          professionalContent={<ProfessionalPricingTab />}
        />

        {/* FAQ Section */}
        <PricingFaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
