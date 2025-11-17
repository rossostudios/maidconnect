import {
  Award01Icon,
  CheckmarkCircle02Icon,
  Image01Icon,
  SecurityCheckIcon,
  StarIcon,
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
      url: "https://casaora.co/product/professional-profiles",
      siteName: "Casaora",
      images: [
        {
          url: "https://casaora.co/og-professional-profiles.png",
          width: 1200,
          height: 630,
          alt: "Casaora Verified Professional Profiles",
        },
      ],
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://casaora.co/og-professional-profiles.png"],
    },
    alternates: {
      canonical: "https://casaora.co/product/professional-profiles",
    },
  };
}

export default async function ProfessionalProfilesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.professionalProfiles" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Verified Professional Profiles",
    provider: {
      "@type": "Organization",
      name: "Casaora",
    },
    description: t("hero.description"),
    serviceType: "Professional Verification Service",
    areaServed: {
      "@type": "Country",
      name: "Colombia",
    },
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
          primaryCTA={{ label: t("hero.primaryCTA"), href: "/professionals" }}
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
                description={t("features.verifiedCredentials.description")}
                icon={SecurityCheckIcon}
                title={t("features.verifiedCredentials.title")}
              />

              <ProductFeatureCard
                description={t("features.customerReviews.description")}
                icon={StarIcon}
                title={t("features.customerReviews.title")}
              />

              <ProductFeatureCard
                description={t("features.portfolioGalleries.description")}
                icon={Image01Icon}
                title={t("features.portfolioGalleries.title")}
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

        {/* Profile Features Section */}
        <section className="border-neutral-200 border-b bg-neutral-50 px-6 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="type-serif-lg text-center text-neutral-900">
              {t("profileFeatures.title")}
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <div className="flex h-12 w-12 items-center justify-center bg-orange-500/10">
                  <HugeiconsIcon className="h-6 w-6 text-orange-500" icon={Award01Icon} />
                </div>
                <h3 className="mt-6 font-semibold text-2xl text-neutral-900">
                  {t("profileFeatures.professionalInfo.title")}
                </h3>
                <ul className="mt-4 space-y-3 text-base text-neutral-700">
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.professionalInfo.items.experience")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.professionalInfo.items.certifications")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.professionalInfo.items.services")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.professionalInfo.items.areas")}</span>
                  </li>
                </ul>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <div className="flex h-12 w-12 items-center justify-center bg-orange-500/10">
                  <HugeiconsIcon className="h-6 w-6 text-orange-500" icon={StarIcon} />
                </div>
                <h3 className="mt-6 font-semibold text-2xl text-neutral-900">
                  {t("profileFeatures.socialProof.title")}
                </h3>
                <ul className="mt-4 space-y-3 text-base text-neutral-700">
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.socialProof.items.rating")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.socialProof.items.reviews")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.socialProof.items.portfolio")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.socialProof.items.bookings")}</span>
                  </li>
                </ul>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <div className="flex h-12 w-12 items-center justify-center bg-orange-500/10">
                  <HugeiconsIcon className="h-6 w-6 text-orange-500" icon={SecurityCheckIcon} />
                </div>
                <h3 className="mt-6 font-semibold text-2xl text-neutral-900">
                  {t("profileFeatures.safetyTrust.title")}
                </h3>
                <ul className="mt-4 space-y-3 text-base text-neutral-700">
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.safetyTrust.items.backgroundCheck")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.safetyTrust.items.identity")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.safetyTrust.items.insurance")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.safetyTrust.items.verified")}</span>
                  </li>
                </ul>
              </div>

              <div className="border border-neutral-200 bg-neutral-50 p-8">
                <div className="flex h-12 w-12 items-center justify-center bg-orange-500/10">
                  <HugeiconsIcon className="h-6 w-6 text-orange-500" icon={Image01Icon} />
                </div>
                <h3 className="mt-6 font-semibold text-2xl text-neutral-900">
                  {t("profileFeatures.workExamples.title")}
                </h3>
                <ul className="mt-4 space-y-3 text-base text-neutral-700">
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.workExamples.items.galleryPhotos")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.workExamples.items.beforeAfter")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.workExamples.items.serviceExamples")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500"
                      icon={CheckmarkCircle02Icon}
                    />
                    <span>{t("profileFeatures.workExamples.items.bio")}</span>
                  </li>
                </ul>
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
                className="inline-flex items-center justify-center bg-orange-500 px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[var(--red-hover)]"
                href="/professionals"
              >
                {t("cta.browseProfessionals")}
              </Link>

              <Link
                className="inline-flex items-center justify-center border-2 border-neutral-200 bg-neutral-50 px-8 py-4 font-semibold text-base text-neutral-900 transition hover:border-[var(--red)] hover:text-orange-500"
                href="/auth/sign-up"
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
