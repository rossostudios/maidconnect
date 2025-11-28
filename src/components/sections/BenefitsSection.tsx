"use client";

import {
  Add01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Shield01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EscrowVaultCard, InstantMatchCalendar, VettingCard } from "@/components/marketing";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

// ============================================================================
// VISUAL COMPONENTS - Coded illustrations for bento cards
// ============================================================================

function VerifiedProfileVisual({
  isExpanded,
  setIsExpanded,
  t,
}: {
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      {/* Vetting Process Flow - Shows the 5-point verification (CSS-first, zero-bloat) */}
      <div className="flex justify-center py-4">
        <VettingCard autoPlayInterval={2500} className="w-full max-w-sm" />
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && setIsExpanded && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl"
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-all hover:bg-muted/80"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Cancel01Icon} />
              </button>

              {/* Large cover image */}
              <div className="relative h-48 w-full">
                <Image
                  alt="Professional profile"
                  className="object-cover"
                  fill
                  src="/guatape.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="-top-12 absolute left-6">
                  <div className="relative">
                    <div className="aspect-square h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-muted shadow-xl">
                      <Image
                        alt="María Camila"
                        className="h-full w-full object-cover"
                        fill
                        src="/mariacamila.png"
                      />
                    </div>
                    <div className="-right-1 -bottom-1 absolute flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-2 ring-white">
                      <HugeiconsIcon className="h-5 w-5 text-white" icon={CheckmarkCircle02Icon} />
                    </div>
                  </div>
                </div>

                <div className="pt-16">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-2xl text-foreground">
                      {t("visuals.profileCard.mainName")}
                    </h3>
                    <span className="rounded-full bg-rausch-100 px-3 py-1 font-semibold text-rausch-700 text-sm dark:bg-rausch-500/20 dark:text-rausch-400">
                      {t("visuals.profileCard.proBadge")}
                    </span>
                  </div>
                  <p className="mt-1 text-lg text-muted-foreground">
                    {t("visuals.profileCard.mainSpecialty")}
                  </p>

                  {/* Rating */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <HugeiconsIcon
                          className="h-5 w-5 fill-amber-400 text-amber-400"
                          icon={StarIcon}
                          key={star}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-foreground text-lg">4.9</span>
                    <span className="text-muted-foreground">
                      {t("visuals.profileCard.reviewCount")}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {t("visuals.profileCard.bio")}
                  </p>

                  {/* Verification badges */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 font-medium text-green-700 text-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
                      <HugeiconsIcon className="h-4 w-4" icon={Shield01Icon} />
                      {t("visuals.profileCard.idVerified")}
                    </span>
                    <span className="flex items-center gap-2 rounded-full border border-babu-200 bg-babu-50 px-4 py-2 font-medium text-babu-700 text-sm dark:border-babu-500/30 dark:bg-babu-500/10 dark:text-babu-400">
                      <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle02Icon} />
                      {t("visuals.profileCard.backgroundCheck")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ReviewsVisual({
  isExpanded,
  setIsExpanded,
  t,
}: {
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 py-4">
        {/* Stacked Testimonial Cards Container - Larger size */}
        <div className="relative pr-8 pb-8">
          {/* Background testimonial card (offset) */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            className="absolute top-5 right-0 bottom-0 left-5 z-0 overflow-hidden rounded-2xl bg-stone-900 shadow-lg dark:bg-rausch-950/90"
            transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="p-5 opacity-60">
              <div className="mb-3 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HugeiconsIcon
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    icon={StarIcon}
                    key={star}
                  />
                ))}
              </div>
              <p className="line-clamp-2 text-sm text-stone-400 leading-relaxed">
                {t("visuals.reviews.backgroundReview")}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-stone-800/60 px-5 py-3 dark:bg-rausch-900/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-babu-400 to-babu-600">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span className="text-sm text-stone-400 dark:text-rausch-300">
                {t("visuals.reviews.backgroundName")}
              </span>
            </div>
          </motion.div>

          {/* Featured testimonial card - Tilted - Larger size, dark theme for consistency */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            className="relative z-10 origin-bottom-left rotate-1 overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 shadow-xl dark:from-rausch-950/90 dark:via-rausch-950 dark:to-stone-950"
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            {/* Quote */}
            <div className="p-5">
              <div className="mb-4 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HugeiconsIcon
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                    icon={StarIcon}
                    key={star}
                  />
                ))}
              </div>
              <p className="text-base text-stone-300 leading-relaxed dark:text-rausch-200">
                {t("visuals.reviews.featuredReview")}
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 border-stone-800/60 border-t bg-stone-800/40 px-5 py-4 dark:border-rausch-800/40 dark:bg-rausch-900/40">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  alt={t("visuals.reviews.featuredName")}
                  className="object-cover"
                  fill
                  src="/review-brooke.png"
                />
              </div>
              <div>
                <p className="font-semibold text-sm text-stone-100 dark:text-rausch-100">
                  {t("visuals.reviews.featuredName")}
                </p>
                <p className="text-stone-400 text-xs dark:text-rausch-300">
                  {t("visuals.reviews.verifiedCustomer")}
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-950/50 dark:bg-green-900/50"
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <HugeiconsIcon
                  className="h-3.5 w-3.5 text-green-400"
                  icon={CheckmarkCircle02Icon}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && setIsExpanded && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-2xl"
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-all hover:bg-muted/80"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Cancel01Icon} />
              </button>

              {/* Content */}
              <div className="flex gap-6 p-6">
                {/* Avatar */}
                <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    alt={t("visuals.reviews.featuredName")}
                    className="object-cover"
                    fill
                    src="/review-brooke.png"
                  />
                </div>

                <div className="flex-1">
                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HugeiconsIcon
                        className="h-6 w-6 fill-amber-400 text-amber-400"
                        icon={StarIcon}
                        key={star}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t("visuals.reviews.featuredReview")}
                  </p>

                  {/* Author info */}
                  <div className="mt-6 flex items-center gap-3">
                    <div>
                      <p className="font-bold text-foreground text-xl">
                        {t("visuals.reviews.featuredName")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("visuals.reviews.verifiedCustomer")}
                      </p>
                    </div>
                    <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                      <HugeiconsIcon
                        className="h-5 w-5 text-green-600 dark:text-green-400"
                        icon={CheckmarkCircle02Icon}
                      />
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="mt-4 flex gap-4 border-border border-t pt-4 text-muted-foreground text-sm">
                    <span>{t("visuals.reviews.hiredFor")}</span>
                    <span>•</span>
                    <span>{t("visuals.reviews.location")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// BENTO CARD DATA
// ============================================================================

type BentoCard = {
  id: string;
  title: string;
  description: string;
  visual:
    | React.ReactNode
    | ((props: { isExpanded: boolean; setIsExpanded: (v: boolean) => void }) => React.ReactNode);
  span: string;
  gradient?: string;
  expandable?: boolean;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export function BenefitsSection() {
  const t = useTranslations("features");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const bentoCards: BentoCard[] = [
    {
      id: "verified",
      title: t("verifiedProfessionals.title"),
      description: t("verifiedProfessionals.description"),
      visual: ({ isExpanded, setIsExpanded }) => (
        <VerifiedProfileVisual isExpanded={isExpanded} setIsExpanded={setIsExpanded} t={t} />
      ),
      span: "md:col-span-2 md:row-span-2 lg:col-span-3",
      gradient: "from-rausch-50/80 via-white to-amber-50/40",
      expandable: true,
    },
    {
      id: "payments",
      title: t("securePayments.title"),
      description: t("securePayments.description"),
      visual: <EscrowVaultCard amount={35} className="mx-auto" currency="USD" />,
      span: "md:col-span-2 lg:col-span-3",
      gradient: "from-rausch-50/60 via-white to-amber-50/40",
    },
    {
      id: "reviews",
      title: t("reviewSystem.title"),
      description: t("reviewSystem.description"),
      visual: ({ isExpanded, setIsExpanded }) => (
        <ReviewsVisual isExpanded={isExpanded} setIsExpanded={setIsExpanded} t={t} />
      ),
      span: "md:col-span-2 md:row-span-2 lg:col-span-3",
      gradient: "from-amber-50/60 via-white to-rausch-50/40",
      expandable: true,
    },
    {
      id: "booking",
      title: t("realTimeBooking.title"),
      description: t("realTimeBooking.description"),
      visual: <InstantMatchCalendar className="mx-auto w-full max-w-sm" />,
      span: "md:col-span-2 lg:col-span-3",
      gradient: "from-amber-50/60 via-white to-rausch-50/40",
    },
  ];

  return (
    <section className="bg-muted py-16 md:py-24" id="benefits">
      <Container className="max-w-6xl px-4 md:px-8">
        {/* Section header */}
        <div className="mb-12 text-center md:mb-16">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-rausch-100 px-4 py-1.5 dark:bg-rausch-500/20"
            initial={{ opacity: 0, y: 10 }}
          >
            <span className="h-2 w-2 rounded-full bg-rausch-500" />
            <span className="font-medium text-rausch-700 text-sm dark:text-rausch-400">
              {t("tag")}
            </span>
          </motion.div>

          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl font-semibold text-3xl text-foreground leading-tight md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            {t("title")}
          </motion.h2>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Bento grid */}
        <motion.div
          animate="visible"
          className="grid gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-6"
          initial="hidden"
          variants={containerVariants}
        >
          {bentoCards.map((card) => {
            const isExpanded = expandedCard === card.id;
            const setIsExpanded = (value: boolean) => setExpandedCard(value ? card.id : null);

            return (
              <motion.div
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg",
                  card.span,
                  card.gradient &&
                    `bg-gradient-to-br ${card.gradient} dark:from-card dark:via-card dark:to-card`
                )}
                key={card.id}
                variants={cardVariants}
              >
                <div className="flex h-full flex-col p-5 md:p-6">
                  {/* Visual component */}
                  <div className="mb-4 flex-1">
                    {typeof card.visual === "function"
                      ? card.visual({ isExpanded, setIsExpanded })
                      : card.visual}
                  </div>

                  {/* Text content */}
                  <div>
                    <h3 className="font-semibold text-foreground text-lg md:text-xl">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed md:text-base">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Plus button - positioned at right side of container */}
                {card.expandable && (
                  <button
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md transition-all hover:scale-110 hover:bg-muted"
                    onClick={() => setIsExpanded(true)}
                    type="button"
                  >
                    <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={Add01Icon} />
                  </button>
                )}

                {/* Hover gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/0 via-transparent to-card/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
