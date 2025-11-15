import {
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Invoice01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.paymentProcessing.meta" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "secure payments",
      "Stripe integration",
      "payment processing",
      "escrow payments",
      "transparent pricing",
      "digital receipts",
      "automatic payouts",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://casaora.co/product/payment-processing",
      siteName: "Casaora",
      images: [
        {
          url: "https://casaora.co/og-payment-processing.png",
          width: 1200,
          height: 630,
          alt: "Casaora Secure Payment Processing",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://casaora.co/og-payment-processing.png"],
    },
    alternates: {
      canonical: "https://casaora.co/product/payment-processing",
    },
  };
}

export default async function PaymentProcessingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.paymentProcessing" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Casaora Payment Processing",
    applicationCategory: "FinanceApplication",
    description: t("hero.description"),
    featureList: [
      t("features.stripeIntegration.title"),
      t("protection.chargedAfter.title"),
      t("features.automaticReceipts.title"),
    ],
    operatingSystem: "Web",
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Security: dangerouslySetInnerHTML is safe here - jsonLd is server-generated structured data for SEO */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <ProductHeroSection
          badge={t("hero.badge")}
          description={t("hero.description")}
          headline={t("hero.headline")}
          primaryCTA={{ label: t("hero.primaryCTA"), href: "#features" }}
          secondaryCTA={{ label: t("hero.secondaryCTA"), href: "/professionals" }}
        />

        {/* Features Section */}
        <section
          className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24"
          id="features"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="type-serif-lg text-center text-neutral-900">{t("features.title")}</h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-lg text-neutral-500 leading-relaxed">
              {t("features.subtitle")}
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ProductFeatureCard
                description={t("features.stripeIntegration.description")}
                icon={Shield01Icon}
                title={t("features.stripeIntegration.title")}
              />

              <ProductFeatureCard
                description={t("features.transparentPricing.description")}
                icon={CreditCardIcon}
                title={t("features.transparentPricing.title")}
              />

              <ProductFeatureCard
                description={t("features.automaticReceipts.description")}
                icon={Invoice01Icon}
                title={t("features.automaticReceipts.title")}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <ProductStepsSection
          description={t("howItWorks.description")}
          headline={t("howItWorks.title")}
          steps={[
            {
              number: "1",
              title: t("howItWorks.step1.title"),
              description: t("howItWorks.step1.description"),
            },
            {
              number: "2",
              title: t("howItWorks.step2.title"),
              description: t("howItWorks.step2.description"),
            },
            {
              number: "3",
              title: t("howItWorks.step3.title"),
              description: t("howItWorks.step3.description"),
            },
            {
              number: "4",
              title: t("howItWorks.step4.title"),
              description: t("howItWorks.step4.description"),
            },
          ]}
        />

        {/* Payment Timeline Section */}
        <section className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-neutral-900">
              {t("paymentTimeline.title")}
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <span className="font-semibold text-sm text-white">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("paymentTimeline.booking.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("paymentTimeline.booking.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <span className="font-semibold text-sm text-white">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("paymentTimeline.serviceDay.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("paymentTimeline.serviceDay.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <span className="font-semibold text-sm text-white">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("paymentTimeline.serviceComplete.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("paymentTimeline.serviceComplete.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <span className="font-semibold text-sm text-white">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("paymentTimeline.postService.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("paymentTimeline.postService.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protection Features Section */}
        <section className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-neutral-900">{t("protection.title")}</h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("protection.chargedAfter.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("protection.chargedAfter.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("protection.cancellation.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("protection.cancellation.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("protection.dispute.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("protection.dispute.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("protection.encrypted.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("protection.encrypted.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accepted Payments Section */}
        <section className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-neutral-900">
              {t("acceptedMethods.title")}
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                  <HugeiconsIcon className="h-8 w-8 text-orange-500" icon={CreditCardIcon} />
                </div>
                <h3 className="mt-6 font-semibold text-neutral-900 text-xl">
                  {t("acceptedMethods.creditCards.title")}
                </h3>
                <p className="mt-3 text-base text-neutral-500">
                  {t("acceptedMethods.creditCards.description")}
                </p>
              </div>

              <div className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                  <HugeiconsIcon className="h-8 w-8 text-orange-500" icon={CreditCardIcon} />
                </div>
                <h3 className="mt-6 font-semibold text-neutral-900 text-xl">
                  {t("acceptedMethods.debitCards.title")}
                </h3>
                <p className="mt-3 text-base text-neutral-500">
                  {t("acceptedMethods.debitCards.description")}
                </p>
              </div>

              <div className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                  <HugeiconsIcon className="h-8 w-8 text-orange-500" icon={Invoice01Icon} />
                </div>
                <h3 className="mt-6 font-semibold text-neutral-900 text-xl">
                  {t("acceptedMethods.digitalReceipts.title")}
                </h3>
                <p className="mt-3 text-base text-neutral-500">
                  {t("acceptedMethods.digitalReceipts.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="type-serif-lg text-neutral-900">{t("cta.title")}</h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-500 leading-relaxed">
              {t("cta.description")}
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[var(--red-hover)]"
                href="/professionals"
              >
                {t("cta.bookService")}
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border-2 border-neutral-200 bg-neutral-50 px-8 py-4 font-semibold text-base text-neutral-900 transition hover:border-[var(--red)] hover:text-orange-500"
                href="/auth/sign-up"
              >
                {t("cta.signUpFree")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
