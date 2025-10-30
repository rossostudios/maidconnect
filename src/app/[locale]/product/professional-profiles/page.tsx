import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Star, Image, Award, CheckCircle2 } from "lucide-react";
import { ProductHeroSection } from "@/components/product/product-hero-section";
import { ProductFeatureCard } from "@/components/product/product-feature-card";
import { ProductStepsSection } from "@/components/product/product-steps-section";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { Link } from "@/i18n/routing";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "pages.professionalProfiles.meta" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "verified professionals",
      "background checked",
      "professional profiles",
      "verified credentials",
      "customer reviews",
      "portfolio gallery",
      "trusted professionals Colombia",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://maidconnect.co/product/professional-profiles",
      siteName: "Maidconnect",
      images: [
        {
          url: "https://maidconnect.co/og-professional-profiles.png",
          width: 1200,
          height: 630,
          alt: "Maidconnect Verified Professional Profiles",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://maidconnect.co/og-professional-profiles.png"],
    },
    alternates: {
      canonical: "https://maidconnect.co/product/professional-profiles",
    },
  };
}

export default async function ProfessionalProfilesPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "pages.professionalProfiles" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Verified Professional Profiles",
    provider: {
      "@type": "Organization",
      name: "Maidconnect",
    },
    description: t("hero.description"),
    serviceType: "Professional Verification Service",
    areaServed: {
      "@type": "Country",
      name: "Colombia",
    },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main>
      {/* Hero Section */}
      <ProductHeroSection
        headline={t("hero.headline")}
        description={t("hero.description")}
        primaryCTA={{ label: t("hero.primaryCTA"), href: "/professionals" }}
        secondaryCTA={{ label: t("hero.secondaryCTA"), href: "#features" }}
        badge={t("hero.badge")}
      />

      {/* Features Section */}
      <section
        id="features"
        className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl lg:text-6xl">
            {t("features.title")}
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-[#5d574b]">
            {t("features.subtitle")}
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ProductFeatureCard
              icon={ShieldCheck}
              title={t("features.verifiedCredentials.title")}
              description={t("features.verifiedCredentials.description")}
            />

            <ProductFeatureCard
              icon={Star}
              title={t("features.customerReviews.title")}
              description={t("features.customerReviews.description")}
            />

            <ProductFeatureCard
              icon={Image}
              title={t("features.portfolioGalleries.title")}
              description={t("features.portfolioGalleries.description")}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <ProductStepsSection
        headline={t("howItWorks.title")}
        description={t("howItWorks.description")}
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

      {/* Profile Features Section */}
      <section className="border-b border-[#ebe5d8] bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
            {t("profileFeatures.title")}
          </h2>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <Award className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                {t("profileFeatures.professionalInfo.title")}
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.professionalInfo.items.experience")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.professionalInfo.items.certifications")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.professionalInfo.items.services")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.professionalInfo.items.areas")}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <Star className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                {t("profileFeatures.socialProof.title")}
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.socialProof.items.rating")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.socialProof.items.reviews")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.socialProof.items.portfolio")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.socialProof.items.bookings")}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <ShieldCheck className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                {t("profileFeatures.safetyTrust.title")}
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.safetyTrust.items.backgroundCheck")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.safetyTrust.items.identity")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.safetyTrust.items.insurance")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.safetyTrust.items.verified")}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5d46]/10">
                <Image className="h-6 w-6 text-[#ff5d46]" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[#211f1a]">
                {t("profileFeatures.workExamples.title")}
              </h3>
              <ul className="mt-4 space-y-3 text-base text-[#5d574b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.workExamples.items.galleryPhotos")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.workExamples.items.beforeAfter")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.workExamples.items.serviceExamples")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#ff5d46]" />
                  <span>{t("profileFeatures.workExamples.items.bio")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white px-6 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold leading-tight text-[#211f1a] sm:text-5xl">
            {t("cta.title")}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5d574b]">
            {t("cta.description")}
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/professionals"
              className="inline-flex items-center justify-center rounded-full bg-[#ff5d46] px-8 py-4 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65]"
            >
              {t("cta.browseProfessionals")}
            </Link>

            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center rounded-full border-2 border-[#ebe5d8] bg-white px-8 py-4 text-base font-semibold text-[#211f1a] transition hover:border-[#ff5d46] hover:text-[#ff5d46]"
            >
              {t("cta.becomeProfessional")}
            </Link>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
