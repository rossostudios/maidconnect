import { setRequestLocale } from "next-intl/server";
import { FaqSection } from "@/components/marketing/faq-section";
import { WelcomeTour } from "@/components/onboarding";
import { BenefitsGrid } from "@/components/sections/BenefitsGrid";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { HeroSectionWithABTest } from "@/components/sections/HeroSectionWithABTest";
import { PricingSection } from "@/components/sections/PricingSection";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Get the locale from params
  const { locale } = await params;

  // Set the locale for this request so server components can access it
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <main className="bg-neutral-50" data-tour="welcome">
        <HeroSectionWithABTest />
        <BenefitsSection />
        <BenefitsGrid />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <SiteFooter />
      <WelcomeTour autoStart />
    </div>
  );
}
