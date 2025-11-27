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
import { HeroSectionClient } from "./hero-section-client";
import { StandardSection } from "./standard-section";

export default async function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-rausch-950">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <StandardSectionWrapper />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

async function HeroSection() {
  const t = await getTranslations("howItWorks.hero");

  return <HeroSectionClient badge={t("badge")} subtitle={t("subtitle")} title={t("title")} />;
}

async function StandardSectionWrapper() {
  const t = await getTranslations("howItWorks.standard");

  return (
    <StandardSection
      sectionSubtitle={t("sectionSubtitle")}
      sectionTitle={t("sectionTitle")}
      step1={{
        number: t("step1.number"),
        title: t("step1.title"),
        subtitle: t("step1.subtitle"),
        description: t("step1.description"),
        systemAction: t("step1.systemAction"),
        systemStatus: t("step1.systemStatus"),
      }}
      step2={{
        number: t("step2.number"),
        title: t("step2.title"),
        subtitle: t("step2.subtitle"),
        description: t("step2.description"),
        systemAction: t("step2.systemAction"),
        systemStatus: t("step2.systemStatus"),
      }}
      step3={{
        number: t("step3.number"),
        title: t("step3.title"),
        subtitle: t("step3.subtitle"),
        description: t("step3.description"),
        systemAction: t("step3.systemAction"),
        systemStatus: t("step3.systemStatus"),
      }}
    />
  );
}

async function FAQSection() {
  const t = await getTranslations("howItWorks.faq");

  const faqs = [{ key: "q1" }, { key: "q2" }, { key: "q3" }, { key: "q4" }];

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32 dark:bg-rausch-950">
      <Container className="max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-medium text-3xl text-neutral-900 tracking-tight sm:text-4xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-rausch-300">{t("subtitle")}</p>
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
          <p className="mb-4 text-neutral-600 dark:text-rausch-300">{t("stillHaveQuestions")}</p>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-rausch-600 transition hover:text-rausch-700"
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

async function CTASection() {
  const t = await getTranslations("howItWorks.cta");

  return (
    <section className="bg-rausch-600 py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="font-medium text-3xl text-white tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/80">{t("subtitle")}</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-rausch-700 transition hover:bg-rausch-50"
              href="/pros"
            >
              {t("browseButton")}
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
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
