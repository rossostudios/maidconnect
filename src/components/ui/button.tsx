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

import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
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
          "bg-primary text-primary-foreground shadow-md hover:bg-orange-600 active:scale-[0.98] active:bg-orange-700",
        // Destructive actions (orange-700)
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-orange-800 active:scale-[0.98]",
        // Outline with orange accent on hover
        outline:
          "border-2 border-neutral-200 bg-background shadow-sm hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]",
        // Neutral secondary button
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-neutral-300 active:scale-[0.98]",
        // Ghost with orange accent on hover
        ghost: "hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]",
        // Link with orange accent (Lia guideline: orange-600 for better WCAG contrast)
        link: "text-orange-600 hover:text-orange-700",
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
 * Custom Slot Component
 *
 * Replaces Radix UI Slot. Merges props with the child element.
 * Allows composition with other components (e.g., Next.js Link).
 */
const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children: React.ReactElement }
>(({ children, ...props }, ref) => {
  // Clone the child element and merge props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      // Merge className
      className: cn(props.className, children.props.className),
      // Merge refs
      ref: ref,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return children;
});

Slot.displayName = "Slot";

/**
 * Button Props
 *
 * Extends React Aria Button props with variant configuration.
 */
export interface ButtonProps
  extends Omit<AriaButtonProps, "className">,
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
}

/**
 * Button Component
 *
 * Primary interactive component with accessible focus states,
 * keyboard navigation, and Lia Design System styling.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : AriaButton;

    return (
      <Comp
        ref={ref as any}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
