import { WelcomeTour } from "@/components/onboarding";
import { ConciergeSection } from "@/components/sections/concierge-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProcessSection } from "@/components/sections/process-section";
import { ServicesSection } from "@/components/sections/services-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { ValuePropositionSection } from "@/components/sections/value-proposition-section";

// Revalidate every hour (3600 seconds)

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main data-tour="welcome">
        <HeroSection />
        <ValuePropositionSection />
        <ServicesSection />
        <ProcessSection />
        <TestimonialsSection />
        <ConciergeSection />
      </main>
      <SiteFooter />
      <WelcomeTour autoStart />
    </div>
  );
}
