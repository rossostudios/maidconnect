"use client";

import { SparklesIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, type Variants } from "motion/react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

interface ServiceOptionsSectionClientProps {
  title: string;
  subtitle: string;
  instantBook: {
    title: string;
    description: string;
    speed: string;
    process: string;
    cost: string;
    features: string[];
    cta: string;
  };
  concierge: {
    title: string;
    description: string;
    speed: string;
    process: string;
    cost: string;
    features: string[];
    cta: string;
  };
}

export function ServiceOptionsSectionClient({
  title,
  subtitle,
  instantBook,
  concierge,
}: ServiceOptionsSectionClientProps) {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-32">
      <Container className="max-w-7xl">
        <motion.div animate="visible" initial="hidden" variants={stagger}>
          {/* Section Header */}
          <motion.div className="mb-12 text-center" variants={fadeIn}>
            <h2 className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-neutral-600">{subtitle}</p>
          </motion.div>

          {/* Two Service Options */}
          <motion.div className="grid grid-cols-1 gap-8 lg:grid-cols-2" variants={stagger}>
            {/* Instant Book Option (Amara/Marketplace) */}
            <motion.div
              className="flex flex-col rounded-lg border-2 border-orange-200 bg-white p-8 shadow-lg"
              variants={fadeIn}
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-orange-100">
                <HugeiconsIcon className="h-8 w-8 text-orange-600" icon={SparklesIcon} />
              </div>

              {/* Title */}
              <h3 className="mb-2 font-bold text-2xl text-neutral-900">{instantBook.title}</h3>
              <p className="mb-6 text-neutral-700">{instantBook.description}</p>

              {/* Details Grid */}
              <div className="mb-6 space-y-3">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide">
                    Speed
                  </p>
                  <p className="mt-1 text-neutral-900">{instantBook.speed}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide">
                    Process
                  </p>
                  <p className="mt-1 text-neutral-900">{instantBook.process}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide">
                    Cost
                  </p>
                  <p className="mt-1 text-neutral-900">{instantBook.cost}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6 flex-1 space-y-2">
                {instantBook.features.map((feature, idx) => (
                  <div className="flex items-start gap-2" key={idx}>
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                    <span className="text-neutral-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition-all hover:bg-orange-700"
                href="/professionals"
              >
                {instantBook.cta}
              </Link>
            </motion.div>

            {/* Concierge Option (Direct Hire) */}
            <motion.div
              className="flex flex-col rounded-lg border-2 border-blue-200 bg-white p-8 shadow-lg"
              variants={fadeIn}
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                <HugeiconsIcon className="h-8 w-8 text-blue-600" icon={UserMultiple02Icon} />
              </div>

              {/* Title */}
              <h3 className="mb-2 font-bold text-2xl text-neutral-900">{concierge.title}</h3>
              <p className="mb-6 text-neutral-700">{concierge.description}</p>

              {/* Details Grid */}
              <div className="mb-6 space-y-3">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide">
                    Speed
                  </p>
                  <p className="mt-1 text-neutral-900">{concierge.speed}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide">
                    Process
                  </p>
                  <p className="mt-1 text-neutral-900">{concierge.process}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <p className="font-semibold text-neutral-700 text-xs uppercase tracking-wide">
                    Cost
                  </p>
                  <p className="mt-1 text-neutral-900">{concierge.cost}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6 flex-1 space-y-2">
                {concierge.features.map((feature, idx) => (
                  <div className="flex items-start gap-2" key={idx}>
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span className="text-neutral-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
                href="/concierge"
              >
                {concierge.cta}
              </Link>
            </motion.div>
          </motion.div>

          {/* Help Text */}
          <motion.p
            className="mt-8 text-center text-neutral-600 text-sm"
            variants={fadeIn}
          >
            Not sure which path is right for you?{" "}
            <Link className="text-orange-600 hover:text-orange-700" href="/contact">
              Contact our team
            </Link>{" "}
            and we'll help you decide.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
