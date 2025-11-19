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
import {
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  type SelectProps as AriaSelectProps,
  type ListBoxItemProps,
} from "react-aria-components";
import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Select Root Props
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
}

/**
 * Select Root Component
 *
 * Container for the select with state management.
 * Uses React Aria for robust accessibility.
 */
export const Select = React.forwardRef<HTMLDivElement, SelectProps<any>>(
  ({ className, children, ...props }, ref) => {
    return (
      <AriaSelect ref={ref} className={cn("relative", className)} {...props}>
        {children}
      </AriaSelect>
    );
  }
);

Select.displayName = "Select";

/**
 * Select Value Component
 *
 * Displays the selected value in the trigger.
 * Uses React Aria's SelectValue for proper rendering.
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
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className }, ref) => {
    return (
      <AriaSelectValue
        ref={ref}
        className={cn("block truncate", className)}
      >
        {({ selectedText }) => selectedText || placeholder}
      </AriaSelectValue>
    );
  }
);

SelectValue.displayName = "SelectValue";

/**
 * Select Trigger Props
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
}

/**
 * Select Trigger Component
 *
 * Button that opens the select dropdown.
 * Lia Design System: rounded-lg, orange focus ring.
 */
export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children }, ref) => {
    return (
      <Button
        ref={ref}
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
      >
        {children}
        <HugeiconsIcon className="h-4 w-4 opacity-50 ml-2" icon={ArrowDown01Icon} />
      </Button>
    );
  }
);

SelectTrigger.displayName = "SelectTrigger";

/**
 * Select Content Props
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
}

/**
 * Select Content Component
 *
 * Dropdown content container with ListBox.
 * Lia Design System: rounded-lg, shadow-lg, neutral background.
 */
export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children }, ref) => {
    return (
      <Popover
        ref={ref}
        className={cn(
          // Base positioning
          "z-50",
          // Animation states
          "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
          "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
          // Additional classes
          className
        )}
      >
        <ListBox
          className={cn(
            // Size constraints
            "max-h-96 min-w-[8rem] w-[var(--trigger-width)]",
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
  }
);

SelectContent.displayName = "SelectContent";

/**
 * Select Item Props
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
}

/**
 * Select Item Component
 *
 * Individual select option with checkmark indicator.
 * Lia Design System: orange-50 hover, orange-600 selected.
 */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    return (
      <ListBoxItem
        ref={ref}
        id={value}
        textValue={typeof children === "string" ? children : value}
        className={cn(
          // Base layout
          "relative flex w-full cursor-default select-none items-center",
          // Spacing
          "py-2 pl-3 pr-8",
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
  }
);

SelectItem.displayName = "SelectItem";

/**
 * Select Label Props
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
}

/**
 * Select Label Component
 *
 * Section label within select dropdown.
 * Lia Design System: uppercase, tracking-wider, neutral-400.
 */
export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Spacing
          "px-3 py-2",
          // Typography (Lia Design System)
          "text-xs font-semibold uppercase tracking-wider text-neutral-400",
          // Additional classes
          className
        )}
      >
        {children}
      </div>
    );
  }
);

SelectLabel.displayName = "SelectLabel";

/**
 * Select Separator Props
 */
export interface SelectSeparatorProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Select Separator Component
 *
 * Visual separator between select items.
 * Lia Design System: neutral-200.
 */
export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
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
      />
    );
  }
);

SelectSeparator.displayName = "SelectSeparator";

/**
 * Select Group Component
 *
 * Groups related select items together.
 * Typically used with SelectLabel.
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
}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ className, children }, ref) => {
    return (
      <div ref={ref} className={cn("py-1", className)}>
        {children}
      </div>
    );
  }
);

SelectGroup.displayName = "SelectGroup";

// Export aliases for backward compatibility (if needed)
export const SelectScrollUpButton = () => null;
export const SelectScrollDownButton = () => null;

SelectScrollUpButton.displayName = "SelectScrollUpButton";
SelectScrollDownButton.displayName = "SelectScrollDownButton";
