import { CheckCircle2, FileImage, MessageCircle, Shield } from "lucide-react";
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
  const t = await getTranslations({ locale, namespace: "pages.secureMessaging.meta" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "secure messaging",
      "direct communication",
      "photo sharing",
      "service coordination",
      "booking communication",
      "professional messaging",
      "customer support",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://maidconnect.co/product/secure-messaging",
      siteName: "Maidconnect",
      images: [
        {
          url: "https://maidconnect.co/og-secure-messaging.png",
          width: 1200,
          height: 630,
          alt: "Maidconnect Secure Messaging",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://maidconnect.co/og-secure-messaging.png"],
    },
    alternates: {
      canonical: "https://maidconnect.co/product/secure-messaging",
    },
  };
}

export default async function SecureMessagingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.secureMessaging" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Maidconnect Secure Messaging",
    applicationCategory: "CommunicationApplication",
    description: t("hero.description"),
    featureList: [
      t("features.bookingBased.title"),
      t("features.photoSharing.title"),
      t("features.realTime.title"),
    ],
    operatingSystem: "Web",
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
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
            <h2 className="text-center font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl lg:text-6xl">
              {t("features.title")}
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-center text-[#5d574b] text-lg leading-relaxed">
              {t("features.subtitle")}
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <ProductFeatureCard
                description={t("features.bookingBased.description")}
                icon={Shield}
                title={t("features.bookingBased.title")}
              />

              <ProductFeatureCard
                description={t("features.realTime.description")}
                icon={MessageCircle}
                title={t("features.realTime.title")}
              />

              <ProductFeatureCard
                description={t("features.photoSharing.description")}
                icon={FileImage}
                title={t("features.photoSharing.title")}
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
            <h2 className="text-center font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
              {t("benefits.title")}
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("benefits.privacy.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("benefits.privacy.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("benefits.noSpam.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("benefits.noSpam.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("benefits.history.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("benefits.history.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("benefits.notifications.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("benefits.notifications.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
              {t("useCases.title")}
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <h3 className="font-semibold text-2xl text-[#211f1a]">
                  {t("useCases.beforeService.title")}
                </h3>
                <ul className="mt-4 space-y-3 text-[#5d574b] text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.beforeService.items.access")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.beforeService.items.photos")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.beforeService.items.timing")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.beforeService.items.products")}</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
                <h3 className="font-semibold text-2xl text-[#211f1a]">
                  {t("useCases.duringService.title")}
                </h3>
                <ul className="mt-4 space-y-3 text-[#5d574b] text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.duringService.items.updates")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.duringService.items.questions")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.duringService.items.beforeAfter")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5d46]">•</span>
                    <span>{t("useCases.duringService.items.realTime")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
              {t("cta.title")}
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-[#5d574b] text-lg leading-relaxed">
              {t("cta.description")}
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
                href="/professionals"
              >
                {t("cta.browseProfessionals")}
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-8 py-4 font-semibold text-[#211f1a] text-base transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
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
