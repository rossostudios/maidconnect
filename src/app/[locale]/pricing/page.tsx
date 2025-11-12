/**
 * Pricing Page
 *
 * Displays pricing plans with monthly/annual toggle and comparison table
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PricingComparison } from "@/components/pricing/pricing-comparison";
import { PricingFaqSection } from "@/components/pricing/pricing-faq-section";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-[#FFEEFF8E8]">
        {/* Header */}
        <div className="bg-[#FFEEFF8E8]">
          <div className="container mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <p className="tagline text-[#AA88AAAAC]">PRICING</p>
              <h1 className="serif-display-lg mt-6 text-[#116611616]">{t("title")}</h1>
              <p className="lead mt-6 text-[#116611616]/70">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Pricing plans */}
        <div className="bg-[#FFEEFF8E8] py-20 sm:py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF4444A22] border-t-transparent" />
                </div>
              }
            >
              <PricingPlans />
            </Suspense>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center bg-[#FFEEFF8E8] py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF4444A22] border-t-transparent" />
            </div>
          }
        >
          <PricingComparison />
        </Suspense>

        {/* FAQ section */}
        <div className="bg-[#FFEEFF8E8]">
          <div className="container mx-auto max-w-4xl px-6 py-20 sm:py-24 lg:py-32">
            <div className="mb-12 text-center">
              <h2 className="serif-display-lg text-[#116611616]">{t("faq.title")}</h2>
              <p className="lead mt-4 text-[#116611616]/70">{t("faq.subtitle")}</p>
            </div>

            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#FF4444A22] border-t-transparent" />
                </div>
              }
            >
              <PricingFaqSection />
            </Suspense>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-[#FFEEFF8E8] py-20 sm:py-24">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <div className="rounded-[32px] border border-[#EE44EE2E3] bg-gradient-to-br from-[#FFEEFF8E8] to-[#FFEEFF8E8] p-12 shadow-[0_10px_40px_rgba(22,22,22,0.04)]">
              <h2 className="serif-headline-lg text-[#116611616]">{t("cta.title")}</h2>
              <p className="lead mt-4 text-[#116611616]/70">{t("cta.subtitle")}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  className="inline-flex items-center justify-center rounded-full bg-[#FF4444A22]/100 px-8 py-4 font-semibold text-[#FFEEFF8E8] text-base transition hover:bg-[#FF4444A22]"
                  href="/professionals"
                >
                  {t("cta.primary")}
                </a>
                <a
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#FF4444A22] bg-transparent px-8 py-4 font-semibold text-[#FF4444A22] text-base transition hover:bg-[#FF4444A22]/100 hover:text-[#FFEEFF8E8]"
                  href="/contact"
                >
                  {t("cta.secondary")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
