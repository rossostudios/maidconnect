/**
 * Swiss Grid Typography Utilities
 *
 * Utilities for creating baseline-aligned typography following
 * Josef Müller-Brockmann's Swiss Grid System principles.
 *
 * All typography must align to the 24px baseline grid for
 * perfect vertical rhythm and visual harmony.
 */

/**
 * Baseline unit (24px = 3 × 8px)
 */
export const BASELINE = 24;

/**
 * Module unit (64px = 8 × 8px)
 */
export const MODULE = 64;

/**
 * Get baseline-aligned typography styles
 *
 * Calculates the correct line-height to maintain baseline grid alignment.
 * Line-height is always rounded up to the nearest baseline multiple.
 *
 * @param fontSize - Font size in pixels
 * @param baseline - Baseline unit (default: 24px)
 * @returns Object with fontSize and line-height in pixels
 *
 * @example
 * getBaselineTypography(18)
 * // Returns: { fontSize: '18px', lineHeight: '24px' }
 *
 * getBaselineTypography(32)
 * // Returns: { fontSize: '32px', lineHeight: '48px' }
 *
 * getBaselineTypography(56)
 * // Returns: { fontSize: '56px', lineHeight: '72px' }
 */
export function getBaselineTypography(
  fontSize: number,
  baseline: number = BASELINE
): {
  fontSize: string;
  lineHeight: string;
} {
  // Round up to nearest baseline multiple
  const lineHeight = Math.ceil(fontSize / baseline) * baseline;

  return {
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`,
  };
}

/**
 * Calculate number of modules for a given height
 *
 * Useful for determining how many 64px modules a component should span.
 *
 * @param heightPx - Height in pixels
 * @param module - Module unit (default: 64px)
 * @returns Number of modules (rounded up)
 *
 * @example
 * calculateModules(120) // Returns: 2 (2 × 64px = 128px)
 * calculateModules(200) // Returns: 4 (4 × 64px = 256px)
 */
export function calculateModules(heightPx: number, module: number = MODULE): number {
  return Math.ceil(heightPx / module);
}

/**
 * Get module-based height in pixels
 *
 * @param modules - Number of modules
 * @param module - Module unit (default: 64px)
 * @returns Height in pixels
 *
 * @example
 * getModuleHeight(3) // Returns: 192 (3 × 64px)
 * getModuleHeight(5) // Returns: 320 (5 × 64px)
 */
export function getModuleHeight(modules: number, module: number = MODULE): number {
  return modules * module;
}

/**
 * Swiss Grid Typography Scale
 *
 * Pre-defined baseline-aligned font sizes following Swiss design principles.
 * All sizes are calculated to maintain baseline grid alignment.
 */
export const TYPOGRAPHY_SCALE = {
  // Display sizes (for hero sections, landing pages)
  display: {
    xl: getBaselineTypography(72), // 72px / 72px line-height (3 × baseline)
    lg: getBaselineTypography(60), // 60px / 72px line-height
    md: getBaselineTypography(48), // 48px / 48px line-height (2 × baseline)
    sm: getBaselineTypography(40), // 40px / 48px line-height
  },

  // Heading sizes
  heading: {
    h1: getBaselineTypography(48), // 48px / 48px line-height
    h2: getBaselineTypography(36), // 36px / 48px line-height
    h3: getBaselineTypography(28), // 28px / 48px line-height
    h4: getBaselineTypography(24), // 24px / 24px line-height
    h5: getBaselineTypography(20), // 20px / 24px line-height
    h6: getBaselineTypography(18), // 18px / 24px line-height
  },

  // Body text sizes
  body: {
    xl: getBaselineTypography(20), // 20px / 24px line-height
    lg: getBaselineTypography(18), // 18px / 24px line-height
    base: getBaselineTypography(16), // 16px / 24px line-height
    sm: getBaselineTypography(14), // 14px / 24px line-height
    xs: getBaselineTypography(12), // 12px / 24px line-height
  },
} as const;

/**
 * Format typography object as className string
 *
 * @param typography - Typography object from getBaselineTypography()
 * @returns Tailwind CSS className string
 *
 * @example
 * const typo = getBaselineTypography(32);
 * formatTypographyClass(typo)
 * // Returns: "text-[32px] leading-[48px]"
 */
export function formatTypographyClass(
  typography: ReturnType<typeof getBaselineTypography>
): string {
  return `text-[${typography.fontSize}] leading-[${typography.lineHeight}]`;
}

/**
 * Check if a height value aligns to the baseline grid
 *
 * @param heightPx - Height in pixels
 * @param baseline - Baseline unit (default: 24px)
 * @returns true if height is a multiple of baseline
 *
 * @example
 * isBaselineAligned(48) // true (48 = 2 × 24)
 * isBaselineAligned(50) // false
 */
export function isBaselineAligned(heightPx: number, baseline: number = BASELINE): boolean {
  return heightPx % baseline === 0;
}

/**
 * Check if a height value aligns to the module grid
 *
 * @param heightPx - Height in pixels
 * @param module - Module unit (default: 64px)
 * @returns true if height is a multiple of module
 *
 * @example
 * isModuleAligned(128) // true (128 = 2 × 64)
 * isModuleAligned(100) // false
 */
export function isModuleAligned(heightPx: number, module: number = MODULE): boolean {
  return heightPx % module === 0;
}
