import { setRequestLocale } from "next-intl/server";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { GuaranteeSection } from "@/components/sections/GuaranteeSection";
import { MarketplaceHero } from "@/components/sections/MarketplaceHero";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { VerificationSection } from "@/components/sections/VerificationSection";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Get the locale from params
  const { locale } = await params;

  // Set the locale for this request so server components can access it
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader overlay />
      <main id="main-content" tabIndex={-1}>
        <MarketplaceHero />
        <BenefitsSection />
        <ProcessSection />
        <VerificationSection />
        <GuaranteeSection />
      </main>
      <SiteFooter />
    </>
  );
}
