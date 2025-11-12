import {
  ArrowRight01Icon,
  LockIcon,
  Message01Icon,
  Shield01Icon,
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
import { CheckmarkList, CheckmarkListItem } from "@/components/ui/checkmark-list";
import { Container } from "@/components/ui/container";
import { TwoColumnFeature } from "@/components/ui/two-column-feature";
import { Link } from "@/i18n/routing";

export default async function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFEEFF8E8]">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <CustomerFlowSection />
        <ProfessionalFlowSection />
        <SafetyTrustSection />
        <FAQSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}

async function HeroSection() {
  const t = await getTranslations("howItWorks.hero");

  return (
    <section className="bg-[#FFEEFF8E8] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-5xl">
        <div className="text-center">
          <p className="tagline text-[#AA88AAAAC]">HOW IT WORKS</p>
          <h1 className="serif-display-lg mt-6 text-[#116611616]">{t("title")}</h1>
          <p className="lead mx-auto mt-6 max-w-3xl text-[#116611616]/70">{t("subtitle")}</p>
        </div>
      </Container>
    </section>
  );
}

async function CustomerFlowSection() {
  const t = await getTranslations("howItWorks.customer");

  return (
    <TwoColumnFeature
      backgroundColor="cream"
      description={t("subtitle")}
      heading={t("title")}
      image="/how-it-works-customer.jpg"
      imageAlt="Customer booking process"
      imagePosition="right"
      tagline="FOR CUSTOMERS"
    >
      <CheckmarkList variant="default">
        <CheckmarkListItem description={t("steps.search.description")}>
          {t("steps.search.title")}
        </CheckmarkListItem>
        <CheckmarkListItem description={t("steps.book.description")}>
          {t("steps.book.title")}
        </CheckmarkListItem>
        <CheckmarkListItem description={t("steps.service.description")}>
          {t("steps.service.title")}
        </CheckmarkListItem>
        <CheckmarkListItem description={t("steps.review.description")}>
          {t("steps.review.title")}
        </CheckmarkListItem>
      </CheckmarkList>

      <div className="mt-8">
        <Link
          className="inline-flex items-center gap-2 rounded-full bg-[#FF4444A22]/100 px-8 py-4 font-semibold text-[#FFEEFF8E8] text-base transition hover:bg-[#FF4444A22]"
          href="/professionals"
        >
          {t("cta")}
          <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
        </Link>
      </div>
    </TwoColumnFeature>
  );
}

async function ProfessionalFlowSection() {
  const t = await getTranslations("howItWorks.professional");

  return (
    <TwoColumnFeature
      backgroundColor="white"
      description={t("subtitle")}
      heading={t("title")}
      image="/how-it-works-professional.jpg"
      imageAlt="Professional sign-up process"
      imagePosition="left"
      tagline="FOR PROFESSIONALS"
    >
      <CheckmarkList variant="default">
        <CheckmarkListItem description={t("steps.apply.description")}>
          {t("steps.apply.title")}
        </CheckmarkListItem>
        <CheckmarkListItem description={t("steps.verify.description")}>
          {t("steps.verify.title")}
        </CheckmarkListItem>
        <CheckmarkListItem description={t("steps.match.description")}>
          {t("steps.match.title")}
        </CheckmarkListItem>
        <CheckmarkListItem description={t("steps.serve.description")}>
          {t("steps.serve.title")}
        </CheckmarkListItem>
        <CheckmarkListItem description={t("steps.earn.description")}>
          {t("steps.earn.title")}
        </CheckmarkListItem>
      </CheckmarkList>

      <div className="mt-8">
        <Link
          className="inline-flex items-center gap-2 rounded-full bg-[#FF4444A22]/100 px-8 py-4 font-semibold text-[#FFEEFF8E8] text-base transition hover:bg-[#FF4444A22]"
          href="/auth/sign-up?role=professional"
        >
          {t("cta")}
          <HugeiconsIcon className="h-5 w-5" icon={ArrowRight01Icon} />
        </Link>
      </div>
    </TwoColumnFeature>
  );
}

async function SafetyTrustSection() {
  const t = await getTranslations("howItWorks.safety");

  const safetyFeatures = [
    {
      icon: Shield01Icon,
      titleKey: "verification.title",
      descriptionKey: "verification.description",
    },
    {
      icon: LockIcon,
      titleKey: "payments.title",
      descriptionKey: "payments.description",
    },
    {
      icon: Message01Icon,
      titleKey: "support.title",
      descriptionKey: "support.description",
    },
  ];

  return (
    <section className="bg-[#FFEEFF8E8] py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="mb-16 text-center">
          <p className="tagline text-[#AA88AAAAC]">SAFETY & TRUST</p>
          <h2 className="serif-display-lg mt-6 text-[#116611616]">{t("title")}</h2>
          <p className="lead mx-auto mt-6 max-w-2xl text-[#116611616]/70">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                className="rounded-[32px] border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-10 text-center shadow-[0_4px_20px_rgba(22,22,22,0.02)] transition hover:shadow-[0_8px_30px_rgba(22,22,22,0.04)]"
                key={index}
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4444A22]/100/10">
                  <HugeiconsIcon className="h-8 w-8 text-[#FF4444A22]" icon={Icon} />
                </div>
                <h3 className="serif-headline-sm mb-4 text-[#116611616]">{t(feature.titleKey)}</h3>
                <p className="text-[#116611616]/70 text-base leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

async function FAQSection() {
  const t = await getTranslations("howItWorks.faq");

  const faqs = [{ key: "q1" }, { key: "q2" }, { key: "q3" }, { key: "q4" }];

  return (
    <section className="bg-[#FFEEFF8E8] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="serif-display-lg text-[#116611616]">{t("title")}</h2>
          <p className="lead mt-4 text-[#116611616]/70">{t("subtitle")}</p>
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
          <p className="mb-4 text-[#116611616]/70">{t("stillHaveQuestions")}</p>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-[#FF4444A22] transition hover:text-[#FF4444A22]"
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
    <section className="bg-[#116611616] py-20 sm:py-24 lg:py-32">
      <Container className="max-w-4xl">
        <div className="text-center">
          <h2 className="serif-display-lg text-[#FFEEFF8E8]">{t("title")}</h2>
          <p className="lead mt-6 text-[#FFEEFF8E8]/90">{t("subtitle")}</p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFEEFF8E8] px-8 py-4 font-semibold text-[#116611616] text-base transition hover:bg-[#EE44EE2E3]"
              href="/professionals"
            >
              {t("browseButton")}
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#FFEEFF8E8] px-8 py-4 font-semibold text-[#FFEEFF8E8] text-base transition hover:bg-[#FFEEFF8E8]/10"
              href="/auth/sign-up"
            >
              {t("signUpButton")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
