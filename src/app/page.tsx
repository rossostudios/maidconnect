import { CapabilitiesSection } from "@/components/sections/capabilities-section";
import { ConciergeSection } from "@/components/sections/concierge-section";
import { CustomerSearchSection } from "@/components/sections/customer-search-section";
import { HeroSection } from "@/components/sections/hero-section";
import { OperationsSection } from "@/components/sections/operations-section";
import { ProcessSection } from "@/components/sections/process-section";
import { ServicesSection } from "@/components/sections/services-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { UseCasesSection } from "@/components/sections/use-cases-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main>
        <HeroSection />
        <CustomerSearchSection />
        <UseCasesSection />
        <ServicesSection />
        <ProcessSection />
        <OperationsSection />
        <TestimonialsSection />
        <CapabilitiesSection />
        <ConciergeSection />
      </main>
      <SiteFooter />
    </div>
  );
}
