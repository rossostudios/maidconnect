import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getTranslations } from "next-intl/server";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";
import { CustomerFlowSectionClient } from "./customer-flow-section-client";
import { HeroSectionClient } from "./hero-section-client";
import { ProfessionalFlowSectionClient } from "./professional-flow-section-client";
import { SafetyTrustSectionClient } from "./safety-trust-section-client";
import { ServiceOptionsSectionClient } from "./service-options-section-client";

export default async function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ServiceOptionsSection />
        <CustomerFlowSectionClient />
        <ProfessionalFlowSectionClient />
        <SafetyTrustSectionClient />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

async function HeroSection() {
  const t = await getTranslations("howItWorks.hero");

  return <HeroSectionClient subtitle={t("subtitle")} title={t("title")} />;
}

async function FAQSection() {
  const t = await getTranslations("howItWorks.faq");

  const faqs = [{ key: "q1" }, { key: "q2" }, { key: "q3" }, { key: "q4" }];

  return (
    <section className="bg-neutral-50 py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-neutral-600">{t("subtitle")}</p>
        </div>

        <Accordion allowMultiple={false} variant="default">
          {faqs.map((faq) => (
            <AccordionItem key={faq.key} value={faq.key}>
              <AccordionTrigger>{t(`${faq.key}.question`)}</AccordionTrigger>
              <AccordionContent>{t(`${faq.key}.answer`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="mb-4 text-neutral-600">{t("stillHaveQuestions")}</p>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-orange-600 transition hover:text-orange-700"
            href="/contact"
          >
            {t("contactUs")}
            <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

async function ServiceOptionsSection() {
  const t = await getTranslations("howItWorks.serviceOptions");

  return (
    <ServiceOptionsSectionClient
      concierge={{
        title: t("concierge.title"),
        description: t("concierge.description"),
        speed: t("concierge.speed"),
        process: t("concierge.process"),
        cost: t("concierge.cost"),
        features: t.raw("concierge.features") as string[],
        cta: t("concierge.cta"),
      }}
      instantBook={{
        title: t("instantBook.title"),
        description: t("instantBook.description"),
        speed: t("instantBook.speed"),
        process: t("instantBook.process"),
        cost: t("instantBook.cost"),
        features: t.raw("instantBook.features") as string[],
        cta: t("instantBook.cta"),
      }}
      subtitle={t("subtitle")}
      title={t("title")}
    />
  );
}

async function CTASection() {
  const t = await getTranslations("howItWorks.cta");

  return (
    <section className="bg-neutral-900 py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <div className="text-center">
          <h2 className="font-bold text-4xl text-white tracking-tight md:text-5xl">{t("title")}</h2>
          <p className="mt-6 text-lg text-white/90">{t("subtitle")}</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-50 px-8 py-4 font-semibold text-base text-neutral-900 transition hover:bg-neutral-200"
              href="/direct-hire"
            >
              {t("browseButton")}
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-neutral-200 px-8 py-4 font-semibold text-base text-white transition hover:bg-neutral-50/10"
              href="/professionals"
            >
              {t("signUpButton")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
