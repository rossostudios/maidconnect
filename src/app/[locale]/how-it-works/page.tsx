import { ArrowRight, HelpCircle, Lock, MessageSquare, Shield } from "lucide-react";
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
    <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 font-bold text-4xl text-gray-900 sm:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-gray-600 text-xl leading-relaxed">
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
          <h2 className="mb-4 font-bold text-3xl text-gray-900 sm:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg">{t("subtitle")}</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <ProcessTimeline steps={customerSteps} translationNamespace="howItWorks.customer" />
        </div>

        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff5d46] to-[#e54d36] px-8 py-4 font-semibold text-white transition hover:shadow-lg"
            href="/professionals"
          >
            {t("cta")}
            <ArrowRight className="h-5 w-5" />
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
    <section className="bg-gray-50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-gray-900 sm:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg">{t("subtitle")}</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <ProcessTimeline
            steps={professionalSteps}
            translationNamespace="howItWorks.professional"
          />
        </div>

        <div className="mt-12 text-center">
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff5d46] to-[#e54d36] px-8 py-4 font-semibold text-white transition hover:shadow-lg"
            href="/auth/sign-up?role=professional"
          >
            {t("cta")}
            <ArrowRight className="h-5 w-5" />
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
      icon: Shield,
      titleKey: "verification.title",
      descriptionKey: "verification.description",
    },
    {
      icon: Lock,
      titleKey: "payments.title",
      descriptionKey: "payments.description",
    },
    {
      icon: MessageSquare,
      titleKey: "support.title",
      descriptionKey: "support.description",
    },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-gray-900 sm:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md"
                key={index}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ff5d46]/10 to-[#e54d36]/10">
                  <Icon className="h-8 w-8 text-[#ff5d46]" />
                </div>
                <h3 className="mb-3 font-semibold text-gray-900 text-xl">{t(feature.titleKey)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(feature.descriptionKey)}</p>
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
    <section className="bg-gray-50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <HelpCircle className="mx-auto mb-4 h-12 w-12 text-[#ff5d46]" />
          <h2 className="mb-4 font-bold text-3xl text-gray-900 sm:text-4xl">{t("title")}</h2>
          <p className="text-gray-600 text-lg">{t("subtitle")}</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" key={index}>
              <h3 className="mb-3 font-semibold text-gray-900 text-lg">{t(faq.questionKey)}</h3>
              <p className="text-gray-600 leading-relaxed">{t(faq.answerKey)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="mb-4 text-gray-600">{t("stillHaveQuestions")}</p>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-[#ff5d46] transition hover:text-[#e54d36]"
            href="/contact"
          >
            {t("contactUs")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations("howItWorks.cta");

  return (
    <section className="bg-gradient-to-br from-[#ff5d46] to-[#e54d36] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 font-bold text-3xl text-white sm:text-4xl">{t("title")}</h2>
        <p className="mb-8 text-white/90 text-xl">{t("subtitle")}</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-white px-8 py-4 font-semibold text-[#ff5d46] transition hover:bg-white/90"
            href="/professionals"
          >
            {t("browseButton")}
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition hover:bg-white/10"
            href="/auth/sign-up"
          >
            {t("signUpButton")}
          </Link>
        </div>
      </div>
    </section>
  );
}
