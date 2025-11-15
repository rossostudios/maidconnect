"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const accordionVariants = cva("overflow-hidden transition-all", {
  variants: {
    variant: {
      default: "rounded-3xl border border-neutral-200 bg-white shadow-sm hover:shadow-md",
      bordered: "rounded-2xl border-2 border-neutral-200 bg-white hover:border-neutral-300",
      minimal: "border-neutral-200 border-b",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type AccordionProps = {
  children: ReactNode;
  className?: string;
  variant?: VariantProps<typeof accordionVariants>["variant"];
  allowMultiple?: boolean;
};

type AccordionItemProps = {
  children: ReactNode;
  className?: string;
  value: string;
};

type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
};

type AccordionContentProps = {
  children: ReactNode;
  className?: string;
};

type AccordionContextValue = {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  variant: "default" | "bordered" | "minimal";
  currentItem: string;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

export function Accordion({
  children,
  className,
  variant = "default",
  allowMultiple = false,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(value);
      }
      return newSet;
    });
  };

  const spacing = {
    default: "space-y-4",
    bordered: "space-y-3",
    minimal: "space-y-2",
  };

  return (
    <div className={cn(spacing[variant || "default"], className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<AccordionItemProps>(child)) {
          return (
            <AccordionContext.Provider
              value={{
                openItems,
                toggleItem,
                variant: variant || "default",
                currentItem: child.props.value,
              }}
            >
              {child}
            </AccordionContext.Provider>
          );
        }
        return child;
      })}
    </div>
  );
}

export function AccordionItem({ children, className, value: _value }: AccordionItemProps) {
  const { variant } = useAccordionContext();

  return <div className={cn(accordionVariants({ variant }), className)}>{children}</div>;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { openItems, toggleItem, variant, currentItem } = useAccordionContext();
  const isOpen = openItems.has(currentItem);

  const variantStyles = {
    default: "p-8",
    bordered: "px-6 py-5",
    minimal: "py-4",
  };

  return (
    <button
      aria-expanded={isOpen}
      className={cn(
        "flex w-full items-center justify-between text-left transition",
        variantStyles[variant],
        className
      )}
      onClick={() => toggleItem(currentItem)}
      type="button"
    >
      <span className="pr-8 font-semibold text-lg text-neutral-900">{children}</span>
      <HugeiconsIcon
        className={cn(
          "h-6 w-6 flex-shrink-0 text-neutral-600 transition-transform duration-300",
          isOpen && "rotate-180"
        )}
        icon={ArrowDown01Icon}
      />
    </button>
  );
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { openItems, variant, currentItem } = useAccordionContext();
  const isOpen = openItems.has(currentItem);

  const variantStyles = {
    default: "border-neutral-200 border-t p-8 pt-6",
    bordered: "px-6 pb-5",
    minimal: "pb-4",
  };

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <div className={cn(variantStyles[variant], className)}>
          <div className="text-base text-neutral-600 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
