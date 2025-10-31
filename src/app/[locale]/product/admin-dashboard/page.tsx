import { CheckCircle2, DollarSign, Settings, UserCheck } from "lucide-react";
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
      url: "https://maidconnect.co/product/admin-dashboard",
      siteName: "Maidconnect",
      images: [
        {
          url: "https://maidconnect.co/og-admin-dashboard.png",
          width: 1200,
          height: 630,
          alt: "Maidconnect Admin Dashboard",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://maidconnect.co/og-admin-dashboard.png"],
    },
    alternates: {
      canonical: "https://maidconnect.co/product/admin-dashboard",
    },
  };
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.adminDashboard" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Maidconnect Admin Dashboard",
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
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
                description={t("features.professionalModeration.description")}
                icon={UserCheck}
                title={t("features.professionalModeration.title")}
              />

              <ProductFeatureCard
                description={t("features.bookingOversight.description")}
                icon={DollarSign}
                title={t("features.bookingOversight.title")}
              />

              <ProductFeatureCard
                description={t("features.payoutProcessing.description")}
                icon={Settings}
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
        <section className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
              {t("capabilities.title")}
            </h2>

            <div className="mt-16 space-y-4">
              <div className="flex items-start gap-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ff5d46]" />
                <p className="text-[#5d574b] text-base">
                  {t("capabilities.professionalManagement")}
                </p>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ff5d46]" />
                <p className="text-[#5d574b] text-base">{t("capabilities.bookingReview")}</p>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ff5d46]" />
                <p className="text-[#5d574b] text-base">{t("capabilities.payoutControl")}</p>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ff5d46]" />
                <p className="text-[#5d574b] text-base">{t("capabilities.disputeResolution")}</p>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ff5d46]" />
                <p className="text-[#5d574b] text-base">{t("capabilities.userModeration")}</p>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#ff5d46]" />
                <p className="text-[#5d574b] text-base">{t("capabilities.analytics")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
              {t("security.title")}
            </h2>

            <div className="mt-16 space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("security.roleBasedAccess.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("security.roleBasedAccess.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("security.auditLogs.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("security.auditLogs.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("security.dataProtection.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("security.dataProtection.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#ff5d46]">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#211f1a] text-xl">
                    {t("security.twoFactorAuth.title")}
                  </h3>
                  <p className="mt-2 text-[#5d574b] text-base leading-relaxed">
                    {t("security.twoFactorAuth.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Tools Grid */}
        <section className="border-[#ebe5d8] border-b bg-white px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-semibold text-4xl text-[#211f1a] leading-tight sm:text-5xl">
              {t("tools.title")}
            </h2>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">
                  {t("tools.professionalApproval").split(":")[0]}
                </h4>
                <p className="mt-2 text-[#5d574b] text-sm">
                  {t("tools.professionalApproval").split(":")[1]}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">
                  {t("tools.documentVerification").split(":")[0]}
                </h4>
                <p className="mt-2 text-[#5d574b] text-sm">
                  {t("tools.documentVerification").split(":")[1]}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">
                  {t("tools.payoutQueue").split(":")[0]}
                </h4>
                <p className="mt-2 text-[#5d574b] text-sm">
                  {t("tools.payoutQueue").split(":")[1]}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">
                  {t("tools.userManagement").split(":")[0]}
                </h4>
                <p className="mt-2 text-[#5d574b] text-sm">
                  {t("tools.userManagement").split(":")[1]}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">
                  {t("tools.disputeResolution").split(":")[0]}
                </h4>
                <p className="mt-2 text-[#5d574b] text-sm">
                  {t("tools.disputeResolution").split(":")[1]}
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
                <h4 className="font-semibold text-[#211f1a]">
                  {t("tools.analytics").split(":")[0]}
                </h4>
                <p className="mt-2 text-[#5d574b] text-sm">{t("tools.analytics").split(":")[1]}</p>
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
                href="/contact"
              >
                {t("cta.requestDemo")}
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-8 py-4 font-semibold text-[#211f1a] text-base transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
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
