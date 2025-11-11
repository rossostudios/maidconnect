/**
 * Card Component
 *
 * Flexible, animated card component with hover effects and neutral colors.
 * Supports motion animations and maintains accessibility.
 */

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import type { ComponentPropsWithoutRef, Ref } from "react";
import * as React from "react";
import { cardHover } from "@/lib/motion";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "overflow-hidden rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10",
        elevated: "bg-white shadow-md ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10",
        outlined: "bg-white shadow-none ring-1 ring-black/8 dark:bg-neutral-900 dark:ring-white/12",
        glass:
          "bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur-lg dark:bg-neutral-900/70 dark:ring-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type CardVariant = VariantProps<typeof cardVariants>["variant"];

type BaseCardProps = {
  /**
   * Visual variant
   * @default "default"
   */
  variant?: CardVariant;
  /**
   * Enable hover lift effect
   * @default false
   */
  hoverable?: boolean;
  /**
   * Clickable card (renders as button)
   * @default false
   */
  asButton?: boolean;
  /**
   * Link href (renders as anchor)
   */
  href?: string;
  /**
   * Disable motion animations
   * @default false
   */
  disableMotion?: boolean;
};

interface CardProps
  extends BaseCardProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof BaseCardProps> {}

/**
 * Card - Flexible container with optional animations
 *
 * @example
 * ```tsx
 * <Card variant="elevated" hoverable>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardContent>
 *     Card content here
 *   </CardContent>
 * </Card>
 * ```
 */
export const Card = ({
  variant = "default",
  hoverable = false,
  asButton = false,
  href,
  disableMotion = false,
  className,
  children,
  ref,
  ...props
}: CardProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const classes = cn(
    cardVariants({ variant }),
    (hoverable || href || asButton) && "cursor-pointer",
    className
  );

  const motionVariants =
    hoverable && !disableMotion
      ? {
          initial: "rest" as const,
          whileHover: "hover" as const,
          variants: cardHover,
          style: { willChange: "transform" }, // Performance optimization
        }
      : {};

  // Render as link
  if (href) {
    return (
      <motion.a
        className={classes}
        href={href}
        ref={ref as Ref<HTMLAnchorElement>}
        {...motionVariants}
      >
        {children}
      </motion.a>
    );
  }

  // Render as button
  if (asButton) {
    return (
      <motion.button
        className={classes}
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        {...motionVariants}
      >
        {children}
      </motion.button>
    );
  }

  // Render as div (non-animated)
  if (disableMotion) {
    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }

  // Render as animated div (motion props only, no spreading to avoid conflicts)
  return (
    <motion.div className={classes} ref={ref} {...motionVariants}>
      {children}
    </motion.div>
  );
};

Card.displayName = "Card";

/**
 * CardHeader - Card header section
 */
export const CardHeader = ({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div className={cn("p-6 pb-4", className)} ref={ref} {...props} />
);

CardHeader.displayName = "CardHeader";

/**
 * CardContent - Card main content section
 */
export const CardContent = ({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div className={cn("p-6 pt-0", className)} ref={ref} {...props} />
);

CardContent.displayName = "CardContent";

/**
 * CardFooter - Card footer section
 */
export const CardFooter = ({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<"div"> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    className={cn("border-black/5 border-t p-6 pt-4 dark:border-white/10", className)}
    ref={ref}
    {...props}
  />
);

CardFooter.displayName = "CardFooter";

/**
 * CardImage - Card image section
 */
export const CardImage = ({
  aspectRatio = "16/9",
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<"div"> & { aspectRatio?: string } & {
  ref?: React.RefObject<HTMLDivElement | null>;
}) => (
  <div
    className={cn("relative overflow-hidden", className)}
    ref={ref}
    style={{ aspectRatio }}
    {...props}
  />
);

CardImage.displayName = "CardImage";

export { cardVariants };
