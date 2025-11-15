import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface MinimalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

/**
 * MinimalInput - Clean, Simple Design
 *
 * Inspired by Auritis/Linear/Notion:
 * - Clean borders
 * - Subtle focus states
 * - Clear error states
 * - Minimal styling
 */
export function MinimalInput({ label, error, helper, className, ...props }: MinimalInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block font-medium text-neutral-700 text-sm" htmlFor={props.id}>
          {label}
        </label>
      )}
      <input
        className={cn(
          "flex h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 text-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-neutral-500 focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-400/20",
          className
        )}
        {...props}
      />
      {helper && !error && <p className="mt-1.5 text-neutral-600 text-xs">{helper}</p>}
      {error && <p className="mt-1.5 text-red-600 text-xs">{error}</p>}
    </div>
  );
}

interface MinimalTextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  rows?: number;
}

/**
 * MinimalTextarea - Clean, Simple Design
 */
export function MinimalTextarea({
  label,
  error,
  helper,
  className,
  rows = 4,
  ...props
}: MinimalTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block font-medium text-neutral-700 text-sm" htmlFor={props.id}>
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 text-sm transition-colors placeholder:text-neutral-500 focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-400/20",
          className
        )}
        rows={rows}
        {...props}
      />
      {helper && !error && <p className="mt-1.5 text-neutral-600 text-xs">{helper}</p>}
      {error && <p className="mt-1.5 text-red-600 text-xs">{error}</p>}
    </div>
  );
}

interface MinimalSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: { value: string; label: string }[];
}

/**
 * MinimalSelect - Clean, Simple Design
 */
export function MinimalSelect({
  label,
  error,
  helper,
  options,
  className,
  ...props
}: MinimalSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block font-medium text-neutral-700 text-sm" htmlFor={props.id}>
          {label}
        </label>
      )}
      <select
        className={cn(
          "flex h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 text-sm transition-colors focus-visible:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/20 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-400/20",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper && !error && <p className="mt-1.5 text-neutral-600 text-xs">{helper}</p>}
      {error && <p className="mt-1.5 text-red-600 text-xs">{error}</p>}
    </div>
  );
}
