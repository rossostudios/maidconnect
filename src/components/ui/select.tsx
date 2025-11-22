"use client";

/**
 * Select Component (React Aria)
 *
 * Accessible select dropdown with Lia Design System styling.
 * Migrated from Radix UI to React Aria Components.
 *
 * Week 5: Component Libraries Consolidation - Task 1
 *
 * @example
 * ```tsx
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select option" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">Option 1</SelectItem>
 *     <SelectItem value="option2">Option 2</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 */

import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import * as React from "react";
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue as AriaSelectValue,
  Button,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Select Root Props
 * React 19: ref is a regular prop.
 */
export interface SelectProps<T extends object> extends AriaSelectProps<T> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements (SelectTrigger and SelectContent)
   */
  children: React.ReactNode;
  /**
   * Ref to the select container element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Select Root Component
 *
 * Container for the select with state management.
 * Uses React Aria for robust accessibility.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const Select = ({ className, children, ref, ...props }: SelectProps<any>) => (
  <AriaSelect className={cn("relative", className)} ref={ref} {...props}>
    {children}
  </AriaSelect>
);

/**
 * Select Value Component
 *
 * Displays the selected value in the trigger.
 * Uses React Aria's SelectValue for proper rendering.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export interface SelectValueProps {
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref to the span element
   */
  ref?: React.RefObject<HTMLSpanElement | null>;
}

export const SelectValue = ({ placeholder, className, ref }: SelectValueProps) => (
  <AriaSelectValue className={cn("block truncate", className)} ref={ref}>
    {({ selectedText }) => selectedText || placeholder}
  </AriaSelectValue>
);

/**
 * Select Trigger Props
 * React 19: ref is a regular prop.
 */
export interface SelectTriggerProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements (typically SelectValue)
   */
  children: React.ReactNode;
  /**
   * Ref to the button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Select Trigger Component
 *
 * Button that opens the select dropdown.
 * Lia Design System: rounded-lg, orange focus ring.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const SelectTrigger = ({ className, children, ref }: SelectTriggerProps) => {
  return (
    <Button
      className={cn(
        // Base layout
        "flex h-10 w-full items-center justify-between",
        // Border and background (Lia Design System)
        "border border-neutral-200 bg-neutral-50",
        // Shape - Lia Design System: rounded-lg (Anthropic)
        "rounded-lg",
        // Spacing
        "px-4 py-2",
        // Typography
        "text-sm",
        // Focus state - orange ring (Lia Design System)
        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Hover state
        "transition-colors hover:bg-neutral-100",
        // Text truncation
        "[&>span]:line-clamp-1",
        // Additional classes
        className
      )}
      ref={ref}
    >
      {children}
      <HugeiconsIcon className="ml-2 h-4 w-4 opacity-50" icon={ArrowDown01Icon} />
    </Button>
  );
};

/**
 * Select Content Props
 * React 19: ref is a regular prop.
 */
export interface SelectContentProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements (SelectItem components)
   */
  children: React.ReactNode;
  /**
   * Ref to the popover element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Select Content Component
 *
 * Dropdown content container with ListBox.
 * Lia Design System: rounded-lg, shadow-lg, neutral background.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const SelectContent = ({ className, children, ref }: SelectContentProps) => {
  return (
    <Popover
      className={cn(
        // Base positioning
        "z-50",
        // Animation states
        "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out",
        // Additional classes
        className
      )}
      ref={ref}
    >
      <ListBox
        className={cn(
          // Size constraints
          "max-h-96 w-[var(--trigger-width)] min-w-[8rem]",
          // Border and background (Lia Design System)
          "border border-neutral-200 bg-white",
          // Shape - Lia Design System: rounded-lg (Anthropic)
          "rounded-lg",
          // Shadow
          "shadow-lg",
          // Overflow
          "overflow-auto",
          // Padding
          "p-1"
        )}
      >
        {children}
      </ListBox>
    </Popover>
  );
};

/**
 * Select Item Props
 * React 19: ref is a regular prop.
 */
export interface SelectItemProps extends Omit<ListBoxItemProps, "children"> {
  /**
   * The value of this select option
   */
  value: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * The display text for this option
   */
  children: React.ReactNode;
  /**
   * Ref to the list box item element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Select Item Component
 *
 * Individual select option with checkmark indicator.
 * Lia Design System: orange-50 hover, orange-600 selected.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const SelectItem = ({ className, children, value, ref, ...props }: SelectItemProps) => {
  return (
    <ListBoxItem
      className={cn(
        // Base layout
        "relative flex w-full cursor-default select-none items-center",
        // Spacing
        "py-2 pr-8 pl-3",
        // Typography
        "text-sm",
        // Shape - Lia Design System: rounded (Anthropic)
        "rounded",
        // Outline
        "outline-none",
        // Focus state - orange background (Lia Design System)
        "focus:bg-orange-50 focus:text-orange-900",
        // Selected state
        "data-[selected]:bg-orange-50 data-[selected]:text-orange-900",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        // Additional classes
        className
      )}
      id={value}
      ref={ref}
      textValue={typeof children === "string" ? children : value}
      {...props}
    >
      {({ isSelected }) => (
        <>
          <span className="block truncate">{children}</span>
          {isSelected && (
            <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
              <HugeiconsIcon className="h-4 w-4 text-orange-600" icon={Tick02Icon} />
            </span>
          )}
        </>
      )}
    </ListBoxItem>
  );
};

/**
 * Select Label Props
 * React 19: ref is a regular prop.
 */
export interface SelectLabelProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Label text
   */
  children: React.ReactNode;
  /**
   * Ref to the label element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Select Label Component
 *
 * Section label within select dropdown.
 * Lia Design System: uppercase, tracking-wider, neutral-400.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const SelectLabel = ({ className, children, ref }: SelectLabelProps) => {
  return (
    <div
      className={cn(
        // Spacing
        "px-3 py-2",
        // Typography (Lia Design System)
        "font-semibold text-neutral-400 text-xs uppercase tracking-wider",
        // Additional classes
        className
      )}
      ref={ref}
    >
      {children}
    </div>
  );
};

/**
 * Select Separator Props
 * React 19: ref is a regular prop.
 */
export interface SelectSeparatorProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref to the separator element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Select Separator Component
 *
 * Visual separator between select items.
 * Lia Design System: neutral-200.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const SelectSeparator = ({ className, ref }: SelectSeparatorProps) => {
  return (
    <div
      className={cn(
        // Margin
        "-mx-1 my-1",
        // Size
        "h-px",
        // Color (Lia Design System)
        "bg-neutral-200",
        // Additional classes
        className
      )}
      ref={ref}
    />
  );
};

/**
 * Select Group Component
 *
 * Groups related select items together.
 * Typically used with SelectLabel.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export interface SelectGroupProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements (SelectLabel and SelectItem components)
   */
  children: React.ReactNode;
  /**
   * Ref to the group element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

export const SelectGroup = ({ className, children, ref }: SelectGroupProps) => (
  <div className={cn("py-1", className)} ref={ref}>
    {children}
  </div>
);

// Export aliases for backward compatibility (if needed)
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;

SelectScrollUpButton.displayName = "SelectScrollUpButton";
SelectScrollDownButton.displayName = "SelectScrollDownButton";
