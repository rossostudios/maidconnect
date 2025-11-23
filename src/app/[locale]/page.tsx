import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";
// Above-fold components - static imports for LCP
import { MarketplaceHero } from "@/components/sections/MarketplaceHero";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

// Below-fold components - dynamic imports for code splitting
// These load after initial paint, reducing main bundle size
const BenefitsSection = dynamic(
  () => import("@/components/sections/BenefitsSection").then((mod) => mod.BenefitsSection),
  { ssr: true }
);
const CityShowcase = dynamic(
  () => import("@/components/sections/CityShowcase").then((mod) => mod.CityShowcase),
  { ssr: true }
);
const ProcessSection = dynamic(
  () => import("@/components/sections/ProcessSection").then((mod) => mod.ProcessSection),
  { ssr: true }
);
const GuaranteeSection = dynamic(
  () => import("@/components/sections/GuaranteeSection").then((mod) => mod.GuaranteeSection),
  { ssr: true }
);

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
        <CityShowcase />
        <ProcessSection />
        <GuaranteeSection />
      </main>
      <SiteFooter />
    </>
  );
}
