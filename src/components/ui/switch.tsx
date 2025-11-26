"use client";

/**
 * Switch Component (React Aria)
 *
 * Accessible toggle switch with Lia Design System styling.
 * Built on React Aria Components.
 *
 * @example
 * ```tsx
 * <Switch checked={isEnabled} onChange={setIsEnabled}>
 *   Enable notifications
 * </Switch>
 * ```
 */

import * as React from "react";
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Switch Props
 */
export interface SwitchProps extends Omit<AriaSwitchProps, "children"> {
  /**
   * Additional CSS classes for the switch container
   */
  className?: string;
  /**
   * Controlled checked state
   */
  checked?: boolean;
  /**
   * Default checked state (uncontrolled)
   */
  defaultChecked?: boolean;
  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Ref to the switch element
   */
  ref?: React.RefObject<HTMLLabelElement | null>;
  /**
   * Label content
   */
  children?: React.ReactNode;
}

/**
 * Switch Component
 *
 * Accessible toggle switch with visual feedback.
 * Lia Design System: rausch-500 for checked state, neutral for unchecked.
 */
export const Switch = ({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  ref,
  children,
  ...props
}: SwitchProps) => {
  return (
    <AriaSwitch
      className={cn(
        // Layout
        "group inline-flex items-center gap-2",
        // Cursor
        "cursor-pointer",
        // Disabled state
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        // Additional classes
        className
      )}
      defaultSelected={defaultChecked}
      isSelected={checked}
      onChange={onCheckedChange}
      ref={ref}
      {...props}
    >
      {/* Track */}
      <span
        className={cn(
          // Size
          "h-6 w-11",
          // Shape
          "rounded-full",
          // Border (Lia Design System)
          "border-2 border-transparent",
          // Background - unchecked
          "bg-neutral-200",
          // Background - checked (Lia Design System - rausch-500)
          "group-data-[selected]:bg-rausch-500",
          // Transition
          "transition-colors duration-200",
          // Focus ring
          "group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-rausch-500/50 group-data-[focus-visible]:ring-offset-2"
        )}
      >
        {/* Thumb */}
        <span
          className={cn(
            // Position
            "block",
            // Size
            "h-5 w-5",
            // Shape
            "rounded-full",
            // Background
            "bg-white",
            // Shadow
            "shadow-sm",
            // Transition
            "transition-transform duration-200",
            // Position - unchecked
            "translate-x-0",
            // Position - checked
            "group-data-[selected]:translate-x-5"
          )}
        />
      </span>

      {/* Label */}
      {children && <span className="text-neutral-700 text-sm">{children}</span>}
    </AriaSwitch>
  );
};

Switch.displayName = "Switch";
