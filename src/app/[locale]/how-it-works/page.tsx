import {
  ArrowRight01Icon,
  HelpCircleIcon,
  LockIcon,
  Message01Icon,
  Shield01Icon,
} from "hugeicons-react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ProcessTimeline } from "@/components/how-it-works/process-timeline";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howItWorks.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
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

function HeroSection() {
  const t = useTranslations("howItWorks.hero");

  return (
    <section className="bg-[var(--background)] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="type-serif-lg mb-6 text-[var(--foreground)]">{t("title")}</h1>
        <p className="mx-auto mb-8 max-w-2xl text-[var(--muted-foreground)] text-xl leading-relaxed">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}

function CustomerFlowSection() {
  const t = useTranslations("howItWorks.customer");

  const customerSteps = [
    {
      iconName: "Search",
      titleKey: "steps.search.title",
      descriptionKey: "steps.search.description",
    },
    {
      iconName: "Calendar",
      titleKey: "steps.book.title",
      descriptionKey: "steps.book.description",
    },
    {
      iconName: "UserCheck",
      titleKey: "steps.service.title",
      descriptionKey: "steps.service.description",
    },
    {
      iconName: "Star",
      titleKey: "steps.review.title",
      descriptionKey: "steps.review.description",
    },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="type-serif-md mb-4 text-[var(--foreground)]">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-[var(--muted-foreground)] text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <ProcessTimeline steps={customerSteps} translationNamespace="howItWorks.customer" />
        </div>

        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-[var(--red)] px-8 py-4 font-semibold text-white shadow-[var(--shadow-card)] transition hover:bg-[var(--red-hover)]"
            href="/professionals"
          >
            {t("cta")}
            <ArrowRight01Icon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProfessionalFlowSection() {
  const t = useTranslations("howItWorks.professional");

  const professionalSteps = [
    {
      iconName: "FileText",
      titleKey: "steps.apply.title",
      descriptionKey: "steps.apply.description",
    },
    {
      iconName: "ShieldCheck",
      titleKey: "steps.verify.title",
      descriptionKey: "steps.verify.description",
    },
    {
      iconName: "Users",
      titleKey: "steps.match.title",
      descriptionKey: "steps.match.description",
    },
    {
      iconName: "UserCheck",
      titleKey: "steps.serve.title",
      descriptionKey: "steps.serve.description",
    },
    {
      iconName: "DollarSign",
      titleKey: "steps.earn.title",
      descriptionKey: "steps.earn.description",
    },
  ];

  return (
    <section className="bg-[var(--background-alt)] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="type-serif-md mb-4 text-[var(--foreground)]">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-[var(--muted-foreground)] text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <ProcessTimeline
            steps={professionalSteps}
            translationNamespace="howItWorks.professional"
          />
        </div>

        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-[var(--red)] px-8 py-4 font-semibold text-white shadow-[var(--shadow-card)] transition hover:bg-[var(--red-hover)]"
            href="/auth/sign-up?role=professional"
          >
            {t("cta")}
            <ArrowRight01Icon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SafetyTrustSection() {
  const t = useTranslations("howItWorks.safety");

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
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="type-serif-md mb-4 text-[var(--foreground)]">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-[var(--muted-foreground)] text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                className="rounded-xl border border-[#ebe5d8] bg-white p-8 text-center shadow-[var(--shadow-subtle)] transition hover:shadow-[var(--shadow-card)]"
                key={index}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--red)]/10">
                  <Icon className="h-8 w-8 text-[var(--red)]" />
                </div>
                <h3 className="type-serif-sm mb-3 text-[var(--foreground)]">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const t = useTranslations("howItWorks.faq");

  const faqs = [
    {
      questionKey: "q1.question",
      answerKey: "q1.answer",
    },
    {
      questionKey: "q2.question",
      answerKey: "q2.answer",
    },
    {
      questionKey: "q3.question",
      answerKey: "q3.answer",
    },
    {
      questionKey: "q4.question",
      answerKey: "q4.answer",
    },
  ];

  return (
    <section className="bg-[var(--background-alt)] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <HelpCircleIcon className="mx-auto mb-4 h-12 w-12 text-[var(--red)]" />
          <h2 className="type-serif-md mb-4 text-[var(--foreground)]">{t("title")}</h2>
          <p className="text-[var(--muted-foreground)] text-lg">{t("subtitle")}</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              className="rounded-xl border border-[#ebe5d8] bg-white p-6 shadow-[var(--shadow-subtle)]"
              key={index}
            >
              <h3 className="type-ui-sm mb-2 text-[var(--foreground)]">{t(faq.questionKey)}</h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">{t(faq.answerKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="mb-4 text-[var(--muted-foreground)]">{t("stillHaveQuestions")}</p>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-[var(--red)] transition hover:text-[var(--red-hover)]"
            href="/contact"
          >
            {t("contactUs")}
            <ArrowRight01Icon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations("howItWorks.cta");

  return (
    <section className="bg-[var(--foreground)] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="type-serif-md mb-6 text-white">{t("title")}</h2>
        <p className="mb-8 text-white/90 text-xl">{t("subtitle")}</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-8 py-4 font-semibold text-[var(--foreground)] shadow-[var(--shadow-card)] transition hover:bg-[#f3ece1]"
            href="/professionals"
          >
            {t("browseButton")}
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white/10"
            href="/auth/sign-up"
          >
            {t("signUpButton")}
          </Link>
        </div>
      </div>
    </section>
  );
}
