import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/core";

/**
 * Grid Field Component
 *
 * Represents a content zone within the Swiss Grid System that spans specific
 * columns and rows (modules). This is the fundamental building block for
 * creating modular layouts following Josef Müller-Brockmann's principles.
 *
 * Features:
 * - Spans specific number of columns
 * - Spans specific number of rows (64px modules)
 * - Automatically aligns to baseline grid
 * - Supports responsive column spans
 *
 * Usage:
 * ```tsx
 * <SwissGrid columns={12}>
 *   <GridField colSpan={8} rowSpan={4}>
 *     Main content area (8 columns × 4 modules = 8 cols × 256px)
 *   </GridField>
 *   <GridField colSpan={4} rowSpan={4}>
 *     Sidebar (4 columns × 4 modules)
 *   </GridField>
 * </SwissGrid>
 * ```
 */

type GridFieldProps = ComponentPropsWithoutRef<"div"> & {
  /** Number of columns to span (1-13) */
  colSpan?: number;

  /** Starting column (1-indexed). Default: auto-placement */
  colStart?: number;

  /** Number of rows (modules) to span. Each module = 64px */
  rowSpan?: number;

  /** Starting row (1-indexed). Default: auto-placement */
  rowStart?: number;

  /** Responsive column spans */
  responsive?: {
    sm?: { colSpan?: number; rowSpan?: number };
    md?: { colSpan?: number; rowSpan?: number };
    lg?: { colSpan?: number; rowSpan?: number };
  };

  /** Align content within field */
  align?: "start" | "center" | "end" | "stretch";

  /** Justify content within field */
  justify?: "start" | "center" | "end" | "stretch";
};

export const GridField = ({
  className,
  children,
  colSpan = 1,
  colStart,
  rowSpan = 1,
  rowStart,
  responsive,
  align = "start",
  justify = "start",
  ref,
  ...props
}: GridFieldProps & { ref?: RefObject<HTMLDivElement | null> }) => {
  // Build responsive classes
  const responsiveClasses = [];
  if (responsive?.sm?.colSpan) {
    responsiveClasses.push(`sm:col-span-${responsive.sm.colSpan}`);
  }
  if (responsive?.md?.colSpan) {
    responsiveClasses.push(`md:col-span-${responsive.md.colSpan}`);
  }
  if (responsive?.lg?.colSpan) {
    responsiveClasses.push(`lg:col-span-${responsive.lg.colSpan}`);
  }

  if (responsive?.sm?.rowSpan) {
    responsiveClasses.push(`sm:row-span-${responsive.sm.rowSpan}`);
  }
  if (responsive?.md?.rowSpan) {
    responsiveClasses.push(`md:row-span-${responsive.md.rowSpan}`);
  }
  if (responsive?.lg?.rowSpan) {
    responsiveClasses.push(`lg:row-span-${responsive.lg.rowSpan}`);
  }

  return (
    <div
      className={cn(
        // Column span
        `col-span-${colSpan}`,
        // Row span
        rowSpan > 0 && `row-span-${rowSpan}`,
        // Alignment
        align === "center" && "self-center",
        align === "end" && "self-end",
        align === "stretch" && "self-stretch",
        // Justification (for flex children)
        justify === "center" && "justify-self-center",
        justify === "end" && "justify-self-end",
        justify === "stretch" && "justify-self-stretch",
        // Responsive
        ...responsiveClasses,
        className
      )}
      ref={ref}
      style={{
        ...(colStart && { gridColumnStart: colStart }),
        ...(rowStart && { gridRowStart: rowStart }),
      }}
      {...props}
    >
      {children}
    </div>
  );
};

GridField.displayName = "GridField";

/**
 * Grid Field Presets for Common Layouts
 */

/** Full-width field (spans all columns) */
export const GridFieldFull = ({
  ref,
  ...props
}: Omit<GridFieldProps, "colSpan"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <GridField colSpan={12} ref={ref} {...props} />
);
GridFieldFull.displayName = "GridFieldFull";

/** Half-width field (6 columns in 12-col grid) */
export const GridFieldHalf = ({
  ref,
  ...props
}: Omit<GridFieldProps, "colSpan"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <GridField colSpan={6} ref={ref} {...props} />
);
GridFieldHalf.displayName = "GridFieldHalf";

/** Third-width field (4 columns in 12-col grid) */
export const GridFieldThird = ({
  ref,
  ...props
}: Omit<GridFieldProps, "colSpan"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <GridField colSpan={4} ref={ref} {...props} />
);
GridFieldThird.displayName = "GridFieldThird";

/** Two-thirds width field (8 columns in 12-col grid) */
export const GridFieldTwoThirds = ({
  ref,
  ...props
}: Omit<GridFieldProps, "colSpan"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <GridField colSpan={8} ref={ref} {...props} />
);
GridFieldTwoThirds.displayName = "GridFieldTwoThirds";

/** Quarter-width field (3 columns in 12-col grid) */
export const GridFieldQuarter = ({
  ref,
  ...props
}: Omit<GridFieldProps, "colSpan"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <GridField colSpan={3} ref={ref} {...props} />
);
GridFieldQuarter.displayName = "GridFieldQuarter";
