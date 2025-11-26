"use client";

/**
 * Popover Component (React Aria)
 *
 * Accessible popover with overlay and Lia Design System styling.
 * Built on React Aria Components.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger>
 *     <Button>Open Popover</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <p>Popover content here</p>
 *   </PopoverContent>
 * </Popover>
 * ```
 */

import * as React from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
  Button,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Popover Root Props
 */
export type PopoverProps = {
  /**
   * Whether the popover is open (controlled)
   */
  open?: boolean;
  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Children elements (PopoverTrigger and PopoverContent)
   */
  children: React.ReactNode;
};

/**
 * Popover Root Component
 *
 * Container for popover state management.
 * Uses React Aria for accessibility and keyboard interaction.
 */
export const Popover = ({ open, defaultOpen, onOpenChange, children }: PopoverProps) => (
  <AriaDialogTrigger defaultOpen={defaultOpen} isOpen={open} onOpenChange={onOpenChange}>
    {children}
  </AriaDialogTrigger>
);

Popover.displayName = "Popover";

/**
 * Popover Trigger Props
 */
export type PopoverTriggerProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Trigger element (typically a Button)
   */
  children: React.ReactNode;
  /**
   * Render as child (for composition)
   */
  asChild?: boolean;
  /**
   * Ref to the trigger button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
};

/**
 * Popover Trigger Component
 *
 * Button that opens the popover.
 * Wraps children - typically a Button component.
 */
export const PopoverTrigger = ({ className, children, asChild, ref }: PopoverTriggerProps) => {
  // If asChild is true, just render the children directly
  // React Aria DialogTrigger will handle the button role
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <Button className={className} ref={ref}>
      {children}
    </Button>
  );
};

PopoverTrigger.displayName = "PopoverTrigger";

/**
 * Popover Content Props
 */
export interface PopoverContentProps extends Omit<AriaPopoverProps, "children"> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Popover content
   */
  children: React.ReactNode;
  /**
   * Alignment of the popover relative to trigger
   */
  align?: "start" | "center" | "end";
  /**
   * Side offset from trigger
   */
  sideOffset?: number;
  /**
   * Ref to the popover element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Popover Content Component
 *
 * Main popover container.
 * Lia Design System: rounded-lg, white background, shadow-md, border.
 */
export const PopoverContent = ({
  className,
  children,
  align = "center",
  sideOffset = 4,
  ref,
  ...props
}: PopoverContentProps) => {
  // Map align to React Aria crossOffset
  const crossOffset = align === "start" ? -8 : align === "end" ? 8 : 0;

  return (
    <AriaPopover
      className={cn(
        // Layout
        "z-50 w-72 outline-none",
        // Border and background (Lia Design System)
        "border border-neutral-200 bg-white dark:border-border dark:bg-card",
        // Shape - Lia Design System: rounded-lg (Anthropic)
        "rounded-lg",
        // Spacing
        "p-4",
        // Shadow
        "shadow-md",
        // Animation
        "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out",
        // Duration
        "duration-200",
        // Additional classes
        className
      )}
      crossOffset={crossOffset}
      offset={sideOffset}
      ref={ref}
      {...props}
    >
      <AriaDialog className="outline-none">{children}</AriaDialog>
    </AriaPopover>
  );
};

PopoverContent.displayName = "PopoverContent";

/**
 * Popover Close Component
 *
 * Button to close the popover programmatically.
 */
export type PopoverCloseProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Render as child (for composition)
   */
  asChild?: boolean;
  /**
   * Ref to the button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
};

export const PopoverClose = ({ className, children, asChild, ref }: PopoverCloseProps) => {
  // If asChild, just render children - parent should be a Button
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <Button className={className} ref={ref} slot="close">
      {children}
    </Button>
  );
};

PopoverClose.displayName = "PopoverClose";
