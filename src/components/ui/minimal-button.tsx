import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface MinimalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

/**
 * MinimalButton - Clean, Simple Design
 *
 * Inspired by Auritis/Linear/Notion:
 * - Subtle colors
 * - Clean borders
 * - Simple hover states
 * - Minimal shadows
 */
export function MinimalButton({
  variant = "default",
  size = "md",
  className,
  children,
  isLoading,
  disabled,
  ...props
}: MinimalButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Variants
        variant === "default" &&
          "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 active:bg-neutral-900",
        variant === "secondary" &&
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-100",
        variant === "outline" &&
          "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 active:bg-white",
        variant === "ghost" && "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
        variant === "danger" &&
          "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-600",
        // Sizes
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4 text-sm",
        size === "lg" && "h-10 px-6 text-sm",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
