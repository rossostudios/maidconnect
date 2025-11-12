import { setRequestLocale } from "next-intl/server";
import { WelcomeTour } from "@/components/onboarding";
import { BenefitsGrid } from "@/components/sections/BenefitsGrid";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogoCloud } from "@/components/sections/LogoCloud";
import { MetricsSection } from "@/components/sections/MetricsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ServicesTabs } from "@/components/sections/ServicesTabs";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Get the locale from params
  const { locale } = await params;

  // Set the locale for this request so server components can access it
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <SiteHeader />
      <main className="bg-white" data-tour="welcome">
        <HeroSection />
        <LogoCloud />
        <BenefitsGrid />
        <ServicesTabs />
        <MetricsSection />
        <ProcessSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <SiteFooter />
      <WelcomeTour autoStart />
    </div>
  );
}
