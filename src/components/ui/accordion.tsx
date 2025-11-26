"use client";

/**
 * Accordion Component (React Aria)
 *
 * Accessible accordion with expandable/collapsible sections.
 * Uses React Aria's Disclosure for proper ARIA implementation.
 * Migrated from custom state management to React Aria.
 *
 * Week 6: Component Libraries Consolidation - Task 2
 *
 * @example
 * ```tsx
 * <Accordion>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content for section 1</AccordionContent>
 *   </AccordionItem>
 *   <AccordionItem value="item-2">
 *     <AccordionTrigger>Section 2</AccordionTrigger>
 *     <AccordionContent>Content for section 2</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import * as React from "react";
import { Disclosure as AriaDisclosure, Button, DisclosurePanel } from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Accordion Variants Configuration
 *
 * Defines visual styles for different accordion types.
 * Lia Design System: rounded-lg corners added (Anthropic aesthetic).
 */
const accordionVariants = cva("overflow-hidden transition-all", {
  variants: {
    variant: {
      default: "rounded-lg border border-neutral-200 bg-white shadow-sm hover:shadow-md",
      bordered: "rounded-lg border-2 border-neutral-200 bg-white hover:border-neutral-300",
      minimal: "border-neutral-200 border-b",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Accordion Props
 */
type AccordionProps = {
  /**
   * Accordion items (AccordionItem components)
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Visual variant
   */
  variant?: VariantProps<typeof accordionVariants>["variant"];
  /**
   * Allow multiple items to be open simultaneously (default: false)
   */
  allowMultiple?: boolean;
};

/**
 * Accordion Item Props
 */
type AccordionItemProps = {
  /**
   * Item content (AccordionTrigger and AccordionContent)
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Unique identifier for this item
   */
  value: string;
  /**
   * Whether this item is initially expanded (default: false)
   */
  defaultExpanded?: boolean;
};

/**
 * Accordion Trigger Props
 */
type AccordionTriggerProps = {
  /**
   * Trigger text/content
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
};

/**
 * Accordion Content Props
 */
type AccordionContentProps = {
  /**
   * Content to display when expanded
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
};

/**
 * Accordion Context
 *
 * Provides variant styling to child components.
 */
type AccordionContextValue = {
  variant: "default" | "bordered" | "minimal";
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

/**
 * Accordion Component
 *
 * Container for accordion items with variant styling.
 * Provides context for child components.
 */
export function Accordion({
  children,
  className,
  variant = "default",
  allowMultiple: _allowMultiple = false,
}: AccordionProps) {
  const spacing = {
    default: "space-y-4",
    bordered: "space-y-3",
    minimal: "space-y-2",
  };

  return (
    <AccordionContext.Provider value={{ variant: variant || "default" }}>
      <div className={cn(spacing[variant || "default"], className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

/**
 * Accordion Item Component
 *
 * Individual expandable/collapsible section.
 * Uses React Aria Disclosure for accessibility.
 */
export function AccordionItem({
  children,
  className,
  value: _value,
  defaultExpanded = false,
}: AccordionItemProps) {
  const { variant } = useAccordionContext();

  return (
    <AriaDisclosure defaultExpanded={defaultExpanded}>
      <div className={cn(accordionVariants({ variant }), className)}>{children}</div>
    </AriaDisclosure>
  );
}

/**
 * Accordion Trigger Component
 *
 * Button that toggles the accordion section.
 * Lia Design System: rausch-500 focus ring.
 */
export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { variant } = useAccordionContext();

  const variantStyles = {
    default: "p-8",
    bordered: "px-6 py-5",
    minimal: "py-4",
  };

  return (
    <Button
      className={cn(
        // Base layout
        "flex w-full items-center justify-between text-left transition",
        // Variant spacing
        variantStyles[variant],
        // Focus state - orange ring (Lia Design System)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        // Additional classes
        className
      )}
      slot="trigger"
    >
      {({ isExpanded }) => (
        <>
          <span className="pr-8 font-semibold text-lg text-neutral-900">{children}</span>
          <HugeiconsIcon
            className={cn(
              "h-6 w-6 flex-shrink-0 text-neutral-600 transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
            icon={ArrowDown01Icon}
          />
        </>
      )}
    </Button>
  );
}

/**
 * Accordion Content Component
 *
 * Expandable content panel.
 * Lia Design System: neutral colors, smooth transitions.
 */
export function AccordionContent({ children, className }: AccordionContentProps) {
  const { variant } = useAccordionContext();

  const variantStyles = {
    default: "border-neutral-200 border-t p-8 pt-6",
    bordered: "px-6 pb-5",
    minimal: "pb-4",
  };

  return (
    <DisclosurePanel
      className={cn(
        // Grid animation for smooth expand/collapse
        "grid transition-all duration-300 ease-in-out",
        // Animation states
        "data-[entering]:fade-in-0 data-[entering]:slide-in-from-top-2 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:slide-out-to-top-2 data-[exiting]:animate-out"
      )}
    >
      <div className="overflow-hidden">
        <div className={cn(variantStyles[variant], className)}>
          <div className="text-base text-neutral-600 leading-relaxed">{children}</div>
        </div>
      </div>
    </DisclosurePanel>
  );
}
