"use client";

/**
 * ComboBox Component (React Aria)
 *
 * Accessible autocomplete/combobox with Lia Design System styling.
 * Used for searchable dropdowns like location pickers.
 *
 * @example
 * ```tsx
 * <ComboBox
 *   label="Location"
 *   placeholder="Search cities..."
 *   items={cities}
 *   onSelectionChange={(key) => setSelectedCity(key)}
 * >
 *   {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
 * </ComboBox>
 * ```
 */

import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * ComboBox Item Data Shape
 */
export type ComboBoxItemData = {
  id: string;
  label: string;
  description?: string;
};

/**
 * ComboBox Props
 */
export interface ComboBoxProps<T extends ComboBoxItemData>
  extends Omit<AriaComboBoxProps<T>, "children"> {
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** CSS classes for the input */
  inputClassName?: string;
  /** CSS classes for the label */
  labelClassName?: string;
  /** Show location icon */
  showLocationIcon?: boolean;
  /** Items to display */
  items?: Iterable<T>;
  /** Children render function or elements */
  children: React.ReactNode | ((item: T) => React.ReactNode);
  /** Ref to the combobox container */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * ComboBox Component
 *
 * Accessible autocomplete with search functionality.
 * Lia Design System: rounded-lg, orange focus ring, z-[100] for proper layering.
 */
export function ComboBox<T extends ComboBoxItemData>({
  label,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  showLocationIcon = false,
  items,
  children,
  ref,
  ...props
}: ComboBoxProps<T>) {
  return (
    <AriaComboBox
      className={cn("relative w-full", className)}
      menuTrigger="focus"
      ref={ref}
      {...props}
    >
      {label && (
        <Label
          className={cn(
            "block font-medium text-neutral-500 text-xs uppercase tracking-wide",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      <div className="relative">
        {showLocationIcon && (
          <HugeiconsIcon
            className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 h-5 w-5 text-neutral-400"
            icon={Location01Icon}
          />
        )}
        <Input
          className={cn(
            // Base
            "w-full bg-transparent outline-none",
            // Typography
            "font-medium text-neutral-900 placeholder-neutral-400",
            // Focus
            "focus:outline-none",
            // Icon padding
            showLocationIcon ? "pl-11" : "",
            inputClassName
          )}
          placeholder={placeholder}
        />
      </div>
      <Popover
        className={cn(
          // z-[100] to appear above sticky header (z-50)
          "z-[100]",
          // Animation
          "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
          "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out"
        )}
      >
        <ListBox
          className={cn(
            // Size
            "max-h-60 w-[var(--trigger-width)] min-w-[16rem]",
            // Border and background (Lia Design System)
            "border border-neutral-200 bg-white",
            // Shape - rounded-lg
            "rounded-lg",
            // Shadow
            "shadow-xl",
            // Overflow
            "overflow-auto",
            // Padding
            "py-1"
          )}
          items={items}
        >
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

/**
 * ComboBox Item Props
 */
export interface ComboBoxItemProps extends Omit<ListBoxItemProps, "children"> {
  /** Primary text */
  children: React.ReactNode;
  /** Secondary/description text */
  description?: string;
  /** Show location icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ComboBox Item Component
 *
 * Individual option within the combobox dropdown.
 * Lia Design System: rausch-50 focus, rounded corners.
 */
export function ComboBoxItem({
  children,
  description,
  showIcon = true,
  className,
  ...props
}: ComboBoxItemProps) {
  return (
    <ListBoxItem
      className={cn(
        // Base layout
        "flex w-full cursor-default select-none items-center gap-3",
        // Spacing
        "px-4 py-3",
        // Typography
        "text-sm",
        // Shape - rounded-md for list items (Airbnb pattern)
        "rounded-md",
        // Outline
        "outline-none",
        // Focus/hover state - rausch background (Lia Design System)
        "focus:bg-neutral-50",
        "data-[focused]:bg-neutral-50",
        "data-[selected]:bg-rausch-50",
        // Smooth transition
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      {showIcon && (
        <HugeiconsIcon className="h-5 w-5 shrink-0 text-neutral-400" icon={Location01Icon} />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-neutral-900">{children}</div>
        {description && <div className="truncate text-neutral-500 text-sm">{description}</div>}
      </div>
    </ListBoxItem>
  );
}
