"use client";

/**
 * Dropdown Menu Component (React Aria)
 *
 * Accessible dropdown menu with overlay and Lia Design System styling.
 * Built on React Aria Components.
 *
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger>
 *     <Button>Open Menu</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem onSelect={() => {}}>Edit</DropdownMenuItem>
 *     <DropdownMenuItem onSelect={() => {}}>Delete</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */

import * as React from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
  Separator as AriaSeparator,
  Button,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

// ============================================================================
// Dropdown Menu Root
// ============================================================================

/**
 * Dropdown Menu Root Props
 */
export type DropdownMenuProps = {
  /**
   * Whether the menu is open (controlled)
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
   * Children elements (DropdownMenuTrigger and DropdownMenuContent)
   */
  children: React.ReactNode;
};

/**
 * Dropdown Menu Root Component
 *
 * Container for menu state management.
 * Uses React Aria for accessibility and keyboard interaction.
 */
export const DropdownMenu = ({ open, defaultOpen, onOpenChange, children }: DropdownMenuProps) => (
  <AriaMenuTrigger defaultOpen={defaultOpen} isOpen={open} onOpenChange={onOpenChange}>
    {children}
  </AriaMenuTrigger>
);

DropdownMenu.displayName = "DropdownMenu";

// ============================================================================
// Dropdown Menu Trigger
// ============================================================================

/**
 * Dropdown Menu Trigger Props
 */
export type DropdownMenuTriggerProps = {
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
 * Dropdown Menu Trigger Component
 *
 * Button that opens the dropdown menu.
 */
export const DropdownMenuTrigger = ({
  className,
  children,
  asChild,
  ref,
}: DropdownMenuTriggerProps) => {
  // Always use React Aria Button for proper trigger behavior
  // When asChild is true, extract className and children from the passed element
  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { className?: string; children?: React.ReactNode };
    return (
      <Button className={cn(childProps.className, className)} ref={ref}>
        {childProps.children}
      </Button>
    );
  }

  return (
    <Button className={className} ref={ref}>
      {children}
    </Button>
  );
};

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// ============================================================================
// Dropdown Menu Content
// ============================================================================

/**
 * Dropdown Menu Content Props
 */
export interface DropdownMenuContentProps
  extends Omit<AriaPopoverProps, "children" | "style">,
    Omit<AriaMenuProps<object>, "children" | "style"> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Menu items
   */
  children: React.ReactNode;
  /**
   * Alignment of the menu relative to trigger
   */
  align?: "start" | "center" | "end";
  /**
   * Side offset from trigger
   */
  sideOffset?: number;
  /**
   * Ref to the menu element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Dropdown Menu Content Component
 *
 * Main menu container.
 * Lia Design System: rounded-lg, white background, shadow-md, border.
 */
export const DropdownMenuContent = ({
  className,
  children,
  align = "end",
  sideOffset = 4,
  ref,
  ...props
}: DropdownMenuContentProps) => {
  // Map align to React Aria crossOffset
  const crossOffset = align === "start" ? -8 : align === "end" ? 8 : 0;

  return (
    <AriaPopover
      className={cn(
        // Layout
        "z-50 min-w-[8rem] outline-none",
        // Border and background (Lia Design System - semantic tokens)
        "border border-border bg-card",
        // Shape - Lia Design System: rounded-lg (Anthropic)
        "rounded-lg",
        // Spacing
        "p-1",
        // Shadow
        "shadow-md",
        // Animation
        "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out",
        // Duration
        "duration-200"
      )}
      crossOffset={crossOffset}
      offset={sideOffset}
      ref={ref}
    >
      <AriaMenu className={cn("outline-none", className)} {...props}>
        {children}
      </AriaMenu>
    </AriaPopover>
  );
};

DropdownMenuContent.displayName = "DropdownMenuContent";

// ============================================================================
// Dropdown Menu Item
// ============================================================================

/**
 * Dropdown Menu Item Props
 */
export interface DropdownMenuItemProps extends Omit<AriaMenuItemProps, "onAction"> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the item has an inset (for icons)
   */
  inset?: boolean;
  /**
   * Callback when item is selected
   */
  onSelect?: () => void;
  /**
   * Menu item content
   */
  children: React.ReactNode;
}

/**
 * Dropdown Menu Item Component
 *
 * Individual menu item with hover and focus states.
 * Lia Design System: rounded-md (Airbnb pattern), rausch-50 focus, neutral text.
 */
export const DropdownMenuItem = ({
  className,
  inset,
  onSelect,
  children,
  ...props
}: DropdownMenuItemProps) => (
  <AriaMenuItem
    className={cn(
      // Layout
      "relative flex cursor-pointer select-none items-center gap-2",
      // Spacing
      "px-2 py-1.5",
      // Shape - rounded-md for menu items (Airbnb pattern)
      "rounded-md",
      // Text (semantic tokens)
      "text-foreground text-sm outline-none",
      // Focus state (Lia Design System)
      "focus:bg-rausch-50 focus:text-rausch-900",
      // Disabled state
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Inset for icons
      inset && "pl-8",
      // Smooth transition
      "transition-colors duration-200",
      className
    )}
    onAction={onSelect}
    {...props}
  >
    {children}
  </AriaMenuItem>
);

DropdownMenuItem.displayName = "DropdownMenuItem";

// ============================================================================
// Dropdown Menu Separator
// ============================================================================

/**
 * Dropdown Menu Separator Props
 */
export type DropdownMenuSeparatorProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
};

/**
 * Dropdown Menu Separator Component
 *
 * Visual separator between menu item groups.
 */
export const DropdownMenuSeparator = ({ className }: DropdownMenuSeparatorProps) => (
  <AriaSeparator
    className={cn(
      // Layout
      "-mx-1 my-1 h-px",
      // Background (semantic tokens)
      "bg-border",
      className
    )}
  />
);

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// ============================================================================
// Dropdown Menu Label
// ============================================================================

/**
 * Dropdown Menu Label Props
 */
export type DropdownMenuLabelProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether the label has an inset
   */
  inset?: boolean;
  /**
   * Label content
   */
  children: React.ReactNode;
};

/**
 * Dropdown Menu Label Component
 *
 * Non-interactive label for menu item groups.
 */
export const DropdownMenuLabel = ({ className, inset, children }: DropdownMenuLabelProps) => (
  <div
    className={cn(
      // Layout
      "px-2 py-1.5",
      // Text
      "font-semibold text-neutral-900 text-sm",
      // Inset for icons
      inset && "pl-8",
      className
    )}
  >
    {children}
  </div>
);

DropdownMenuLabel.displayName = "DropdownMenuLabel";

// ============================================================================
// Dropdown Menu Shortcut
// ============================================================================

/**
 * Dropdown Menu Shortcut Props
 */
export type DropdownMenuShortcutProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Shortcut text (e.g., "⌘K")
   */
  children: React.ReactNode;
};

/**
 * Dropdown Menu Shortcut Component
 *
 * Keyboard shortcut hint displayed in menu items.
 */
export const DropdownMenuShortcut = ({ className, children }: DropdownMenuShortcutProps) => (
  <span
    className={cn(
      // Layout
      "ml-auto",
      // Text
      "text-neutral-500 text-xs tracking-widest",
      className
    )}
  >
    {children}
  </span>
);

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
