/**
 * Tabs Component - Migrated to React Aria
 *
 * This component uses React Aria's useTabList, useTab, and useTabPanel hooks
 * for accessible tab navigation. Maintains backward compatibility with the
 * previous Radix UI API.
 *
 * API Compatibility:
 * - Accepts both `value`/`onValueChange` (Radix) and `selectedKey`/`onSelectionChange` (React Aria)
 * - Same component structure: Tabs, TabsList, TabsTrigger, TabsContent
 * - Same CSS classes and styling patterns
 */

"use client";

import * as React from "react";
import type { AriaTabListProps, AriaTabPanelProps } from "react-aria";
import { useTab, useTabList, useTabPanel } from "react-aria";
import { useTabListState } from "react-stately";

import { cn } from "@/lib/utils";

// Context to share tab state across components
const TabsContext = React.createContext<ReturnType<typeof useTabListState> | null>(null);

// ============================================================================
// Tabs Root Component
// ============================================================================

interface TabsProps extends Omit<AriaTabListProps<object>, "children"> {
  className?: string;
  children: React.ReactNode;
  // Backward compatibility: accept Radix-style props
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const Tabs = ({
  className,
  children,
  value,
  onValueChange,
  defaultValue,
  selectedKey: selectedKeyProp,
  onSelectionChange: onSelectionChangeProp,
  defaultSelectedKey,
  ref,
  ...props
}: TabsProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  // Convert Radix props to React Aria props for backward compatibility
  const selectedKey = selectedKeyProp ?? value;
  const onSelectionChange = React.useCallback(
    (key: React.Key) => {
      // Convert key to string or number for React Aria compatibility
      const ariaKey = typeof key === "bigint" ? String(key) : key;
      onSelectionChangeProp?.(ariaKey);
      onValueChange?.(String(key));
    },
    [onSelectionChangeProp, onValueChange]
  );

  const state = useTabListState({
    ...props,
    selectedKey,
    onSelectionChange,
    defaultSelectedKey: defaultSelectedKey ?? defaultValue,
    children: null as any, // We handle children manually
  });

  return (
    <TabsContext.Provider value={state}>
      <div className={cn("w-full", className)} ref={ref}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.displayName = "Tabs";

// ============================================================================
// TabsList Component
// ============================================================================

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TabsList = ({
  className,
  children,
  ref,
  ...props
}: TabsListProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const state = React.useContext(TabsContext);
  const tabListRef = React.useRef<HTMLDivElement>(null);

  if (!state) {
    throw new Error("TabsList must be used within Tabs");
  }

  // Create collection items from children
  const items = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    return childrenArray.map((child, index) => {
      if (React.isValidElement<{ value?: string }>(child) && child.props.value) {
        return {
          key: child.props.value,
          rendered: child,
        };
      }
      return {
        key: `tab-${index}`,
        rendered: child,
      };
    });
  }, [children]);

  const { tabListProps } = useTabList(
    {
      ...props,
      "aria-label": props["aria-label"] || "Tabs",
    } as AriaTabListProps<object>,
    state,
    tabListRef
  );

  // Merge refs
  React.useImperativeHandle(ref, () => tabListRef.current as HTMLDivElement);

  return (
    <div
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-lg bg-[neutral-50] p-1 text-[neutral-400]",
        className
      )}
      ref={tabListRef}
      {...tabListProps}
    >
      {items.map((item) => item.rendered)}
    </div>
  );
};

TabsList.displayName = "TabsList";

// ============================================================================
// TabsTrigger Component
// ============================================================================

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

const TabsTrigger = ({
  className,
  value,
  children,
  ref,
  ...props
}: TabsTriggerProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
  const state = React.useContext(TabsContext);
  const tabRef = React.useRef<HTMLButtonElement>(null);

  if (!state) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const { tabProps } = useTab({ key: value }, state, tabRef);

  // Merge refs
  React.useImperativeHandle(ref, () => tabRef.current as HTMLButtonElement);

  const isSelected = state.selectedKey === value;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 font-medium text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[neutral-500] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected && "bg-[neutral-50] text-[neutral-900] shadow-sm",
        !isSelected && "text-[neutral-400] hover:text-[neutral-900]",
        className
      )}
      ref={tabRef}
      {...tabProps}
      {...props}
    >
      {children}
    </button>
  );
};

TabsTrigger.displayName = "TabsTrigger";

// ============================================================================
// TabsContent Component
// ============================================================================

interface TabsContentProps extends Omit<AriaTabPanelProps, "children"> {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const TabsContent = ({
  className,
  value,
  children,
  ref,
  ...props
}: TabsContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const state = React.useContext(TabsContext);
  const tabPanelRef = React.useRef<HTMLDivElement>(null);

  if (!state) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const { tabPanelProps } = useTabPanel(props, state, tabPanelRef);

  // Merge refs
  React.useImperativeHandle(ref, () => tabPanelRef.current as HTMLDivElement);

  // Only render if this panel is selected
  if (state.selectedKey !== value) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[neutral-500] focus-visible:ring-offset-2",
        className
      )}
      ref={tabPanelRef}
      {...tabPanelProps}
    >
      {children}
    </div>
  );
};

TabsContent.displayName = "TabsContent";

// ============================================================================
// Exports
// ============================================================================

export { Tabs, TabsList, TabsTrigger, TabsContent };
