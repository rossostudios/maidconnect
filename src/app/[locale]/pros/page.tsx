import { setRequestLocale } from "next-intl/server";
import { ProsBenefitsSection } from "@/components/pros/benefits-section-client";
import { ProsFaqCtaSection } from "@/components/pros/faq-cta-section-client";
import { ProsHeroSection } from "@/components/pros/hero-section-client";
import { ProsHowItWorksSection } from "@/components/pros/how-it-works-section-client";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

/**
 * Pros Landing Page - For Professionals
 *
 * Dedicated landing page for household professionals interested in
 * joining the Casaora platform. Highlights benefits, process, and earnings.
 */

export default async function ProsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <ProsHeroSection />

        {/* Benefits Section */}
        <ProsBenefitsSection />

        {/* How It Works */}
        <ProsHowItWorksSection />

        {/* FAQ and Final CTA Sections */}
        <ProsFaqCtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
