/**
 * Public Roadmap Page
 *
 * Displays all published roadmap items with filtering and voting
 */

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { RoadmapBoard } from "@/components/roadmap/roadmap-board";
import { SiteFooter } from "@/components/sections/SiteFooter";
import { SiteHeader } from "@/components/sections/SiteHeader";

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
      <div className="flex min-h-screen flex-col bg-neutral-50">
        {/* Header - Auto Layout: Vertical stack, padding 48px vertical */}
        <div className="border-neutral-200 border-b bg-neutral-50">
          <div className="container mx-auto max-w-7xl px-6 py-16 lg:px-8">
            {/* Auto Layout: Vertical stack, gap 16px, center aligned */}
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
              <h1 className="serif-display-lg text-neutral-900">{t("title")}</h1>
              <p className="lead text-neutral-900/70">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Main content - Auto Layout: padding 32px, fill remaining space */}
        <div className="container mx-auto max-w-7xl flex-1 px-6 py-12 lg:px-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <HugeiconsIcon
                  className="h-8 w-8 animate-spin text-orange-500"
                  icon={Loading03Icon}
                />
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
