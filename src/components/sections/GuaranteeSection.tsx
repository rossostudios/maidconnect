"use client";

import {
  Add01Icon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Message01Icon,
  RefreshIcon,
  Remove01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Different visual states for each feature
const visualConfigs = {
  quality: {
    steps: [
      { label: "Service Completed", status: "complete" },
      { label: "Quality Check", status: "complete" },
      { label: "Rating Submitted", status: "complete" },
      { label: "Standards Met ✓", status: "complete" },
    ],
    title: "Quality monitoring",
    outcome: "Service approved",
    outcomeColor: "green",
  },
  reporting: {
    steps: [
      { label: "Issue Identified", status: "complete" },
      { label: "Report Submitted", status: "complete" },
      { label: "Team Review", status: "active" },
      { label: "Resolution Pending", status: "pending" },
    ],
    title: "Issue reporting",
    outcome: "Under review",
    outcomeColor: "orange",
  },
  reservice: {
    steps: [
      { label: "Issue Confirmed", status: "complete" },
      { label: "Re-service Scheduled", status: "complete" },
      { label: "Professional Assigned", status: "complete" },
      { label: "Service Complete", status: "active" },
    ],
    title: "Re-service process",
    outcome: "In progress",
    outcomeColor: "orange",
  },
  refund: {
    steps: [
      { label: "Issue Reported", status: "complete" },
      { label: "Refund Requested", status: "complete" },
      { label: "Review Approved", status: "complete" },
      { label: "Refund Processed", status: "complete" },
    ],
    title: "Refund process",
    outcome: "Refund issued",
    outcomeColor: "green",
  },
};

function GuaranteeFlowVisual({ activeFeature }: { activeFeature: string }) {
  const config = visualConfigs[activeFeature as keyof typeof visualConfigs];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card dark:shadow-none"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 10 }}
      key={activeFeature}
      transition={{ duration: 0.3 }}
    >
      {/* Soft corner decorations - hidden on mobile for performance */}
      <div className="absolute inset-0 hidden overflow-hidden rounded-xl sm:block">
        <div className="-top-8 -left-8 absolute h-32 w-32 rounded-full bg-neutral-200/40 blur-2xl dark:bg-rausch-500/10" />
        <div className="-bottom-4 -right-4 absolute h-24 w-24 rounded-full bg-neutral-200/30 blur-xl dark:bg-rausch-500/5" />
      </div>

      {/* Header */}
      <div className="relative mb-4 sm:mb-6">
        <p className="mb-1.5 font-medium text-neutral-500 text-xs sm:mb-2 dark:text-neutral-400">
          {config.title}
        </p>
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 sm:px-4 sm:py-3 dark:border-border dark:bg-muted">
          <span className="font-medium text-neutral-900 text-sm dark:text-neutral-50">
            Booking #4582
          </span>
          <span
            className={`rounded-full px-2 py-0.5 font-medium text-xs ${
              config.outcomeColor === "green"
                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
            }`}
          >
            {config.outcome}
          </span>
        </div>
      </div>

      {/* Vertical flow with connecting line */}
      <div className="relative space-y-0.5 sm:space-y-1">
        {/* Connecting line */}
        <div
          className={`absolute top-5 bottom-5 left-[14px] w-0.5 bg-gradient-to-b sm:top-6 sm:bottom-6 sm:left-[18px] ${
            config.outcomeColor === "green"
              ? "from-green-500 via-green-400 to-green-300"
              : "from-green-500 via-violet-400 to-neutral-200"
          }`}
        />

        <AnimatePresence mode="wait">
          {config.steps.map((step, index) => {
            const isComplete = step.status === "complete";
            const isActive = step.status === "active";

            return (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="relative flex items-center gap-2 sm:gap-4"
                initial={{ opacity: 0, x: 10 }}
                key={`${activeFeature}-${step.label}`}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {/* Icon container - smaller on mobile */}
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9 ${
                    isComplete
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "border-2 border-violet-400 bg-violet-50 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400"
                        : "border-2 border-neutral-300 bg-white text-neutral-400 dark:border-border dark:bg-muted"
                  }`}
                >
                  {isComplete ? (
                    <HugeiconsIcon
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      icon={CheckmarkCircle02Icon}
                    />
                  ) : isActive ? (
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500 sm:h-2 sm:w-2 dark:bg-violet-400" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 sm:h-2 sm:w-2 dark:bg-neutral-500" />
                  )}
                </div>

                {/* Step label */}
                <div
                  className={`flex-1 rounded-lg border px-3 py-1.5 transition-colors sm:px-4 sm:py-2 ${
                    isComplete
                      ? "border-green-200 bg-green-50 dark:border-green-500/30 dark:bg-green-500/10"
                      : isActive
                        ? "border-violet-200 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-500/10"
                        : "border-neutral-200 bg-white dark:border-border dark:bg-card"
                  }`}
                >
                  <span
                    className={`font-medium text-xs sm:text-sm ${
                      isComplete
                        ? "text-green-700 dark:text-green-400"
                        : isActive
                          ? "text-violet-700 dark:text-violet-400"
                          : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom info */}
      <div className="relative mt-4 flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 sm:mt-6 sm:px-4 sm:py-3 dark:border-border dark:bg-muted">
        <span className="text-neutral-500 text-xs dark:text-neutral-400">Resolution time</span>
        <span className="font-medium text-neutral-700 text-sm dark:text-neutral-300">
          Within 24 hours
        </span>
      </div>
    </motion.div>
  );
}

function FeatureList({
  activeFeature,
  setActiveFeature,
  features,
}: {
  activeFeature: string;
  setActiveFeature: (id: string) => void;
  features: { id: string; icon: any; title: string; description: string }[];
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {features.map((feature) => {
        const isActive = activeFeature === feature.id;

        return (
          <motion.div
            className={`cursor-pointer rounded-xl border transition-all active:scale-[0.99] ${
              isActive
                ? "border-violet-200 bg-violet-50/50 dark:border-violet-500/50 dark:bg-violet-500/10"
                : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-border dark:bg-card dark:hover:border-violet-500/30"
            }`}
            key={feature.id}
            layout
            onClick={() => setActiveFeature(feature.id)}
          >
            {/* Touch-friendly tap target with larger padding on mobile */}
            <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8 ${
                  isActive ? "bg-violet-100 dark:bg-violet-500/20" : "bg-neutral-100 dark:bg-muted"
                }`}
              >
                <HugeiconsIcon
                  className={`h-4 w-4 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-neutral-600 dark:text-neutral-400"}`}
                  icon={feature.icon}
                />
              </div>
              <span
                className={`flex-1 text-left font-medium text-sm ${
                  isActive
                    ? "text-violet-700 dark:text-violet-400"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {feature.title}
              </span>
              <HugeiconsIcon
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive ? "rotate-45 text-violet-500 dark:text-violet-400" : "text-neutral-400"
                }`}
                icon={isActive ? Remove01Icon : Add01Icon}
              />
            </div>

            <AnimatePresence>
              {isActive && (
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                  exit={{ height: 0, opacity: 0 }}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="px-3 pb-3 text-neutral-600 text-sm leading-relaxed sm:px-4 sm:pb-4 dark:text-neutral-400">
                    {feature.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export function GuaranteeSection() {
  const t = useTranslations("home.guarantee");
  const [activeFeature, setActiveFeature] = useState<string>("quality");

  const features = [
    {
      id: "quality",
      icon: Shield01Icon,
      title: t("features.quality.title"),
      description: t("features.quality.description"),
    },
    {
      id: "reporting",
      icon: Message01Icon,
      title: t("features.reporting.title"),
      description: t("features.reporting.description"),
    },
    {
      id: "reservice",
      icon: RefreshIcon,
      title: t("features.reservice.title"),
      description: t("features.reservice.description"),
    },
    {
      id: "refund",
      icon: CreditCardIcon,
      title: t("features.refund.title"),
      description: t("features.refund.description"),
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 dark:bg-background">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:gap-6 md:flex-row md:items-center lg:mb-12">
          <div>
            {/* Badge */}
            <span className="mb-3 inline-block rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-medium text-neutral-600 text-xs sm:mb-4 dark:border-border dark:bg-muted dark:text-neutral-400">
              {t("badge")}
            </span>

            {/* Headline - responsive sizing */}
            <h2 className="mb-2 font-semibold text-2xl text-neutral-900 tracking-tight sm:mb-3 sm:text-3xl md:text-4xl dark:text-neutral-50">
              {t("title")}
            </h2>

            {/* Subtitle */}
            <p className="max-w-xl text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
              {t("subtitle")}
            </p>
          </div>

          {/* Learn more button - full width on mobile */}
          <button
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-2.5 font-medium text-neutral-700 text-sm shadow-sm transition-all hover:border-rausch-200 hover:bg-rausch-50 hover:text-rausch-600 sm:w-auto dark:border-border dark:bg-muted dark:text-neutral-300 dark:shadow-none dark:hover:border-rausch-500/50 dark:hover:bg-rausch-500/20 dark:hover:text-rausch-400"
            type="button"
          >
            Learn more
            <HugeiconsIcon
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              icon={ArrowRight02Icon}
            />
          </button>
        </div>

        {/* Content Grid - stacks on mobile/tablet, side-by-side on desktop */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Feature List - shows first on mobile */}
          <div className="order-2 lg:order-1">
            <FeatureList
              activeFeature={activeFeature}
              features={features}
              setActiveFeature={setActiveFeature}
            />
          </div>

          {/* Flow Diagram - shows second on mobile for context after selecting */}
          <div className="order-1 lg:order-2">
            <GuaranteeFlowVisual activeFeature={activeFeature} />
          </div>
        </div>
      </div>
    </section>
  );
}
