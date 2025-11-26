"use client";

import {
  Add01Icon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
  Message01Icon,
  Remove01Icon,
  Search01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Different visual states for each feature
const visualConfigs = {
  verification: {
    steps: [
      { label: "Application", status: "complete" },
      { label: "ID Verification", status: "complete" },
      { label: "Background Check", status: "complete" },
    ],
    title: "3-step process",
  },
  background: {
    steps: [
      { label: "National Records", status: "complete" },
      { label: "Local Records", status: "complete" },
      { label: "Court Records", status: "active" },
      { label: "Final Review", status: "pending" },
    ],
    title: "Background screening",
  },
  identity: {
    steps: [
      { label: "ID Upload", status: "complete" },
      { label: "Document Scan", status: "complete" },
      { label: "Biometric Match", status: "complete" },
      { label: "Verified", status: "complete" },
    ],
    title: "Identity check",
  },
  references: {
    steps: [
      { label: "References Submitted", status: "complete" },
      { label: "Employer Contact", status: "complete" },
      { label: "Personal Reference", status: "active" },
      { label: "Validation Complete", status: "pending" },
    ],
    title: "Reference check",
  },
};

function VerificationFlowVisual({ activeFeature }: { activeFeature: string }) {
  const config = visualConfigs[activeFeature as keyof typeof visualConfigs];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 10 }}
      key={activeFeature}
      transition={{ duration: 0.3 }}
    >
      {/* Soft corner decorations - hidden on mobile for performance */}
      <div className="absolute inset-0 hidden overflow-hidden rounded-xl sm:block">
        <div className="-top-8 -right-8 absolute h-32 w-32 rounded-full bg-rausch-500/10 blur-2xl" />
        <div className="-bottom-4 -left-4 absolute h-24 w-24 rounded-full bg-rausch-500/5 blur-xl" />
      </div>

      {/* Search/Input field */}
      <div className="relative mb-4 sm:mb-6">
        <p className="mb-1.5 font-medium text-muted-foreground text-xs sm:mb-2">{config.title}</p>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="font-medium text-foreground text-sm">María Camila S.</span>
        </div>
      </div>

      {/* Vertical flow with connecting line */}
      <div className="relative space-y-0.5 sm:space-y-1">
        {/* Connecting line */}
        <div className="absolute top-5 bottom-5 left-[14px] w-0.5 bg-gradient-to-b from-green-500 via-green-400 to-border sm:top-6 sm:bottom-6 sm:left-[18px]" />

        <AnimatePresence mode="wait">
          {config.steps.map((step, index) => {
            const isComplete = step.status === "complete";
            const isActive = step.status === "active";

            return (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="relative flex items-center gap-2 sm:gap-4"
                initial={{ opacity: 0, x: -10 }}
                key={`${activeFeature}-${step.label}`}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {/* Icon container - smaller on mobile */}
                <div
                  className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9 ${
                    isComplete
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "border-2 border-rausch-400 bg-rausch-500/10 text-rausch-500"
                        : "border-2 border-border bg-card text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <HugeiconsIcon
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      icon={CheckmarkCircle02Icon}
                    />
                  ) : isActive ? (
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-rausch-500 sm:h-2 sm:w-2" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-border sm:h-2 sm:w-2" />
                  )}
                </div>

                {/* Step label */}
                <div
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors sm:px-4 sm:py-2 ${
                    isComplete
                      ? "border-green-500/30 bg-green-500/10"
                      : isActive
                        ? "border-rausch-500/30 bg-rausch-500/10"
                        : "border-border bg-card"
                  }`}
                >
                  <span
                    className={`font-medium text-xs sm:text-sm ${
                      isComplete
                        ? "text-green-500"
                        : isActive
                          ? "text-rausch-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Status badge - hidden on mobile, shown on tablet+ */}
                {isComplete && (
                  <span className="hidden font-medium text-green-500 text-xs md:inline">
                    ✓ Complete
                  </span>
                )}
                {isActive && (
                  <span className="hidden font-medium text-rausch-500 text-xs md:inline">
                    In progress
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
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
                ? "border-rausch-500/30 bg-rausch-500/10"
                : "border-border bg-card hover:border-rausch-500/50"
            }`}
            key={feature.id}
            layout
            onClick={() => setActiveFeature(feature.id)}
          >
            {/* Touch-friendly tap target with larger padding on mobile */}
            <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8 ${
                  isActive ? "bg-rausch-500/20" : "bg-muted"
                }`}
              >
                <HugeiconsIcon
                  className={`h-4 w-4 ${isActive ? "text-rausch-500" : "text-muted-foreground"}`}
                  icon={feature.icon}
                />
              </div>
              <span
                className={`flex-1 text-left font-medium text-sm ${
                  isActive ? "text-rausch-500" : "text-foreground"
                }`}
              >
                {feature.title}
              </span>
              <HugeiconsIcon
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive ? "rotate-45 text-rausch-500" : "text-muted-foreground"
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
                  <p className="px-3 pb-3 text-muted-foreground text-sm leading-relaxed sm:px-4 sm:pb-4">
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

export function VerificationSection() {
  const t = useTranslations("home.verification");
  const [activeFeature, setActiveFeature] = useState<string>("background");

  const features = [
    {
      id: "verification",
      icon: CheckmarkCircle02Icon,
      title: t("features.verification.title"),
      description: t("features.verification.description"),
    },
    {
      id: "background",
      icon: Search01Icon,
      title: t("features.background.title"),
      description: t("features.background.description"),
    },
    {
      id: "identity",
      icon: Shield01Icon,
      title: t("features.identity.title"),
      description: t("features.identity.description"),
    },
    {
      id: "references",
      icon: Message01Icon,
      title: t("features.references.title"),
      description: t("features.references.description"),
    },
  ];

  return (
    <section className="bg-muted py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:gap-6 md:flex-row md:items-center lg:mb-12">
          <div>
            {/* Badge */}
            <span className="mb-3 inline-block rounded-full border border-border bg-card px-3 py-1 font-medium text-muted-foreground text-xs sm:mb-4">
              {t("badge")}
            </span>

            {/* Headline - responsive sizing */}
            <h2 className="mb-2 font-semibold text-2xl text-foreground tracking-tight sm:mb-3 sm:text-3xl md:text-4xl">
              {t("title")}
            </h2>

            {/* Subtitle */}
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">{t("subtitle")}</p>
          </div>

          {/* Explore button - full width on mobile */}
          <button
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 font-medium text-foreground text-sm shadow-sm transition-all hover:border-rausch-500 hover:bg-rausch-500/10 hover:text-rausch-500 sm:w-auto"
            type="button"
          >
            Explore
            <HugeiconsIcon
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              icon={ArrowRight02Icon}
            />
          </button>
        </div>

        {/* Content Grid - stacks on mobile/tablet, side-by-side on desktop */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Visual - shows first on mobile for context */}
          <div className="order-1 lg:order-1">
            <VerificationFlowVisual activeFeature={activeFeature} />
          </div>

          {/* Feature List - acts as tabs */}
          <div className="order-2 lg:order-2">
            <FeatureList
              activeFeature={activeFeature}
              features={features}
              setActiveFeature={setActiveFeature}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
