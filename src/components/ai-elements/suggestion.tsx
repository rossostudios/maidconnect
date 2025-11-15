"use client";

/**
 * Suggestion Components - Lia Design System
 *
 * Quick reply suggestions with Geist Sans typography, sharp borders, and orange accents.
 */

import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SuggestionsProps = HTMLAttributes<HTMLDivElement>;

export const Suggestions = ({ className, children, ...props }: SuggestionsProps) => (
  <div className={cn("flex w-full snap-x gap-2 overflow-x-auto py-1", className)} {...props}>
    {children}
  </div>
);

export type SuggestionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  suggestion: string;
  onClickSuggestion?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClickSuggestion,
  className,
  children,
  ...props
}: SuggestionProps) => (
  <button
    className={cn(
      "whitespace-nowrap rounded-full border border-neutral-200 bg-white px-4 py-1.5 font-[family-name:var(--font-geist-sans)] font-medium text-neutral-700 text-xs transition-all hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 active:scale-95",
      className
    )}
    onClick={() => onClickSuggestion?.(suggestion)}
    type="button"
    {...props}
  >
    {children ?? suggestion}
  </button>
);
