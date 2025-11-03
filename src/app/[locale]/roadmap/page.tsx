/**
 * Public Roadmap Page
 *
 * Displays all published roadmap items with filtering and voting
 */

import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { RoadmapBoard } from "@/components/roadmap/roadmap-board";
import { SiteFooter } from "@/components/sections/site-footer";
import { SiteHeader } from "@/components/sections/site-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("roadmap");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function RoadmapPage() {
  const t = useTranslations("roadmap");

  return (
    <>
      <SiteHeader />
      <div className="min-h-screen bg-[#fbfaf9]">
        {/* Header */}
        <div className="border-[#ebe5d8] border-b bg-white">
          <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 font-bold text-4xl text-[#211f1a] md:text-5xl">{t("title")}</h1>
              <p className="text-[#6B7280] text-lg">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B7355] border-t-transparent" />
              </div>
            }
          >
            <RoadmapBoard />
          </Suspense>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
