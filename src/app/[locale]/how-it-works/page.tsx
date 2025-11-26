import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkBadge01Icon,
  File01Icon,
  Home09Icon,
  Search01Icon,
  SecurityCheckIcon,
  StarIcon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
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
import { FeatureSectionClient, FlowDiagram, SettingsCard } from "./feature-section-client";
import { HeroSectionClient } from "./hero-section-client";

export default async function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <EverythingYouNeedSection />
        <AdaptiveJourneysSection />
        <DesignedForConversionSection />
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

async function EverythingYouNeedSection() {
  const t = await getTranslations("howItWorks.everythingYouNeed");

  const features = [
    t("features.vettedProfessionals"),
    t("features.backgroundChecks"),
    t("features.transparentPricing"),
    t("features.flexibleScheduling"),
    t("features.qualityGuarantee"),
    t("features.securePayments"),
  ];

  return (
    <FeatureSectionClient
      background="neutral"
      description={t("description")}
      features={features}
      illustration={
        <FlowDiagram
          items={[
            { icon: Search01Icon, label: t("diagram.search"), sublabel: t("diagram.searchDesc") },
            {
              icon: UserCheck01Icon,
              label: t("diagram.verify"),
              sublabel: t("diagram.verifyDesc"),
            },
            { icon: Calendar03Icon, label: t("diagram.book"), sublabel: t("diagram.bookDesc") },
            { icon: StarIcon, label: t("diagram.review"), sublabel: t("diagram.reviewDesc") },
          ]}
        />
      }
      title={t("title")}
    />
  );
}

async function AdaptiveJourneysSection() {
  const t = await getTranslations("howItWorks.adaptiveJourneys");

  const features = [
    t("features.stagedOnboarding"),
    t("features.privateInteractions"),
    t("features.multiServiceBooking"),
    t("features.smartMatching"),
  ];

  return (
    <FeatureSectionClient
      description={t("description")}
      features={features}
      illustration={
        <SettingsCard
          leftItems={[
            { label: t("card.serviceType"), value: t("card.serviceTypeValue") },
            { label: t("card.location"), value: t("card.locationValue") },
            { label: t("card.frequency"), value: t("card.frequencyValue") },
          ]}
          leftTitle={t("card.preferences")}
          rightItems={[
            { label: t("card.backgroundCheck"), hasCheck: true },
            { label: t("card.reviews"), hasCheck: true },
            { label: t("card.availability"), hasCheck: true },
          ]}
          rightTitle={t("card.requirements")}
        />
      }
      reversed
      title={t("title")}
    />
  );
}

async function DesignedForConversionSection() {
  const t = await getTranslations("howItWorks.designedForConversion");

  const features = [
    t("features.instantAvailability"),
    t("features.realTimeUpdates"),
    t("features.deepLocalization"),
    t("features.descriptiveProfiles"),
    t("features.multipleOptions"),
    t("features.dynamicPricing"),
    t("features.autoCompletion"),
    t("features.smartReminders"),
  ];

  return (
    <FeatureSectionClient
      background="neutral"
      description={t("description")}
      features={features}
      illustration={
        <FlowDiagram
          items={[
            { icon: Home09Icon, label: t("diagram.selectService") },
            { icon: CheckmarkBadge01Icon, label: t("diagram.choosePro") },
            { icon: SecurityCheckIcon, label: t("diagram.verifyDetails") },
            { icon: File01Icon, label: t("diagram.confirmBooking") },
          ]}
        />
      }
      title={t("title")}
    />
  );
}

async function FAQSection() {
  const t = await getTranslations("howItWorks.faq");

  const faqs = [{ key: "q1" }, { key: "q2" }, { key: "q3" }, { key: "q4" }];

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container className="max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-medium text-3xl text-neutral-900 tracking-tight sm:text-4xl">
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
    <section className="bg-neutral-900 py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="font-medium text-3xl text-white tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/80">{t("subtitle")}</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-neutral-900 transition hover:bg-neutral-100"
              href="/pros"
            >
              {t("browseButton")}
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
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
