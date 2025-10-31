"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

type PageTransitionProps = {
  children: React.ReactNode;
};

const pageVariants = {
  initial: {
    y: "100%",
    zIndex: 100,
  },
  animate: {
    y: 0,
    zIndex: 100,
  },
  exit: {
    y: "-100%",
    zIndex: 1,
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
    <AnimatePresence initial={false}>
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
        }}
        transition={{
          duration: 1.0,
          ease: [0.25, 0.1, 0.25, 1], // Custom smooth easing curve
        }}
        variants={pageVariants}
      >
        {children}

        {/* Black overlay during transition */}
        <motion.div
          animate={{ opacity: 0 }}
          initial={{ opacity: 0.2 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            pointerEvents: "none",
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
