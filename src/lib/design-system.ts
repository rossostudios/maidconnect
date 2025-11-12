/**
 * Design System Constants
 *
 * Centralized design tokens and patterns using stone color palette only.
 */

// Card Layout Constants
export const CARD_LAYOUT = {
  base: "rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-200",
  hover: "hover:shadow-lg",
  elevated: "shadow-md",
  padding: "p-6",
  sectionGap: "gap-6",
  iconTopMargin: "mt-2",
} as const;

// Icon Container Constants
export const ICON_CONTAINER = {
  base: "flex h-10 w-10 items-center justify-center rounded-lg",
  default: "bg-stone-900/10 text-stone-900",
  muted: "bg-stone-100 text-stone-600",
  containerSize: "h-10 w-10",
  borderRadius: "rounded-lg",
  background: "bg-stone-100",
  padding: "p-2",
  iconSize: "h-5 w-5",
  iconColor: "text-stone-900",
} as const;

// Status Variants
export type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "pending"
  | "approved"
  | "review"
  | "blue"
  | "neutral";

export const STATUS_VARIANTS = {
  default: {
    bg: "bg-stone-100",
    text: "text-stone-900",
    border: "border-stone-200",
    container: "bg-stone-200",
    icon: "text-stone-700",
  },
  success: {
    bg: "bg-stone-50",
    text: "text-stone-900",
    border: "border-stone-200",
    container: "bg-stone-100",
    icon: "text-stone-800",
  },
  warning: {
    bg: "bg-stone-200",
    text: "text-stone-900",
    border: "border-stone-300",
    container: "bg-stone-300",
    icon: "text-stone-800",
  },
  error: {
    bg: "bg-stone-800",
    text: "text-white",
    border: "border-stone-900",
    container: "bg-stone-900",
    icon: "text-white",
  },
  info: {
    bg: "bg-stone-50",
    text: "text-stone-900",
    border: "border-stone-200",
    container: "bg-stone-100",
    icon: "text-stone-600",
  },
  pending: {
    bg: "bg-stone-200",
    text: "text-stone-700",
    border: "border-stone-300",
    container: "bg-stone-300",
    icon: "text-stone-700",
  },
  approved: {
    bg: "bg-stone-100",
    text: "text-stone-900",
    border: "border-stone-200",
    container: "bg-stone-200",
    icon: "text-stone-900",
  },
  review: {
    bg: "bg-stone-200",
    text: "text-stone-800",
    border: "border-stone-300",
    container: "bg-stone-300",
    icon: "text-stone-800",
  },
  blue: {
    bg: "bg-stone-300",
    text: "text-stone-900",
    border: "border-stone-400",
    container: "bg-stone-400",
    icon: "text-stone-900",
  },
  neutral: {
    bg: "bg-stone-100",
    text: "text-stone-600",
    border: "border-stone-200",
    container: "bg-stone-200",
    icon: "text-stone-600",
  },
} as const;
