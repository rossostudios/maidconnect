/**
 * Keyboard Badge Component
 *
 * Displays keyboard keys in a styled badge (like Linear's UI).
 * Used in both the command palette and keyboard shortcuts panel.
 */

import { cn } from "@/lib/utils";

type KeyboardBadgeProps = {
  keys: string[];
  className?: string;
  size?: "sm" | "md";
};

export function KeyboardBadge({ keys, className, size = "md" }: KeyboardBadgeProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {keys.map((key, index) => (
        <span className="flex items-center gap-1" key={`${key}-${index}`}>
          <kbd
            className={cn(
              "inline-flex items-center justify-center rounded-lg border border-[#dcd6c7] bg-[#fefcf9] font-medium font-mono text-gray-600 shadow-sm",
              size === "sm" && "min-w-[28px] px-2.5 py-1.5 text-xs",
              size === "md" && "min-w-[32px] px-3 py-1.5 text-sm"
            )}
          >
            {key}
          </kbd>
          {/* Show "then" text between sequence keys */}
          {key === "then" && index < keys.length - 1 ? (
            <span className="px-1 text-[#7a6d62] text-xs">then</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/**
 * Single Key Badge (for simpler use cases)
 */
export function KeyBadge({ keyLabel, className }: { keyLabel: string; className?: string }) {
  return <KeyboardBadge className={className} keys={[keyLabel]} />;
}
