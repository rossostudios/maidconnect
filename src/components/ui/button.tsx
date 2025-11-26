"use client";

/**
 * Button Component (React Aria with Custom Slot)
 *
 * Accessible button component with variant styling and composition support.
 * Migrated from Radix UI Slot to custom Slot implementation while maintaining
 * full backward compatibility.
 *
 * Week 4: Component Libraries Consolidation - Task 3
 *
 * @example
 * ```tsx
 * // Primary button (default)
 * <Button>Click me</Button>
 *
 * // Outline variant
 * <Button variant="outline">Secondary Action</Button>
 *
 * // As child (compose with Link)
 * <Button asChild>
 *   <Link href="/about">Go to About</Link>
 * </Button>
 *
 * // Size variants
 * <Button size="sm">Small</Button>
 * <Button size="lg">Large</Button>
 * ```
 */

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Button Variants Configuration
 *
 * Uses class-variance-authority for type-safe variant management.
 * Lia Design System: rounded-lg, orange primary, warm neutrals.
 */
const buttonVariants = cva(
  // Base styles - applied to all buttons
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Orange primary CTA button (default)
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-rausch-600 active:scale-[0.98] active:bg-rausch-700",
        // Destructive actions (rausch-700)
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-rausch-800 active:scale-[0.98]",
        // Outline with orange accent on hover
        outline:
          "border-2 border-neutral-200 bg-background shadow-sm hover:border-rausch-500 hover:bg-rausch-50 hover:text-rausch-600 active:scale-[0.98] dark:border-border dark:hover:border-rausch-400 dark:hover:bg-rausch-900/30 dark:hover:text-rausch-300",
        // Neutral secondary button
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-neutral-300 active:scale-[0.98]",
        // Ghost with orange accent on hover
        ghost:
          "hover:bg-rausch-50 hover:text-rausch-600 active:scale-[0.98] dark:hover:bg-rausch-900/30 dark:hover:text-rausch-300",
        // Link with orange accent (Lia guideline: rausch-600 for better WCAG contrast)
        link: "text-rausch-600 hover:text-rausch-700",
      },
      size: {
        default: "h-10 px-8 py-2",
        sm: "h-9 px-6 text-sm",
        lg: "h-11 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Slot Props
 */
interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactElement;
  ref?: React.RefObject<HTMLElement | null>;
}

/**
 * Custom Slot Component
 *
 * Replaces Radix UI Slot. Merges props with the child element.
 * Allows composition with other components (e.g., Next.js Link).
 *
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
const Slot = ({ children, ref, ...props }: SlotProps) => {
  // Clone the child element and merge props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      // Merge className
      className: cn(props.className, children.props.className),
      // Merge refs
      ref,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return children;
};

/**
 * Button Props
 *
 * Extends React Aria Button props with variant configuration.
 * React 19: ref is a regular prop, no forwardRef needed.
 * Backward compatible with HTML button props (disabled).
 */
export interface ButtonProps
  extends Omit<AriaButtonProps, "className" | "isDisabled">,
    VariantProps<typeof buttonVariants> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Render as child element (composition mode)
   * When true, the button will merge its props with its child component
   */
  asChild?: boolean;
  /**
   * Ref to the button element (React 19 regular prop)
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
  /**
   * Whether the button is disabled (HTML compatibility)
   * @deprecated Use isDisabled instead
   */
  disabled?: boolean;
  /**
   * Whether the button is disabled (React Aria native)
   */
  isDisabled?: boolean;
}

/**
 * Button Component
 *
 * Primary interactive component with accessible focus states,
 * keyboard navigation, and Lia Design System styling.
 *
 * React 19: Uses ref as regular prop instead of forwardRef.
 * Supports both HTML prop (disabled) and React Aria prop (isDisabled).
 */
const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ref,
  disabled,
  isDisabled,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : AriaButton;

  // Backward compatibility: support both disabled and isDisabled
  const resolvedIsDisabled = isDisabled ?? disabled;

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      isDisabled={resolvedIsDisabled}
      ref={ref as any}
      {...props}
    />
  );
};

export { Button, buttonVariants };
