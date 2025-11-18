"use client";

import {
  Clock01Icon,
  DollarCircleIcon,
  Message01Icon,
  RepeatIcon,
  Shield01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";

const benefits = [
  {
    icon: DollarCircleIcon,
    title: "Set Your Own Rates",
    description:
      "You determine your hourly rate. Families see your rate plus a clearly-labeled Casaora platform fee — you keep 100% of what you charge.",
  },
  {
    icon: Clock01Icon,
    title: "Guaranteed Payment",
    description:
      "Secure payment processing ensures you're paid on time, every time. No chasing clients for payment.",
  },
  {
    icon: UserMultiple02Icon,
    title: "Quality Clients",
    description:
      "Connect with verified, respectful expat families who value professional domestic staff and pay fairly.",
  },
  {
    icon: RepeatIcon,
    title: "Long-Term Relationships",
    description:
      "Build steady income through repeat bookings with families who appreciate your work.",
  },
  {
    icon: Message01Icon,
    title: "No English? No Problem.",
    description:
      "Our platform translates messages automatically. You focus on your work; Amara handles the communication with high-paying expat families.",
  },
  {
    icon: Shield01Icon,
    title: "Safety First",
    description:
      "We verify every family just like we verify you. Zero tolerance for disrespect. If a client is rude or unsafe, we block them.",
  },
];

export function ProsBenefitsSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <section className="py-20 lg:py-28">
      <Container className="max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          variants={fadeInUp}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
            Why professionals choose Casaora
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-700">
            We've built a platform that puts you first — fair pay, quality clients, and support when
            you need it.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                className="flex flex-col items-start gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                key={benefit.title}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                >
                  <HugeiconsIcon className="h-6 w-6 text-orange-600" icon={Icon} />
                </motion.div>

                <div>
                  <h3 className="mb-2 font-semibold text-lg text-neutral-900">{benefit.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
