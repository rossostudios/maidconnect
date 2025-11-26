"use client";

import { Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { Container } from "@/components/ui/container";
import type { HugeIcon } from "@/types/icons";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

type FeatureSectionClientProps = {
  title: string;
  description: string;
  features: string[];
  illustration: React.ReactNode;
  reversed?: boolean;
  background?: "white" | "neutral";
};

export function FeatureSectionClient({
  title,
  description,
  features,
  illustration,
  reversed = false,
  background = "white",
}: FeatureSectionClientProps) {
  return (
    <section
      className={
        background === "white"
          ? "bg-white dark:bg-rausch-950 py-16 md:py-24"
          : "bg-neutral-50 dark:bg-rausch-900 py-16 md:py-24"
      }
    >
      <Container className="max-w-6xl">
        <motion.div
          animate="visible"
          className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-16 ${reversed ? "lg:flex-row-reverse" : ""}`}
          initial="hidden"
          variants={stagger}
        >
          {/* Text Content */}
          <motion.div className={reversed ? "lg:order-2" : "lg:order-1"} variants={fadeIn}>
            <h2 className="font-medium text-3xl text-neutral-900 dark:text-white leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
              {title}
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-rausch-300 leading-relaxed">{description}</p>

            {/* Checkmark Feature List - Dunas style */}
            <ul className="mt-8 space-y-3">
              {features.map((feature, idx) => (
                <li className="flex items-start gap-3" key={idx}>
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <HugeiconsIcon
                      className="h-3 w-3 text-white"
                      icon={Tick01Icon}
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-neutral-700 dark:text-rausch-200">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Illustration/Diagram */}
          <motion.div className={reversed ? "lg:order-1" : "lg:order-2"} variants={fadeIn}>
            {illustration}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

// Dunas-style flow diagram component
type FlowDiagramProps = {
  items: Array<{
    icon: HugeIcon;
    label: string;
    sublabel?: string;
  }>;
};

export function FlowDiagram({ items }: FlowDiagramProps) {
  return (
    <div className="relative rounded-2xl border border-neutral-200 dark:border-rausch-800 bg-neutral-50 dark:bg-rausch-900 p-8">
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-4 rounded-xl border border-neutral-200 dark:border-rausch-800 bg-white dark:bg-rausch-950 px-5 py-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-rausch-800">
                <HugeiconsIcon className="h-5 w-5 text-neutral-600 dark:text-rausch-300" icon={item.icon} />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{item.label}</p>
                {item.sublabel && <p className="text-neutral-500 dark:text-rausch-400 text-sm">{item.sublabel}</p>}
              </div>
            </div>
            {idx < items.length - 1 && <div className="ml-9 h-4 w-0.5 bg-neutral-200 dark:bg-rausch-700" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// Dunas-style settings card component
type SettingsCardProps = {
  leftItems: Array<{ label: string; value: string }>;
  rightItems: Array<{ label: string; hasCheck?: boolean }>;
  leftTitle?: string;
  rightTitle?: string;
};

export function SettingsCard({
  leftItems,
  rightItems,
  leftTitle = "Settings",
  rightTitle = "Information",
}: SettingsCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-rausch-800 bg-white dark:bg-rausch-950 shadow-sm">
      <div className="grid md:grid-cols-2">
        {/* Left Column - Settings */}
        <div className="border-neutral-200 dark:border-rausch-800 p-6 md:border-r">
          <h4 className="mb-4 font-medium text-neutral-900 dark:text-white">{leftTitle}</h4>
          <div className="space-y-3">
            {leftItems.map((item, idx) => (
              <div className="flex items-center justify-between" key={idx}>
                <span className="text-neutral-500 dark:text-rausch-400 text-sm">{item.label}</span>
                <span className="font-medium text-neutral-900 dark:text-white text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Information */}
        <div className="bg-neutral-50 dark:bg-rausch-900 p-6">
          <h4 className="mb-4 font-medium text-neutral-900 dark:text-white">{rightTitle}</h4>
          <div className="space-y-3">
            {rightItems.map((item, idx) => (
              <div className="flex items-center justify-between" key={idx}>
                <span className="text-neutral-600 dark:text-rausch-300 text-sm">{item.label}</span>
                {item.hasCheck && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <HugeiconsIcon
                      className="h-3 w-3 text-white"
                      icon={Tick01Icon}
                      strokeWidth={3}
                    />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
