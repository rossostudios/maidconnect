import {
  CheckmarkCircle02Icon,
  DollarCircleIcon,
  Settings01Icon,
  UserCheck01Icon,
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
  const t = await getTranslations({ locale, namespace: "pages.adminDashboard.meta" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "admin dashboard",
      "platform management",
      "professional moderation",
      "payout processing",
      "booking oversight",
      "quality control",
      "enterprise tools",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://casaora.co/product/admin-dashboard",
      siteName: "Casaora",
      images: [
        {
          url: "https://casaora.co/og-admin-dashboard.png",
          width: 1200,
          height: 630,
          alt: "Casaora Admin Dashboard",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://casaora.co/og-admin-dashboard.png"],
    },
    alternates: {
      canonical: "https://casaora.co/product/admin-dashboard",
    },
  };
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.adminDashboard" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Casaora Admin Dashboard",
    applicationCategory: "BusinessApplication",
    description: t("hero.description"),
    featureList: [
      t("features.professionalModeration.title"),
      t("features.bookingOversight.title"),
      t("features.payoutProcessing.title"),
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
          primaryCTA={{ label: t("hero.primaryCTA"), href: "/contact" }}
          secondaryCTA={{ label: t("hero.secondaryCTA"), href: "#features" }}
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
                description={t("features.professionalModeration.description")}
                icon={UserCheck01Icon}
                title={t("features.professionalModeration.title")}
              />

              <ProductFeatureCard
                description={t("features.bookingOversight.description")}
                icon={DollarCircleIcon}
                title={t("features.bookingOversight.title")}
              />

              <ProductFeatureCard
                description={t("features.payoutProcessing.description")}
                icon={Settings01Icon}
                title={t("features.payoutProcessing.title")}
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

        {/* Admin Capabilities Section */}
        <section className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-neutral-900">
              {t("capabilities.title")}
            </h2>

            <div className="mt-16 space-y-4">
              <div className="flex items-start gap-4 border border-neutral-200 bg-neutral-50 p-6">
                <HugeiconsIcon
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-rausch-500"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="text-base text-neutral-700">
                  {t("capabilities.professionalManagement")}
                </p>
              </div>
              <div className="flex items-start gap-4 border border-neutral-200 bg-neutral-50 p-6">
                <HugeiconsIcon
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-rausch-500"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="text-base text-neutral-700">{t("capabilities.bookingReview")}</p>
              </div>
              <div className="flex items-start gap-4 border border-neutral-200 bg-neutral-50 p-6">
                <HugeiconsIcon
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-rausch-500"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="text-base text-neutral-700">{t("capabilities.payoutControl")}</p>
              </div>
              <div className="flex items-start gap-4 border border-neutral-200 bg-neutral-50 p-6">
                <HugeiconsIcon
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-rausch-500"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="text-base text-neutral-700">{t("capabilities.disputeResolution")}</p>
              </div>
              <div className="flex items-start gap-4 border border-neutral-200 bg-neutral-50 p-6">
                <HugeiconsIcon
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-rausch-500"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="text-base text-neutral-700">{t("capabilities.userModeration")}</p>
              </div>
              <div className="flex items-start gap-4 border border-neutral-200 bg-neutral-50 p-6">
                <HugeiconsIcon
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-rausch-500"
                  icon={CheckmarkCircle02Icon}
                />
                <p className="text-base text-neutral-700">{t("capabilities.analytics")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-neutral-900">{t("security.title")}</h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-rausch-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("security.roleBasedAccess.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("security.roleBasedAccess.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-rausch-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("security.auditLogs.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("security.auditLogs.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-rausch-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("security.dataProtection.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("security.dataProtection.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-rausch-500">
                  <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-xl">
                    {t("security.twoFactorAuth.title")}
                  </h3>
                  <p className="mt-2 text-base text-neutral-500 leading-relaxed">
                    {t("security.twoFactorAuth.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Tools Grid */}
        <section className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-neutral-900">{t("tools.title")}</h2>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="border border-neutral-200 bg-neutral-50 p-6">
                <h4 className="font-semibold text-neutral-900">
                  {t("tools.professionalApproval").split(":")[0]}
                </h4>
                <p className="mt-2 text-neutral-500 text-sm">
                  {t("tools.professionalApproval").split(":")[1]}
                </p>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-6">
                <h4 className="font-semibold text-neutral-900">
                  {t("tools.documentVerification").split(":")[0]}
                </h4>
                <p className="mt-2 text-neutral-500 text-sm">
                  {t("tools.documentVerification").split(":")[1]}
                </p>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-6">
                <h4 className="font-semibold text-neutral-900">
                  {t("tools.payoutQueue").split(":")[0]}
                </h4>
                <p className="mt-2 text-neutral-500 text-sm">
                  {t("tools.payoutQueue").split(":")[1]}
                </p>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-6">
                <h4 className="font-semibold text-neutral-900">
                  {t("tools.userManagement").split(":")[0]}
                </h4>
                <p className="mt-2 text-neutral-500 text-sm">
                  {t("tools.userManagement").split(":")[1]}
                </p>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-6">
                <h4 className="font-semibold text-neutral-900">
                  {t("tools.disputeResolution").split(":")[0]}
                </h4>
                <p className="mt-2 text-neutral-500 text-sm">
                  {t("tools.disputeResolution").split(":")[1]}
                </p>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-6">
                <h4 className="font-semibold text-neutral-900">
                  {t("tools.analytics").split(":")[0]}
                </h4>
                <p className="mt-2 text-neutral-500 text-sm">
                  {t("tools.analytics").split(":")[1]}
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
                className="inline-flex items-center justify-center bg-rausch-500 px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[var(--red-hover)]"
                href="/contact"
              >
                {t("cta.requestDemo")}
              </Link>

              <Link
                className="inline-flex items-center justify-center border-2 border-neutral-200 bg-neutral-50 px-8 py-4 font-semibold text-base text-neutral-900 transition hover:border-[var(--red)] hover:text-rausch-500"
                href="/"
              >
                {t("cta.learnMore")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
