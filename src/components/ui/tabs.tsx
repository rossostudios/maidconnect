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

import {
  Tabs as AriaTabs,
  TabList,
  Tab,
  TabPanel,
  type TabsProps as AriaTabsProps,
} from "react-aria-components";
import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Tabs Root Props
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
}

/**
 * Tabs Root Component
 *
 * Container for tabs with state management.
 * Uses React Aria for accessibility and keyboard navigation.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, children, defaultValue, value, onValueChange, ...props },
    ref
  ) => {
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
        ref={ref}
        className={cn("w-full", className)}
        selectedKey={selectedKey}
        defaultSelectedKey={defaultSelectedKey}
        onSelectionChange={handleSelectionChange}
        {...props}
      >
        {children}
      </AriaTabs>
    );
  }
);

Tabs.displayName = "Tabs";

/**
 * Tabs List Props
 */
export interface TabsListProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Tab trigger elements
   */
  children: React.ReactNode;
}

/**
 * Tabs List Component
 *
 * Container for tab triggers.
 * Lia Design System: neutral-50 background, rounded-lg (Anthropic).
 */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children }, ref) => {
    return (
      <TabList
        ref={ref}
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
      >
        {children}
      </TabList>
    );
  }
);

TabsList.displayName = "TabsList";

/**
 * Tabs Trigger Props
 */
export interface TabsTriggerProps {
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
}

/**
 * Tabs Trigger Component
 *
 * Individual tab button.
 * Lia Design System: orange-500 focus ring, rounded (Anthropic).
 */
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children }, ref) => {
    return (
      <Tab
        ref={ref}
        id={value}
        className={cn(
          // Base layout
          "inline-flex items-center justify-center whitespace-nowrap",
          // Spacing
          "px-6 py-2",
          // Typography
          "text-sm font-medium",
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
      >
        {children}
      </Tab>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

/**
 * Tabs Content Props
 */
export interface TabsContentProps {
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
}

/**
 * Tabs Content Component
 *
 * Content panel for each tab.
 * Lia Design System: orange-500 focus ring.
 */
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children }, ref) => {
    return (
      <TabPanel
        ref={ref}
        id={value}
        className={cn(
          // Spacing
          "mt-6",
          // Focus state - orange ring (Lia Design System)
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
          // Additional classes
          className
        )}
      >
        {children}
      </TabPanel>
    );
  }
);

TabsContent.displayName = "TabsContent";
