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
    <section className="bg-white py-12 md:py-24">
      <Container className="max-w-7xl">
        <motion.div animate="visible" initial="hidden" variants={stagger}>
          {/* Section Header */}
          <motion.div className="mb-16 text-center" variants={fadeIn}>
            <h2 className="font-bold text-4xl text-neutral-900 tracking-tight md:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-neutral-600">{subtitle}</p>
          </motion.div>

          {/* Two Service Options */}
          <motion.div className="grid grid-cols-1 gap-8 lg:grid-cols-2" variants={stagger}>
            {/* Instant Book Option (Amara/Marketplace) */}
            <motion.div
              className="flex flex-col rounded-2xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-900/5 transition-all hover:shadow-2xl hover:shadow-orange-900/10"
              variants={fadeIn}
            >
              {/* Icon */}
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <HugeiconsIcon className="h-8 w-8" icon={SparklesIcon} />
              </div>

              {/* Title */}
              <h3 className="mb-3 font-bold text-2xl text-neutral-900">{instantBook.title}</h3>
              <p className="mb-8 text-neutral-600 leading-relaxed">{instantBook.description}</p>

              {/* Details Grid */}
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-neutral-50 p-4">
                  <p className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Speed
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">{instantBook.speed}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-4">
                  <p className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Process
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">{instantBook.process}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-4">
                  <p className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Cost
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">{instantBook.cost}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8 flex-1 space-y-3">
                {instantBook.features.map((feature, idx) => (
                  <div className="flex items-start gap-3" key={idx}>
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                className="inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-6 py-4 font-semibold text-white transition-all hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-600/20"
                href="/professionals"
              >
                {instantBook.cta}
              </Link>
            </motion.div>

            {/* Concierge Option (Direct Hire) */}
            <motion.div
              className="flex flex-col rounded-2xl border border-blue-100 bg-white p-8 shadow-xl shadow-blue-900/5 transition-all hover:shadow-2xl hover:shadow-blue-900/10"
              variants={fadeIn}
            >
              {/* Icon */}
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <HugeiconsIcon className="h-8 w-8" icon={UserMultiple02Icon} />
              </div>

              {/* Title */}
              <h3 className="mb-3 font-bold text-2xl text-neutral-900">{concierge.title}</h3>
              <p className="mb-8 text-neutral-600 leading-relaxed">{concierge.description}</p>

              {/* Details Grid */}
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-neutral-50 p-4">
                  <p className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Speed
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">{concierge.speed}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-4">
                  <p className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Process
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">{concierge.process}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 p-4">
                  <p className="font-semibold text-neutral-500 text-xs uppercase tracking-wider">
                    Cost
                  </p>
                  <p className="mt-1 font-medium text-neutral-900">{concierge.cost}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8 flex-1 space-y-3">
                {concierge.features.map((feature, idx) => (
                  <div className="flex items-start gap-3" key={idx}>
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                href="/concierge"
              >
                {concierge.cta}
              </Link>
            </motion.div>
          </motion.div>

          {/* Help Text */}
          <motion.p
            className="mt-12 text-center text-neutral-600 text-sm"
            variants={fadeIn}
          >
            Not sure which path is right for you?{" "}
            <Link className="font-medium text-orange-600 hover:text-orange-700" href="/contact">
              Contact our team
            </Link>{" "}
            and we'll help you decide.
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
