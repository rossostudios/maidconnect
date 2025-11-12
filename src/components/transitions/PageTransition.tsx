"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { usePathname } from "next/navigation";

type PageTransitionProps = {
  children: React.ReactNode;
};

// Optimized variants with spring physics for more natural motion
const pageVariants: Variants = {
  initial: {
    y: "100%",
    zIndex: 100,
  },
  animate: {
    y: 0,
    zIndex: 100,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
  },
  exit: {
    y: "-100%",
    zIndex: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 25,
    },
  },
};

const overlayVariants: Variants = {
  initial: {
    opacity: 0.2,
  },
  animate: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  // Check if this is a marketing page (not dashboard or admin)
  const isMarketingPage = !(pathname.includes("/dashboard") || pathname.includes("/admin"));

  // Don't apply transition to app pages
  if (!isMarketingPage) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        animate="animate"
        exit="exit"
        initial="initial"
        key={pathname}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100vh",
          overflow: "auto",
          backgroundColor: "white",
          willChange: "transform", // Performance optimization
        }}
        variants={pageVariants}
      >
        {children}

        {/* Black overlay during transition */}
        <motion.div
          animate="animate"
          initial="initial"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            pointerEvents: "none",
            willChange: "opacity", // Performance optimization
          }}
          variants={overlayVariants}
        />
      </motion.div>
    </AnimatePresence>
  );
}
