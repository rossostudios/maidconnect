/**
 * Type definitions for HugeIcons
 *
 * HugeIcons provides SVG icons as structured data objects.
 * This type represents the icon data format that @hugeicons/core-free-icons exports.
 */

/**
 * HugeIcon type represents the SVG path data structure
 * Each icon is an array of tuples containing SVG element names and their attributes
 */
export type HugeIcon =
  | ReadonlyArray<readonly [string, Readonly<Record<string, string | number>>]>
  | [string, Record<string, string | number>][];
