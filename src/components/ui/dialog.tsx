"use client";

/**
 * Dialog Component (React Aria)
 *
 * Accessible modal dialog with overlay and Lia Design System styling.
 * Migrated from Radix UI to React Aria Components.
 *
 * Week 5: Component Libraries Consolidation - Task 2
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogTrigger>
 *     <Button>Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Dialog description text</DialogDescription>
 *     </DialogHeader>
 *     <div>Dialog body content</div>
 *     <DialogFooter>
 *       <Button>Cancel</Button>
 *       <Button>Confirm</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Modal,
  ModalOverlay,
  Button,
  Heading,
  type DialogProps as AriaDialogProps,
  type ModalOverlayProps,
} from "react-aria-components";
import * as React from "react";
import { cn } from "@/lib/utils/core";

/**
 * Dialog Root Props
 */
export interface DialogProps {
  /**
   * Whether the dialog is open (controlled)
   */
  isOpen?: boolean;
  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Children elements (DialogTrigger and DialogContent)
   */
  children: React.ReactNode;
}

/**
 * Dialog Root Component
 *
 * Container for dialog state management.
 * Uses React Aria for accessibility and keyboard interaction.
 */
export const Dialog = ({ isOpen, defaultOpen, onOpenChange, children }: DialogProps) => {
  return (
    <AriaDialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </AriaDialogTrigger>
  );
};

Dialog.displayName = "Dialog";

/**
 * Dialog Trigger Component
 *
 * Button that opens the dialog.
 * Wraps children - typically a Button component.
 */
export interface DialogTriggerProps {
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
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ className, children, asChild }, ref) => {
    // If asChild is true, just render the children directly
    // React Aria DialogTrigger will handle the button role
    if (asChild) {
      return <>{children}</>;
    }

    return (
      <Button ref={ref} className={className}>
        {children}
      </Button>
    );
  }
);

DialogTrigger.displayName = "DialogTrigger";

/**
 * Dialog Portal Component
 *
 * Compatibility export - React Aria Modal handles portaling automatically.
 */
export const DialogPortal = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

DialogPortal.displayName = "DialogPortal";

/**
 * Dialog Overlay Props
 */
export interface DialogOverlayProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Dialog Overlay Component
 *
 * Semi-transparent backdrop behind the dialog.
 * Lia Design System: neutral-900 with 80% opacity.
 */
export const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Position
          "fixed inset-0 z-50",
          // Background (Lia Design System)
          "bg-neutral-900/80",
          // Animation
          "data-[entering]:animate-in data-[entering]:fade-in-0",
          "data-[exiting]:animate-out data-[exiting]:fade-out-0",
          // Additional classes
          className
        )}
      />
    );
  }
);

DialogOverlay.displayName = "DialogOverlay";

/**
 * Dialog Content Props
 */
export interface DialogContentProps extends Omit<AriaDialogProps, "children"> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Dialog content
   */
  children: React.ReactNode;
}

/**
 * Dialog Content Component
 *
 * Main dialog container with close button.
 * Lia Design System: rounded-lg, white background, shadow-lg.
 */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ModalOverlay
        className={cn(
          // Position
          "fixed inset-0 z-50",
          // Flexbox centering
          "flex items-center justify-center",
          // Background
          "bg-neutral-900/80"
        )}
        isDismissable
      >
        <Modal
          className={cn(
            // Animation
            "data-[entering]:animate-in data-[entering]:fade-in-0 data-[entering]:zoom-in-95",
            "data-[entering]:slide-in-from-left-1/2 data-[entering]:slide-in-from-top-[48%]",
            "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
            "data-[exiting]:slide-out-to-left-1/2 data-[exiting]:slide-out-to-top-[48%]",
            // Duration
            "duration-200"
          )}
        >
          <AriaDialog
            ref={ref}
            className={cn(
              // Layout
              "relative grid w-full max-w-lg gap-4",
              // Border and background (Lia Design System)
              "border border-neutral-200 bg-white",
              // Shape - Lia Design System: rounded-lg (Anthropic)
              "rounded-lg",
              // Spacing
              "p-6",
              // Shadow
              "shadow-lg",
              // Additional classes
              className
            )}
            {...props}
          >
            {children}

            {/* Close Button */}
            <Button
              slot="close"
              className={cn(
                // Position
                "absolute top-4 right-4",
                // Styling
                "opacity-70 transition-opacity hover:opacity-100",
                // Focus state - orange ring (Lia Design System)
                "focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2",
                // Ring offset
                "ring-offset-white",
                // Disabled state
                "disabled:pointer-events-none"
              )}
            >
              <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
              <span className="sr-only">Close</span>
            </Button>
          </AriaDialog>
        </Modal>
      </ModalOverlay>
    );
  }
);

DialogContent.displayName = "DialogContent";

/**
 * Dialog Header Props
 */
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Dialog Header Component
 *
 * Container for dialog title and description.
 * Provides consistent spacing and layout.
 */
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Layout
          "flex flex-col",
          // Spacing
          "space-y-1.5",
          // Text alignment
          "text-center sm:text-left",
          // Additional classes
          className
        )}
        {...props}
      />
    );
  }
);

DialogHeader.displayName = "DialogHeader";

/**
 * Dialog Footer Props
 */
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Dialog Footer Component
 *
 * Container for dialog action buttons.
 * Responsive: stacked on mobile, row on desktop.
 */
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Layout
          "flex flex-col-reverse",
          // Responsive layout
          "sm:flex-row sm:justify-end sm:space-x-2",
          // Additional classes
          className
        )}
        {...props}
      />
    );
  }
);

DialogFooter.displayName = "DialogFooter";

/**
 * Dialog Title Props
 */
export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Title text
   */
  children: React.ReactNode;
}

/**
 * Dialog Title Component
 *
 * Accessible heading for the dialog.
 * Lia Design System: text-lg, font-semibold, neutral-900.
 */
export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Heading
        slot="title"
        ref={ref}
        className={cn(
          // Typography (Lia Design System)
          "text-lg font-semibold text-neutral-900",
          // Line height
          "leading-none tracking-tight",
          // Additional classes
          className
        )}
        {...props}
      >
        {children}
      </Heading>
    );
  }
);

DialogTitle.displayName = "DialogTitle";

/**
 * Dialog Description Props
 */
export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Description text
   */
  children: React.ReactNode;
}

/**
 * Dialog Description Component
 *
 * Secondary text providing context for the dialog.
 * Lia Design System: text-sm, neutral-400.
 */
export const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          // Typography (Lia Design System)
          "text-sm text-neutral-400",
          // Additional classes
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

DialogDescription.displayName = "DialogDescription";

/**
 * Dialog Close Component
 *
 * Button to close the dialog programmatically.
 * Use Button with slot="close" instead in most cases.
 */
export interface DialogCloseProps {
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
}

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, children, asChild }, ref) => {
    // If asChild, just render children - parent should be a Button
    if (asChild) {
      return <>{children}</>;
    }

    return (
      <Button slot="close" ref={ref} className={className}>
        {children}
      </Button>
    );
  }
);

DialogClose.displayName = "DialogClose";
