import { type ComponentPropsWithoutRef } from "react";
import { GRID_COLUMNS } from "@/lib/shared/config/design-system";
import { cn } from "@/lib/utils/core";

/**
 * Lia Grid Container
 *
 * A modular grid container following structured layout principles.
 * Creates a modular grid with both columns AND rows (unlike standard CSS Grid).
 *
 * Key Features:
 * - Supports 6, 10, 12, and 13 column layouts
 * - Automatic baseline grid alignment
 * - Module-based vertical rhythm (64px units)
 * - Responsive design with mobile-first approach
 *
 * Usage:
 * ```tsx
 * <LiaGrid columns={12} gap={24} margin={24}>
 *   <GridField colSpan={8} rowSpan={4}>
 *     Content
 *   </GridField>
 * </LiaGrid>
 * ```
 */

type LiaGridProps = ComponentPropsWithoutRef<"div"> & {
  /** Number of columns: 6 (mobile), 10 (asymmetric), 12 (standard), or 13 (experimental) */
  columns?: 6 | 10 | 12 | 13;

  /** Gap between grid items in pixels (default: 24px from config) */
  gap?: 16 | 24;

  /** Left and right margin in pixels (default: from config) */
  margin?: 24 | 32 | 42;

  /** Number of modules tall (for explicit row grid). Each module = 64px */
  modules?: number;

  /** Container max-width (default: 1320px) */
  maxWidth?: number;

  /** Responsive: columns for different breakpoints */
  responsive?: {
    sm?: 6 | 10 | 12 | 13;
    md?: 6 | 10 | 12 | 13;
    lg?: 6 | 10 | 12 | 13;
  };
};

export const LiaGrid = ({
  className,
  children,
  columns = 12,
  gap,
  margin,
  modules,
  maxWidth = 1320,
  responsive,
  ref,
  ...props
}: LiaGridProps & { ref?: RefObject<HTMLDivElement | null> }) => {
  // Get config for the column layout
  const config = GRID_COLUMNS[columns];
  const actualGap = gap ?? config.gap;
  const actualMargin = margin ?? config.margin;

  // Build responsive column classes
  const responsiveClasses = [];
  if (responsive?.sm) {
    responsiveClasses.push(
      `sm:grid-cols-${responsive.sm === 10 || responsive.sm === 13 ? responsive.sm : 6}`
    );
  }
  if (responsive?.md) {
    responsiveClasses.push(
      `md:grid-cols-${responsive.md === 10 || responsive.md === 13 ? responsive.md : 12}`
    );
  }
  if (responsive?.lg) {
    responsiveClasses.push(
      `lg:grid-cols-${responsive.lg === 10 || responsive.lg === 13 ? responsive.lg : 12}`
    );
  }

  return (
    <div
      className={cn(
        "mx-auto grid w-full",
        // Base columns
        columns === 10 && "grid-cols-10",
        columns === 13 && "grid-cols-13",
        columns === 12 && "grid-cols-12",
        columns === 6 && "grid-cols-6",
        // Gap
        actualGap === 16 && "gap-4",
        actualGap === 24 && "gap-6",
        // Responsive
        ...responsiveClasses,
        className
      )}
      ref={ref}
      style={{
        maxWidth: `${maxWidth}px`,
        paddingLeft: `${actualMargin}px`,
        paddingRight: `${actualMargin}px`,
        // Optional explicit row grid (for true modular grid with rows)
        ...(modules && {
          gridTemplateRows: `repeat(${modules}, 64px)`,
          gridAutoRows: "64px",
        }),
      }}
      {...props}
    >
      {children}
    </div>
  );
};

LiaGrid.displayName = "LiaGrid";

/**
 * Lia Grid - Favorite Presets
 *
 * Pre-configured grid layouts for common use cases.
 */

/** 12-column grid: Standard, versatile layout */
export const LiaGrid12 = ({
  ref,
  ...props
}: Omit<LiaGridProps, "columns"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <LiaGrid columns={12} gap={24} margin={24} ref={ref} {...props} />
);
LiaGrid12.displayName = "LiaGrid12";

/** 10-column grid: Asymmetric balance, wider margins */
export const LiaGrid10 = ({
  ref,
  ...props
}: Omit<LiaGridProps, "columns"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <LiaGrid columns={10} gap={24} margin={42} ref={ref} {...props} />
);
LiaGrid10.displayName = "LiaGrid10";

/** 13-column grid: Dynamic tension, experimental feel */
export const LiaGrid13 = ({
  ref,
  ...props
}: Omit<LiaGridProps, "columns"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <LiaGrid columns={13} gap={16} margin={32} ref={ref} {...props} />
);
LiaGrid13.displayName = "LiaGrid13";

/**
 * Responsive Lia Grid
 *
 * Automatically adapts columns for different screen sizes:
 * - Mobile (< 640px): 6 columns
 * - Tablet (640px - 1024px): 10 columns
 * - Desktop (> 1024px): 12 columns
 */
export const LiaGridResponsive = ({
  ref,
  ...props
}: Omit<LiaGridProps, "columns" | "responsive"> & { ref?: RefObject<HTMLDivElement | null> }) => (
  <LiaGrid
    columns={6}
    gap={24}
    margin={24}
    ref={ref}
    responsive={{
      sm: 10,
      lg: 12,
    }}
    {...props}
  />
);
LiaGridResponsive.displayName = "LiaGridResponsive";
