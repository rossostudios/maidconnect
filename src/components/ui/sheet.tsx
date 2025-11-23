"use client";

/**
 * Sheet Component (React Aria)
 *
 * Accessible slide-out panel with overlay and Lia Design System styling.
 * Built on React Aria Components.
 *
 * @example
 * ```tsx
 * <Sheet>
 *   <SheetTrigger>
 *     <Button>Open Sheet</Button>
 *   </SheetTrigger>
 *   <SheetContent side="right">
 *     <SheetHeader>
 *       <SheetTitle>Sheet Title</SheetTitle>
 *       <SheetDescription>Sheet description text</SheetDescription>
 *     </SheetHeader>
 *     <div>Sheet body content</div>
 *   </SheetContent>
 * </Sheet>
 * ```
 */

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  DialogTrigger as AriaDialogTrigger,
  Button,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { cn } from "@/lib/utils/core";

/**
 * Sheet variants for different slide directions
 */
const sheetVariants = cva(
  // Base styles
  cn(
    // Position
    "fixed z-50",
    // Background and border (Lia Design System)
    "border border-neutral-200 bg-white",
    // Shadow
    "shadow-lg",
    // Animation base
    "transition ease-in-out",
    // Duration
    "duration-300"
  ),
  {
    variants: {
      side: {
        top: cn(
          "inset-x-0 top-0",
          "border-b",
          "data-[entering]:slide-in-from-top data-[entering]:animate-in",
          "data-[exiting]:slide-out-to-top data-[exiting]:animate-out"
        ),
        bottom: cn(
          "inset-x-0 bottom-0",
          "rounded-t-lg border-t",
          "data-[entering]:slide-in-from-bottom data-[entering]:animate-in",
          "data-[exiting]:slide-out-to-bottom data-[exiting]:animate-out"
        ),
        left: cn(
          "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
          "border-r",
          "data-[entering]:slide-in-from-left data-[entering]:animate-in",
          "data-[exiting]:slide-out-to-left data-[exiting]:animate-out"
        ),
        right: cn(
          "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
          "border-l",
          "data-[entering]:slide-in-from-right data-[entering]:animate-in",
          "data-[exiting]:slide-out-to-right data-[exiting]:animate-out"
        ),
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

/**
 * Sheet Root Props
 */
export type SheetProps = {
  /**
   * Whether the sheet is open (controlled)
   */
  open?: boolean;
  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Children elements (SheetTrigger and SheetContent)
   */
  children: React.ReactNode;
};

/**
 * Sheet Root Component
 *
 * Container for sheet state management.
 * Uses React Aria for accessibility and keyboard interaction.
 */
export const Sheet = ({ open, defaultOpen, onOpenChange, children }: SheetProps) => (
  <AriaDialogTrigger defaultOpen={defaultOpen} isOpen={open} onOpenChange={onOpenChange}>
    {children}
  </AriaDialogTrigger>
);

Sheet.displayName = "Sheet";

/**
 * Sheet Trigger Props
 */
export type SheetTriggerProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Trigger element (typically a Button)
   */
  children: React.ReactNode;
  /**
   * Render as child (for composition)
   */
  asChild?: boolean;
  /**
   * Ref to the trigger button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
};

/**
 * Sheet Trigger Component
 *
 * Button that opens the sheet.
 * Wraps children - typically a Button component.
 */
export const SheetTrigger = ({ className, children, asChild, ref }: SheetTriggerProps) => {
  // If asChild is true, just render the children directly
  // React Aria DialogTrigger will handle the button role
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <Button className={className} ref={ref}>
      {children}
    </Button>
  );
};

SheetTrigger.displayName = "SheetTrigger";

/**
 * Sheet Portal Component
 *
 * Compatibility export - React Aria Modal handles portaling automatically.
 */
export const SheetPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

SheetPortal.displayName = "SheetPortal";

/**
 * Sheet Overlay Props
 */
export type SheetOverlayProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref to the overlay element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
};

/**
 * Sheet Overlay Component
 *
 * Semi-transparent backdrop behind the sheet.
 * Lia Design System: neutral-900 with 80% opacity.
 */
export const SheetOverlay = ({ className, ref }: SheetOverlayProps) => {
  return (
    <div
      className={cn(
        // Position
        "fixed inset-0 z-50",
        // Background (Lia Design System)
        "bg-neutral-900/80",
        // Animation
        "data-[entering]:fade-in-0 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:animate-out",
        // Additional classes
        className
      )}
      ref={ref}
    />
  );
};

SheetOverlay.displayName = "SheetOverlay";

/**
 * Sheet Content Props
 */
export interface SheetContentProps
  extends Omit<AriaDialogProps, "children">,
    VariantProps<typeof sheetVariants> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Sheet content
   */
  children: React.ReactNode;
  /**
   * Ref to the sheet element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Sheet Content Component
 *
 * Main sheet container with close button.
 * Lia Design System: white background, shadow-lg.
 */
export const SheetContent = ({
  className,
  children,
  side = "right",
  ref,
  ...props
}: SheetContentProps) => {
  return (
    <ModalOverlay
      className={cn(
        // Position
        "fixed inset-0 z-50",
        // Background
        "bg-neutral-900/80",
        // Animation
        "data-[entering]:fade-in-0 data-[entering]:animate-in",
        "data-[exiting]:fade-out-0 data-[exiting]:animate-out"
      )}
      isDismissable
    >
      <Modal className={cn(sheetVariants({ side }), className)}>
        <AriaDialog
          className={cn(
            // Layout
            "relative flex h-full flex-col",
            // Spacing
            "p-6",
            // Focus
            "outline-none"
          )}
          ref={ref}
          {...props}
        >
          {children}

          {/* Close Button */}
          <Button
            className={cn(
              // Position
              "absolute top-4 right-4",
              // Size
              "h-6 w-6",
              // Layout
              "flex items-center justify-center",
              // Shape - Lia Design System
              "rounded-sm",
              // Styling
              "opacity-70 transition-opacity hover:opacity-100",
              // Focus state - orange ring (Lia Design System)
              "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2",
              // Ring offset
              "ring-offset-white",
              // Disabled state
              "disabled:pointer-events-none"
            )}
            slot="close"
          >
            <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
            <span className="sr-only">Close</span>
          </Button>
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
};

SheetContent.displayName = "SheetContent";

/**
 * Sheet Header Props
 */
export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref to the header element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Sheet Header Component
 *
 * Container for sheet title and description.
 */
export const SheetHeader = ({ className, ref, ...props }: SheetHeaderProps) => {
  return (
    <div
      className={cn(
        // Layout
        "flex flex-col",
        // Spacing
        "space-y-2",
        // Additional classes
        className
      )}
      ref={ref}
      {...props}
    />
  );
};

SheetHeader.displayName = "SheetHeader";

/**
 * Sheet Footer Props
 */
export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref to the footer element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Sheet Footer Component
 *
 * Container for sheet action buttons.
 */
export const SheetFooter = ({ className, ref, ...props }: SheetFooterProps) => {
  return (
    <div
      className={cn(
        // Layout
        "flex flex-col-reverse",
        // Responsive layout
        "sm:flex-row sm:justify-end sm:space-x-2",
        // Additional classes
        className
      )}
      ref={ref}
      {...props}
    />
  );
};

SheetFooter.displayName = "SheetFooter";

/**
 * Sheet Title Props
 */
export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Title text
   */
  children: React.ReactNode;
  /**
   * Ref to the heading element
   */
  ref?: React.RefObject<HTMLHeadingElement | null>;
}

/**
 * Sheet Title Component
 *
 * Accessible heading for the sheet.
 * Lia Design System: text-lg, font-semibold, neutral-900.
 */
export const SheetTitle = ({ className, children, ref, ...props }: SheetTitleProps) => {
  return (
    <Heading
      className={cn(
        // Typography (Lia Design System)
        "font-semibold text-lg text-neutral-900",
        // Additional classes
        className
      )}
      ref={ref}
      slot="title"
      {...props}
    >
      {children}
    </Heading>
  );
};

SheetTitle.displayName = "SheetTitle";

/**
 * Sheet Description Props
 */
export interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Description text
   */
  children: React.ReactNode;
  /**
   * Ref to the paragraph element
   */
  ref?: React.RefObject<HTMLParagraphElement | null>;
}

/**
 * Sheet Description Component
 *
 * Secondary text providing context for the sheet.
 * Lia Design System: text-sm, neutral-400.
 */
export const SheetDescription = ({ className, children, ref, ...props }: SheetDescriptionProps) => {
  return (
    <p
      className={cn(
        // Typography (Lia Design System)
        "text-neutral-500 text-sm",
        // Additional classes
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
};

SheetDescription.displayName = "SheetDescription";

/**
 * Sheet Close Component
 *
 * Button to close the sheet programmatically.
 */
export type SheetCloseProps = {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Render as child (for composition)
   */
  asChild?: boolean;
  /**
   * Ref to the button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
};

export const SheetClose = ({ className, children, asChild, ref }: SheetCloseProps) => {
  // If asChild, just render children - parent should be a Button
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <Button className={className} ref={ref} slot="close">
      {children}
    </Button>
  );
};

SheetClose.displayName = "SheetClose";
