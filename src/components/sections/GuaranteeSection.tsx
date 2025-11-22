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
import { useState } from "react";

const features = [
  {
    id: "quality",
    icon: Shield01Icon,
    title: "Quality assurance",
    description:
      "Every professional on our platform is held to the highest standards. We monitor ratings, reviews, and service quality to ensure consistent excellence.",
  },
  {
    id: "reporting",
    icon: Message01Icon,
    title: "Easy issue reporting",
    description:
      "Something not right? Report issues directly in the app within 24 hours of your service. Our team reviews every case personally.",
  },
  {
    id: "reservice",
    icon: RefreshIcon,
    title: "Free re-service",
    description:
      "If the service doesn't meet expectations, we'll send a professional back at no additional cost to make it right.",
  },
  {
    id: "refund",
    icon: CreditCardIcon,
    title: "Money-back guarantee",
    description:
      "If we can't resolve the issue to your satisfaction, you'll receive a full refund. No questions asked, no hassle.",
  },
];

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
      { label: "Issue Unresolved", status: "complete" },
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
      className="relative rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      exit={{ opacity: 0, y: -10 }}
      initial={{ opacity: 0, y: 10 }}
      key={activeFeature}
      transition={{ duration: 0.3 }}
    >
      {/* Soft corner decorations - hidden on mobile for performance */}
      <div className="absolute inset-0 hidden overflow-hidden rounded-xl sm:block">
        <div className="-top-8 -left-8 absolute h-32 w-32 rounded-full bg-neutral-200/40 blur-2xl" />
        <div className="-bottom-4 -right-4 absolute h-24 w-24 rounded-full bg-neutral-200/30 blur-xl" />
      </div>

      {/* Header */}
      <div className="relative mb-4 sm:mb-6">
        <p className="mb-1.5 font-medium text-neutral-500 text-xs sm:mb-2">{config.title}</p>
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="font-medium text-neutral-900 text-sm">Booking #4582</span>
          <span
            className={`rounded-full px-2 py-0.5 font-medium text-xs ${
              config.outcomeColor === "green"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
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
              : "from-green-500 via-orange-400 to-neutral-200"
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
                        ? "border-2 border-orange-400 bg-orange-50 text-orange-500"
                        : "border-2 border-neutral-300 bg-white text-neutral-400"
                  }`}
                >
                  {isComplete ? (
                    <HugeiconsIcon
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      icon={CheckmarkCircle02Icon}
                    />
                  ) : isActive ? (
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500 sm:h-2 sm:w-2" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-300 sm:h-2 sm:w-2" />
                  )}
                </div>

                {/* Step label */}
                <div
                  className={`flex-1 rounded-lg border px-3 py-1.5 transition-colors sm:px-4 sm:py-2 ${
                    isComplete
                      ? "border-green-200 bg-green-50"
                      : isActive
                        ? "border-orange-200 bg-orange-50"
                        : "border-neutral-200 bg-white"
                  }`}
                >
                  <span
                    className={`font-medium text-xs sm:text-sm ${
                      isComplete
                        ? "text-green-700"
                        : isActive
                          ? "text-orange-700"
                          : "text-neutral-600"
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
      <div className="relative mt-4 flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5 sm:mt-6 sm:px-4 sm:py-3">
        <span className="text-neutral-500 text-xs">Resolution time</span>
        <span className="font-medium text-neutral-700 text-sm">Within 24 hours</span>
      </div>
    </motion.div>
  );
}

function FeatureList({
  activeFeature,
  setActiveFeature,
}: {
  activeFeature: string;
  setActiveFeature: (id: string) => void;
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {features.map((feature) => {
        const isActive = activeFeature === feature.id;

        return (
          <motion.div
            className={`cursor-pointer rounded-xl border transition-all active:scale-[0.99] ${
              isActive
                ? "border-orange-200 bg-orange-50/50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
            key={feature.id}
            layout
            onClick={() => setActiveFeature(feature.id)}
          >
            {/* Touch-friendly tap target with larger padding on mobile */}
            <div className="flex w-full items-center gap-3 px-3 py-3 sm:px-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8 ${
                  isActive ? "bg-orange-100" : "bg-neutral-100"
                }`}
              >
                <HugeiconsIcon
                  className={`h-4 w-4 ${isActive ? "text-orange-600" : "text-neutral-600"}`}
                  icon={feature.icon}
                />
              </div>
              <span
                className={`flex-1 text-left font-medium text-sm ${
                  isActive ? "text-orange-700" : "text-neutral-700"
                }`}
              >
                {feature.title}
              </span>
              <HugeiconsIcon
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive ? "rotate-45 text-orange-500" : "text-neutral-400"
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
                  <p className="px-3 pb-3 text-neutral-600 text-sm leading-relaxed sm:px-4 sm:pb-4">
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
  const [activeFeature, setActiveFeature] = useState<string>("reservice");

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:gap-6 md:flex-row md:items-center lg:mb-12">
          <div>
            {/* Badge */}
            <span className="mb-3 inline-block rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-medium text-neutral-600 text-xs sm:mb-4">
              Service Guarantee
            </span>

            {/* Headline - responsive sizing */}
            <h2 className="mb-2 font-semibold text-2xl text-neutral-900 tracking-tight sm:mb-3 sm:text-3xl md:text-4xl">
              Your satisfaction, guaranteed
            </h2>

            {/* Subtitle */}
            <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
              If something's not right, we'll make it right — or your money back.
            </p>
          </div>

          {/* Learn more button - full width on mobile */}
          <button
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-2.5 font-medium text-neutral-700 text-sm shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 sm:w-auto"
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
            <FeatureList activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
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
