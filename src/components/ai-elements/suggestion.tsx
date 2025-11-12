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
      "whitespace-nowrap rounded-full border border-[neutral-200] bg-[neutral-50] px-4 py-1.5 font-medium text-[neutral-400] text-xs transition hover:border-[neutral-500] hover:text-[neutral-500]",
      className
    )}
    onClick={() => onClickSuggestion?.(suggestion)}
    type="button"
    {...props}
  >
    {children ?? suggestion}
  </button>
);
