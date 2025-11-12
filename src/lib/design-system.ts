/**
 * Design System Constants
 *
 * Centralized design tokens and patterns using stone color palette only.
 */

// Card Layout Constants
export const CARD_LAYOUT = {
  base: "rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200",
  hover: "hover:shadow-lg",
  elevated: "shadow-md",
  padding: "p-6",
  sectionGap: "gap-6",
  iconTopMargin: "mt-2",
} as const;

// Icon Container Constants
export const ICON_CONTAINER = {
  base: "flex h-10 w-10 items-center justify-center rounded-lg",
  default: "bg-neutral-900/10 text-neutral-900",
  muted: "bg-neutral-100 text-neutral-600",
  containerSize: "h-10 w-10",
  borderRadius: "rounded-lg",
  background: "bg-neutral-100",
  padding: "p-2",
  iconSize: "h-5 w-5",
  iconColor: "text-neutral-900",
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
    bg: "bg-neutral-100",
    text: "text-neutral-900",
    border: "border-neutral-200",
    container: "bg-neutral-200",
    icon: "text-neutral-700",
  },
  success: {
    bg: "bg-neutral-50",
    text: "text-neutral-900",
    border: "border-neutral-200",
    container: "bg-neutral-100",
    icon: "text-neutral-800",
  },
  warning: {
    bg: "bg-neutral-200",
    text: "text-neutral-900",
    border: "border-neutral-300",
    container: "bg-neutral-300",
    icon: "text-neutral-800",
  },
  error: {
    bg: "bg-neutral-800",
    text: "text-white",
    border: "border-neutral-900",
    container: "bg-neutral-900",
    icon: "text-white",
  },
  info: {
    bg: "bg-neutral-50",
    text: "text-neutral-900",
    border: "border-neutral-200",
    container: "bg-neutral-100",
    icon: "text-neutral-600",
  },
  pending: {
    bg: "bg-neutral-200",
    text: "text-neutral-700",
    border: "border-neutral-300",
    container: "bg-neutral-300",
    icon: "text-neutral-700",
  },
  approved: {
    bg: "bg-neutral-100",
    text: "text-neutral-900",
    border: "border-neutral-200",
    container: "bg-neutral-200",
    icon: "text-neutral-900",
  },
  review: {
    bg: "bg-neutral-200",
    text: "text-neutral-800",
    border: "border-neutral-300",
    container: "bg-neutral-300",
    icon: "text-neutral-800",
  },
  blue: {
    bg: "bg-neutral-300",
    text: "text-neutral-900",
    border: "border-neutral-400",
    container: "bg-neutral-400",
    icon: "text-neutral-900",
  },
  neutral: {
    bg: "bg-neutral-100",
    text: "text-neutral-600",
    border: "border-neutral-200",
    container: "bg-neutral-200",
    icon: "text-neutral-600",
  },
} as const;
