import { cn } from "@/lib/utils";

type TextStackProps = {
  title: string;
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
};

/**
 * TextStack - Lia Design System
 *
 * Standardized title + description text pattern:
 * - Tight line-height (leading-none) on both elements
 * - 2px gap (mt-0.5) between title and description
 * - Consistent typography: text-sm title, text-xs description
 *
 * Usage:
 * <TextStack title="Dashboard" description="Overview & stats" />
 */
export function TextStack({
  title,
  description,
  titleClassName,
  descriptionClassName,
  className,
}: TextStackProps) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", className)}>
      <span className={cn("font-medium text-neutral-900 text-sm leading-none", titleClassName)}>
        {title}
      </span>
      {description && (
        <span className={cn("mt-0.5 text-neutral-500 text-xs leading-none", descriptionClassName)}>
          {description}
        </span>
      )}
    </div>
  );
}

/**
 * TruncatedTextStack - Same as TextStack but with truncation
 *
 * Useful for user names, emails, or other potentially long content
 */
export function TruncatedTextStack({
  title,
  description,
  titleClassName,
  descriptionClassName,
  className,
}: TextStackProps) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", className)}>
      <span
        className={cn("truncate font-medium text-neutral-900 text-sm leading-none", titleClassName)}
      >
        {title}
      </span>
      {description && (
        <span
          className={cn(
            "mt-0.5 truncate text-neutral-500 text-xs leading-none",
            descriptionClassName
          )}
        >
          {description}
        </span>
      )}
    </div>
  );
}
