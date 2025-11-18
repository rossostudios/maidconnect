import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const kbdVariants = cva(
  "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-muted-foreground text-xs opacity-100",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-input bg-background",
      },
      size: {
        default: "h-5 text-xs",
        sm: "h-4 text-xs",
        lg: "h-6 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
  abbrTitle?: string;
}

const Kbd = ({
  className,
  variant,
  size,
  abbrTitle,
  children,
  ref,
  ...props
}: KbdProps & { ref?: React.RefObject<HTMLElement | null> }) => (
  <kbd className={cn(kbdVariants({ variant, size, className }))} ref={ref} {...props}>
    {abbrTitle ? <abbr title={abbrTitle}>{children}</abbr> : children}
  </kbd>
);
Kbd.displayName = "Kbd";

const KbdGroup = ({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div className={cn("flex items-center gap-1", className)} ref={ref} {...props} />
);
KbdGroup.displayName = "KbdGroup";

export { Kbd, KbdGroup, kbdVariants };
