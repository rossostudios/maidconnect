"use client";

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
      "whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-1.5 font-medium text-gray-600 text-xs transition hover:border-[#E85D48] hover:text-[#E85D48]",
      className
    )}
    onClick={() => onClickSuggestion?.(suggestion)}
    type="button"
    {...props}
  >
    {children ?? suggestion}
  </button>
);
