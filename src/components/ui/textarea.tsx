import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"textarea"> & { ref?: React.RefObject<HTMLTextAreaElement | null> }) => (
  <textarea
    className={cn(
      // Base layout
      "flex min-h-[80px] w-full px-3 py-2 text-base md:text-sm",
      // Lia Design System: rounded-lg, neutral borders
      "rounded-lg border border-neutral-200 bg-neutral-50",
      // Smooth transitions for hover and focus
      "transition-all duration-200",
      // Hover state
      "hover:border-neutral-300",
      // Focus state with rausch ring
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
      "focus-visible:border-rausch-500 focus-visible:bg-white",
      // Placeholder and disabled
      "placeholder:text-neutral-500",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
);
Textarea.displayName = "Textarea";

export { Textarea };
