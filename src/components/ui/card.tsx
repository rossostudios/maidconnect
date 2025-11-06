/**
 * Card Component
 *
 * Flexible, animated card component with hover effects.
 * Supports motion animations and maintains accessibility.
 */

"use client";

import { motion } from "motion/react";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { cardHover } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "elevated" | "outlined" | "glass";

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

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white border border-stone-200 shadow-md",
  elevated: "bg-white border border-gray-200 shadow-lg",
  outlined: "bg-stone-50 border-2 border-stone-200 shadow-none",
  glass: "bg-white/70 border border-gray-200/50 shadow-sm backdrop-blur-lg",
};

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
 *
 * @example
 * ```tsx
 * <Card href="/details" hoverable>
 *   Clickable card
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
}: CardProps & { ref?: Ref<HTMLDivElement> }) => {
  const baseStyles =
    "rounded-xl overflow-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600";

  const classes = cn(
    baseStyles,
    variantStyles[variant],
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
}: ComponentPropsWithoutRef<"div"> & { ref?: Ref<HTMLDivElement> }) => (
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
}: ComponentPropsWithoutRef<"div"> & { ref?: Ref<HTMLDivElement> }) => (
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
}: ComponentPropsWithoutRef<"div"> & { ref?: Ref<HTMLDivElement> }) => (
  <div className={cn("border-gray-200 border-t p-6 pt-4", className)} ref={ref} {...props} />
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
  ref?: Ref<HTMLDivElement>;
}) => (
  <div
    className={cn("relative overflow-hidden", className)}
    ref={ref}
    style={{ aspectRatio }}
    {...props}
  />
);

CardImage.displayName = "CardImage";
