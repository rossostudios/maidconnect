/**
 * Pricing Page
 *
 * Displays pricing plans with monthly/annual toggle and comparison table
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PricingFaqSection } from "@/components/pricing/pricing-faq-section";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";

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
      <div className="min-h-screen bg-[#fbfaf9]">
        {/* Header */}
        <div className="border-[#ebe5d8] border-b bg-white">
          <div className="container mx-auto max-w-6xl px-4 py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 font-bold text-5xl text-[#211f1a] md:text-6xl">{t("title")}</h1>
              <p className="text-[#6B7280] text-xl">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Pricing plans */}
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff5d46] border-t-transparent" />
              </div>
            }
          >
            <PricingPlans />
          </Suspense>
        </div>

        {/* FAQ section */}
        <div className="border-[#ebe5d8] border-t bg-white">
          <div className="container mx-auto max-w-4xl px-4 py-16">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold text-3xl text-[#211f1a] md:text-4xl">
                {t("faq.title")}
              </h2>
              <p className="text-[#6B7280] text-lg">{t("faq.subtitle")}</p>
            </div>

            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#ff5d46] border-t-transparent" />
                </div>
              }
            >
              <PricingFaqSection />
            </Suspense>
          </div>
        </div>

        {/* CTA section */}
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="rounded-[28px] border-2 border-[#ebe5d8] bg-white p-12">
            <h2 className="mb-4 font-bold text-3xl text-[#211f1a]">{t("cta.title")}</h2>
            <p className="mb-8 text-[#6B7280] text-lg">{t("cta.subtitle")}</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                className="rounded-[14px] bg-[#ff5d46] px-8 py-4 font-semibold text-lg text-white transition-all hover:bg-[#e54d36]"
                href="/auth/sign-up"
              >
                {t("cta.primary")}
              </a>
              <a
                className="rounded-[14px] border-2 border-[#ebe5d8] px-8 py-4 font-semibold text-[#211f1a] text-lg transition-all hover:border-[#211f1a]"
                href="/contact"
              >
                {t("cta.secondary")}
              </a>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
