import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Orange primary CTA button (default)
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-orange-600 active:scale-[0.98] active:bg-orange-700",
        // Destructive actions (orange-700)
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-orange-800 active:scale-[0.98]",
        // Outline with orange accent on hover
        outline:
          "border-2 border-neutral-200 bg-background shadow-sm hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]",
        // Neutral secondary button
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-neutral-300 active:scale-[0.98]",
        // Ghost with orange accent on hover
        ghost: "hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]",
        // Link with neutral color like Aurius
        link: "text-neutral-900 underline-offset-4 hover:text-neutral-700 hover:underline",
      },
      size: {
        default: "h-10 px-8 py-2",
        sm: "h-9 rounded-md px-6 text-sm",
        lg: "h-11 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
};
Button.displayName = "Button";

export { Button, buttonVariants };
