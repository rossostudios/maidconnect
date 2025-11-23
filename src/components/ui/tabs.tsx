"use client";

/**
 * Tabs Component (React Aria)
 *
 * Accessible tab navigation with Lia Design System styling.
 * Migrated from Radix UI to React Aria Components.
 *
 * Week 6: Component Libraries Consolidation - Task 1
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 * ```
 */

import * as React from "react";
import {
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
  Tab,
  TabList,
  TabPanel,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Tabs Root Props
 * React 19: ref is a regular prop, no forwardRef needed.
 */
export interface TabsProps extends Omit<AriaTabsProps, "children"> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Children elements (TabsList and TabsContent)
   */
  children: React.ReactNode;
  /**
   * Default selected tab value (uncontrolled)
   */
  defaultValue?: string;
  /**
   * Selected tab value (controlled)
   */
  value?: string;
  /**
   * Callback when tab selection changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Ref to the tabs container element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Tabs Root Component
 *
 * Container for tabs with state management.
 * Uses React Aria for accessibility and keyboard navigation.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const Tabs = ({
  className,
  children,
  defaultValue,
  value,
  onValueChange,
  ref,
  ...props
}: TabsProps) => {
  // Handle both React Aria (selectedKey/onSelectionChange) and Radix (value/onValueChange) props
  const selectedKey = value ?? props.selectedKey;
  const defaultSelectedKey = defaultValue ?? props.defaultSelectedKey;

  const handleSelectionChange = React.useCallback(
    (key: React.Key) => {
      onValueChange?.(String(key));
      props.onSelectionChange?.(key);
    },
    [onValueChange, props]
  );

  return (
    <AriaTabs
      className={cn("w-full", className)}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={handleSelectionChange}
      ref={ref}
      selectedKey={selectedKey}
      {...props}
    >
      {children}
    </AriaTabs>
  );
};

/**
 * Tabs List Props
 * React 19: ref is a regular prop.
 */
export type TabsListProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Tab trigger elements
   */
  children: React.ReactNode;
  /**
   * Ref to the tab list element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
};

/**
 * Tabs List Component
 *
 * Container for tab triggers.
 * Lia Design System: neutral-50 background, rounded-lg (Anthropic).
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const TabsList = ({ className, children, ref }: TabsListProps) => {
  return (
    <TabList
      className={cn(
        // Layout
        "inline-flex h-12 items-center justify-center",
        // Background and text (Lia Design System)
        "bg-neutral-50 text-neutral-400",
        // Shape - Lia Design System: rounded-lg (Anthropic)
        "rounded-lg",
        // Spacing
        "p-1",
        // Additional classes
        className
      )}
      ref={ref}
    >
      {children}
    </TabList>
  );
};

/**
 * Tabs Trigger Props
 * React 19: ref is a regular prop.
 */
export type TabsTriggerProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Tab value identifier
   */
  value: string;
  /**
   * Trigger content
   */
  children: React.ReactNode;
  /**
   * Ref to the tab button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
};

/**
 * Tabs Trigger Component
 *
 * Individual tab button.
 * Lia Design System: orange-500 focus ring, rounded (Anthropic).
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const TabsTrigger = ({ className, value, children, ref }: TabsTriggerProps) => {
  return (
    <Tab
      className={cn(
        // Base layout
        "inline-flex items-center justify-center whitespace-nowrap",
        // Spacing
        "px-6 py-2",
        // Typography
        "font-medium text-sm",
        // Shape - Lia Design System: rounded (Anthropic)
        "rounded",
        // Transition
        "transition-all",
        // Focus state - orange ring (Lia Design System)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        // Selected state (Lia Design System)
        "data-[selected]:bg-white data-[selected]:text-neutral-900 data-[selected]:shadow-sm",
        // Inactive state
        "data-[selected=false]:text-neutral-400 data-[selected=false]:hover:text-neutral-900",
        // Additional classes
        className
      )}
      id={value}
      ref={ref}
    >
      {children}
    </Tab>
  );
};

/**
 * Tabs Content Props
 * React 19: ref is a regular prop.
 */
export type TabsContentProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Tab value identifier (must match a TabsTrigger value)
   */
  value: string;
  /**
   * Content to display when tab is active
   */
  children: React.ReactNode;
  /**
   * Ref to the tab panel element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
};

/**
 * Tabs Content Component
 *
 * Content panel for each tab.
 * Lia Design System: orange-500 focus ring.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const TabsContent = ({ className, value, children, ref }: TabsContentProps) => {
  return (
    <TabPanel
      className={cn(
        // Spacing
        "mt-6",
        // Focus state - orange ring (Lia Design System)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        // Additional classes
        className
      )}
      id={value}
      ref={ref}
    >
      {children}
    </TabPanel>
  );
};
