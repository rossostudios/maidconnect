import {
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.bookingPlatform.meta" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "booking platform",
      "service scheduling",
      "instant booking",
      "professional booking system",
      "real-time availability",
      "domestic services Colombia",
      "home services booking",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://casaora.co/product/booking-platform",
      siteName: "Casaora",
      images: [
        {
          url: "https://casaora.co/og-booking-platform.png",
          width: 1200,
          height: 630,
          alt: "Casaora Booking Platform",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://casaora.co/og-booking-platform.png"],
    },
    alternates: {
      canonical: "https://casaora.co/product/booking-platform",
    },
  };
}

export default async function BookingPlatformPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.bookingPlatform" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Casaora Booking Platform",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: t("hero.description"),
    featureList: [
      t("features.instantBooking.title"),
      t("features.realTimeAvailability.title"),
      t("features.smartScheduling.title"),
    ],
    operatingSystem: "Web",
  };

  return (
    <div className="min-h-screen bg-[#fbf9f7] text-gray-900">
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
          primaryCTA={{ label: t("hero.primaryCTA"), href: "/professionals" }}
          secondaryCTA={{ label: t("hero.secondaryCTA"), href: "#features" }}
        />

        {/* Features Section */}
        <section
          className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24"
          id="features"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="type-serif-lg text-center text-gray-900">{t("features.title")}</h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-gray-600 text-lg leading-relaxed">
              {t("features.subtitle")}
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ProductFeatureCard
                description={t("features.instantBooking.description")}
                icon={FlashIcon}
                title={t("features.instantBooking.title")}
              />

              <ProductFeatureCard
                description={t("features.realTimeAvailability.description")}
                icon={Calendar01Icon}
                title={t("features.realTimeAvailability.title")}
              />

              <ProductFeatureCard
                description={t("features.smartScheduling.description")}
                icon={Clock01Icon}
                title={t("features.smartScheduling.title")}
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

        {/* Benefits Section */}
        <section className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-gray-900">{t("benefits.title")}</h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E85D48]">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xl">
                    {t("benefits.noPhoneTag.title")}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 leading-relaxed">
                    {t("benefits.noPhoneTag.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E85D48]">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xl">
                    {t("benefits.transparentPricing.title")}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 leading-relaxed">
                    {t("benefits.transparentPricing.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E85D48]">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xl">
                    {t("benefits.flexibleScheduling.title")}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 leading-relaxed">
                    {t("benefits.flexibleScheduling.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E85D48]">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xl">
                    {t("benefits.easyRescheduling.title")}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 leading-relaxed">
                    {t("benefits.easyRescheduling.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="type-serif-lg text-gray-900">{t("cta.title")}</h2>

            <p className="mx-auto mt-6 max-w-2xl text-gray-600 text-lg leading-relaxed">
              {t("cta.description")}
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#E85D48] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[var(--red-hover)]"
                href="/professionals"
              >
                {t("cta.browseProfessionals")}
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-8 py-4 font-semibold text-base text-gray-900 transition hover:border-[var(--red)] hover:text-[#E85D48]"
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
