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
      {/* Auto Layout: Vertical stack, fill width, hug height */}
      <div className="flex min-h-screen flex-col bg-[#F5F0E8]">
        {/* Header - Auto Layout: Vertical stack, padding 48px vertical */}
        <div className="border-[#ebe5d8] border-b bg-white">
          <div className="container mx-auto max-w-7xl px-6 py-16 lg:px-8">
            {/* Auto Layout: Vertical stack, gap 16px, center aligned */}
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
              <h1 className="serif-display-lg text-[#1A1614]">{t("title")}</h1>
              <p className="lead text-[#1A1614]/70">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Main content - Auto Layout: padding 32px, fill remaining space */}
        <div className="container mx-auto max-w-7xl flex-1 px-6 py-12 lg:px-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E85D48] border-t-transparent" />
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
