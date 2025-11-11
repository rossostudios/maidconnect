/**
 * Chart Components
 *
 * Recharts wrapper components with consistent neutral styling
 * Based on shadcn/ui chart patterns
 */

"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Chart container with responsive wrapper
const ChartContainer = ({
  children,
  config,
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  config: Record<string, { label: string; color?: string; icon?: React.ComponentType }>;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
} & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div className={cn("w-full", className)} ref={ref} {...props}>
    <RechartsPrimitive.ResponsiveContainer height="100%" width="100%">
      {children}
    </RechartsPrimitive.ResponsiveContainer>
  </div>
);

ChartContainer.displayName = "ChartContainer";

// Chart tooltip with custom styling
const ChartTooltip = RechartsPrimitive.Tooltip;

// Custom tooltip content
const ChartTooltipContent = ({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: any[];
  label?: string;
  indicator?: "line" | "dot" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: (value: any) => string;
  valueFormatter?: (value: any) => string;
} & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  if (!(active && payload?.length)) {
    return null;
  }

  return (
    <div
      className={cn("rounded-lg border border-slate-200 bg-white p-3 shadow-lg", className)}
      ref={ref}
      {...props}
    >
      {!hideLabel && label && (
        <div className="mb-2 font-medium text-slate-900 text-sm">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div className="flex items-center gap-2 text-sm" key={`item-${index}`}>
            {!hideIndicator && (
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  indicator === "line" && "h-[2px] w-4 rounded-none",
                  indicator === "dashed" && "h-[2px] w-4 rounded-none border-t-2 border-dashed"
                )}
                style={{ backgroundColor: entry.color }}
              />
            )}
            <span className="flex-1 text-slate-600">{entry.name}</span>
            <span className="font-semibold text-slate-900">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

ChartTooltipContent.displayName = "ChartTooltipContent";

// Chart legend
const ChartLegend = RechartsPrimitive.Legend;

// Custom legend content
const ChartLegendContent = ({
  className,
  payload,
  nameKey = "name",
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  payload?: any[];
  nameKey?: string;
} & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-4 pt-4", className)}
      ref={ref}
      {...props}
    >
      {payload.map((entry, index) => (
        <div className="flex items-center gap-2 text-sm" key={`legend-${index}`}>
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry[nameKey]}</span>
        </div>
      ))}
    </div>
  );
};

ChartLegendContent.displayName = "ChartLegendContent";

// Chart style helper
const ChartStyle = ({ config }: { config: Record<string, { color?: string }> }) => (
  <style>
    {Object.entries(config)
      .map(([key, value]) => {
        if (value.color) {
          return `--color-${key}: ${value.color};`;
        }
        return "";
      })
      .join("\n")}
  </style>
);

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
