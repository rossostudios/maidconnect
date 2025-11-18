/**
 * Card Component
 *
 * Flexible card component with hover effects and neutral colors.
 * Maintains accessibility.
 */

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "overflow-hidden rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10",
        elevated: "bg-white shadow-md ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10",
        outlined: "bg-white shadow-none ring-1 ring-black/8 dark:bg-neutral-900 dark:ring-white/12",
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
};

interface CardProps
  extends BaseCardProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof BaseCardProps> {}

/**
 * Card - Flexible container
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
  className,
  children,
  ...props
}: CardProps) => {
  const classes = cn(
    cardVariants({ variant }),
    (hoverable || href || asButton) && "cursor-pointer hover:shadow-lg",
    className
  );

  // Render as link
  if (href) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }

  // Render as button
  if (asButton) {
    return (
      <button className={classes} type="button">
        {children}
      </button>
    );
  }

  // Render as div
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Card.displayName = "Card";

/**
 * CardHeader - Card header section
 */
export const CardHeader = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("p-6 pb-4", className)} {...props} />
);

CardHeader.displayName = "CardHeader";

/**
 * CardContent - Card main content section
 */
export const CardContent = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

CardContent.displayName = "CardContent";

/**
 * CardFooter - Card footer section
 */
export const CardFooter = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn("border-black/5 border-t p-6 pt-4 dark:border-white/10", className)}
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
  ...props
}: ComponentPropsWithoutRef<"div"> & { aspectRatio?: string }) => (
  <div className={cn("relative overflow-hidden", className)} style={{ aspectRatio }} {...props} />
);

CardImage.displayName = "CardImage";

export { cardVariants };
