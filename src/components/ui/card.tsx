/**
 * Card Component
 *
 * Flexible, animated card component with hover effects.
 * Supports motion animations and maintains accessibility.
 */

"use client";

import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { cardHover } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "elevated" | "outlined" | "glass";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
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
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-card)]",
  elevated:
    "bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-elevated)]",
  outlined: "bg-[var(--background)] border-2 border-[var(--border)] shadow-none",
  glass:
    "bg-[var(--surface)]/70 border border-[var(--border-subtle)]/50 shadow-[var(--shadow-subtle)] backdrop-blur-lg",
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
}: CardProps & { ref?: RefObject<ElementRef<"div"> | null> }) => {
  const baseStyles =
    "rounded-xl overflow-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

  const classes = cn(
    baseStyles,
    variantStyles[variant],
    (hoverable || href || asButton) && "cursor-pointer",
    className
  );

  const motionProps =
    hoverable && !disableMotion
      ? {
          initial: "rest",
          whileHover: "hover",
          variants: cardHover,
        }
      : {};

  // Render as link
  if (href) {
    return (
      <motion.a
        className={classes}
        href={href}
        ref={ref as any}
        {...motionProps}
        {...(props as any)}
      >
        {children}
      </motion.a>
    );
  }

  // Render as button
  if (asButton) {
    return (
      <motion.button className={classes} ref={ref as any} type="button" {...motionProps} {...props}>
        {children}
      </motion.button>
    );
  }

  // Render as div
  return disableMotion ? (
    <div className={classes} ref={ref} {...props}>
      {children}
    </div>
  ) : (
    <motion.div className={classes} ref={ref} {...motionProps} {...props}>
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
}: ComponentPropsWithoutRef<"div"> & { ref?: RefObject<ElementRef<"div"> | null> }) => (
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
}: ComponentPropsWithoutRef<"div"> & { ref?: RefObject<ElementRef<"div"> | null> }) => (
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
}: ComponentPropsWithoutRef<"div"> & { ref?: RefObject<ElementRef<"div"> | null> }) => (
  <div
    className={cn("border-[var(--border-subtle)] border-t p-6 pt-4", className)}
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
  ref?: RefObject<ElementRef<"div"> | null>;
}) => (
  <div
    className={cn("relative overflow-hidden", className)}
    ref={ref}
    style={{ aspectRatio }}
    {...props}
  />
);

CardImage.displayName = "CardImage";
