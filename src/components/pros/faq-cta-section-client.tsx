"use client";

import { ArrowRight01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/routing";

const faqs = [
  {
    question: "How much can I earn on Casaora?",
    answer:
      "You set your own hourly rate and choose how many hours you want to work. There are no fees to join or list your services — families pay a clearly-labeled Casaora platform fee on top of your rate.",
  },
  {
    question: "How do I get paid?",
    answer:
      "After completing a booking, payment is processed securely through our platform and transferred to your bank account or preferred payment method within 2-3 business days.",
  },
  {
    question: "Do I need to speak English?",
    answer:
      "Not required, but helpful! Many of our families are English-speaking expats. We provide bilingual support to help you communicate with clients who don't speak Spanish.",
  },
  {
    question: "What if a family cancels a booking?",
    answer:
      "Our cancellation policy protects you. If a family cancels with less than 24 hours notice, you'll receive 50% of the booking fee. Last-minute cancellations (less than 4 hours) result in full payment.",
  },
  {
    question: "Is there a contract or commitment?",
    answer:
      "No long-term contract required. You control your schedule and can accept or decline booking requests as you wish. You're free to leave the platform at any time.",
  },
  {
    question: "What services can I offer?",
    answer:
      "You can offer housekeeping, childcare, eldercare, cooking, laundry, pet care, estate management, or specialized services. Simply specify what you offer in your profile.",
  },
];

export function ProsFaqCtaSection() {
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
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      {/* FAQ Section */}
      <section className="py-20 lg:py-28">
        <Container className="max-w-4xl">
          <motion.div
            className="mb-16 text-center"
            initial="hidden"
            variants={fadeInUp}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <h2 className="mb-4 font-bold text-4xl text-neutral-900 sm:text-5xl">
              Frequently asked questions
            </h2>
            <p className="text-lg text-neutral-700">
              Everything you need to know about joining Casaora
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            {faqs.map((faq) => (
              <motion.div
                className="border border-neutral-200 bg-white p-6 shadow-sm"
                key={faq.question}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                variants={fadeInUp}
                whileHover={{ scale: 1.01, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
              >
                <h3 className="mb-3 font-semibold text-lg text-neutral-900">{faq.question}</h3>
                <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 py-20 text-white lg:py-28"
        id="apply"
      >
        <Container className="relative max-w-4xl text-center">
          <motion.div
            initial="hidden"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            whileInView="visible"
          >
            <motion.h2
              className="mb-6 font-bold text-4xl leading-tight sm:text-5xl"
              variants={fadeInUp}
            >
              Ready to grow your income with quality families?
            </motion.h2>
            <motion.p className="mb-8 text-orange-50 text-xl" variants={fadeInUp}>
              Join a growing network of trusted professionals on Casaora. Apply today — it's free
              and takes just 10 minutes.
            </motion.p>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
              variants={fadeInUp}
            >
              <Link href="/auth/sign-up?type=professional">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="min-w-[250px] border-white bg-white text-orange-600 hover:bg-neutral-50"
                    size="lg"
                    variant="outline"
                  >
                    Create Professional Account
                    <HugeiconsIcon className="ml-2 h-5 w-5" icon={ArrowRight01Icon} />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="min-w-[200px] border border-white bg-transparent text-white hover:bg-white/10"
                    size="lg"
                    variant="ghost"
                  >
                    Contact Us
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-4 text-orange-100 text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
                <span>Start earning in 48 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
                <span>Bilingual support team</span>
              </div>
            </motion.div>
          </motion.div>
        </Container>

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 bg-white opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 bg-orange-900 opacity-20 blur-3xl" />
      </section>
    </>
  );
}
