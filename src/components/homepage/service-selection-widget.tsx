"use client";

import { SparklesIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/core";

export type ServiceSelectionWidgetProps = {
  className?: string;
};

/**
 * Homepage decision flow widget for choosing between Amara AI (quick jobs)
 * and Human Concierge (long-term hires).
 *
 * Design: Anthropic Lia - rounded-lg cards, orange primary, blue secondary
 */
export function ServiceSelectionWidget({ className }: ServiceSelectionWidgetProps) {
  const t = useTranslations("components.serviceSelectionWidget");

  return (
    <section
      className={cn("border-neutral-200 border-y bg-white py-12 sm:py-16 lg:py-20", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <h2 className="font-[family-name:var(--font-geist-sans)] font-semibold text-2xl text-neutral-900 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm leading-6 sm:mt-4 sm:text-base sm:leading-6">
            {t("description")}
          </p>
        </div>

        {/* Decision Flow Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {/* Quick Job Card - Orange (Amara AI) */}
          <Link
            className="group hover:-translate-y-1 block transform transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            href="/professionals"
          >
            <div className="flex h-full flex-col rounded-lg border-2 border-orange-200 bg-orange-50 p-6 shadow-sm transition-all hover:border-orange-300 hover:shadow-md sm:p-8">
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-orange-100 p-3">
                <HugeiconsIcon
                  className="h-6 w-6 text-orange-600 sm:h-8 sm:w-8"
                  icon={SparklesIcon}
                />
              </div>

              {/* Content */}
              <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl sm:mb-3 sm:text-2xl">
                {t("quickJob.title")}
              </h3>
              <p className="mb-4 flex-1 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm leading-6 sm:mb-6 sm:text-base sm:leading-6">
                {t("quickJob.description")}
              </p>

              {/* Features List */}
              <ul className="mb-6 space-y-2 sm:mb-8">
                <li className="flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                  {t("quickJob.feature1")}
                </li>
                <li className="flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                  {t("quickJob.feature2")}
                </li>
                <li className="flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                  {t("quickJob.feature3")}
                </li>
              </ul>

              {/* CTA Button */}
              <Button asChild className="w-full justify-center gap-2" size="lg">
                <span className="flex items-center">
                  {t("quickJob.cta")}
                  <svg
                    aria-hidden="true"
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>{t("quickJob.cta")}</title>
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </Link>

          {/* Long-Term Hire Card - Blue (Concierge) */}
          <Link
            className="group hover:-translate-y-1 block transform transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            href="/concierge"
          >
            <div className="flex h-full flex-col rounded-lg border-2 border-blue-200 bg-blue-50 p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md sm:p-8">
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-3">
                <HugeiconsIcon
                  className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8"
                  icon={UserMultiple02Icon}
                />
              </div>

              {/* Content */}
              <h3 className="mb-2 font-[family-name:var(--font-geist-sans)] font-semibold text-neutral-900 text-xl sm:mb-3 sm:text-2xl">
                {t("longTermHire.title")}
              </h3>
              <p className="mb-4 flex-1 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm leading-6 sm:mb-6 sm:text-base sm:leading-6">
                {t("longTermHire.description")}
              </p>

              {/* Features List */}
              <ul className="mb-6 space-y-2 sm:mb-8">
                <li className="flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {t("longTermHire.feature1")}
                </li>
                <li className="flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {t("longTermHire.feature2")}
                </li>
                <li className="flex items-center gap-2 font-[family-name:var(--font-geist-sans)] text-neutral-700 text-sm">
                  <span className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {t("longTermHire.feature3")}
                </li>
              </ul>

              {/* CTA Button */}
              <Button asChild className="w-full justify-center gap-2" size="lg" variant="default">
                <span className="flex items-center">
                  {t("longTermHire.cta")}
                  <svg
                    aria-hidden="true"
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>{t("longTermHire.cta")}</title>
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center font-[family-name:var(--font-geist-sans)] text-neutral-500 text-xs sm:mt-8 sm:text-sm">
          {t("helpText")}
        </p>
      </div>
    </section>
  );
}
