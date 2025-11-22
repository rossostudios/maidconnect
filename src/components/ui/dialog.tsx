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
export const Dialog = ({ isOpen, defaultOpen, onOpenChange, children }: DialogProps) => (
  <AriaDialogTrigger defaultOpen={defaultOpen} isOpen={isOpen} onOpenChange={onOpenChange}>
    {children}
  </AriaDialogTrigger>
);

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
  /**
   * Ref to the trigger button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
}

export const DialogTrigger = ({ className, children, asChild, ref }: DialogTriggerProps) => {
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

/**
 * Dialog Portal Component
 *
 * Compatibility export - React Aria Modal handles portaling automatically.
 */
export const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

DialogPortal.displayName = "DialogPortal";

/**
 * Dialog Overlay Props
 */
export interface DialogOverlayProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Ref to the overlay element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Dialog Overlay Component
 *
 * Semi-transparent backdrop behind the dialog.
 * Lia Design System: neutral-900 with 80% opacity.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const DialogOverlay = ({ className, ref }: DialogOverlayProps) => {
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
  /**
   * Ref to the dialog element
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Dialog Content Component
 *
 * Main dialog container with close button.
 * Lia Design System: rounded-lg, white background, shadow-lg.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const DialogContent = ({ className, children, ref, ...props }: DialogContentProps) => {
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
          "data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:animate-in",
          "data-[entering]:slide-in-from-left-1/2 data-[entering]:slide-in-from-top-[48%]",
          "data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:animate-out",
          "data-[exiting]:slide-out-to-left-1/2 data-[exiting]:slide-out-to-top-[48%]",
          // Duration
          "duration-200"
        )}
      >
        <AriaDialog
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
          ref={ref}
          {...props}
        >
          {children}

          {/* Close Button */}
          <Button
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

/**
 * Dialog Header Props
 */
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
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
 * Dialog Header Component
 *
 * Container for dialog title and description.
 * Provides consistent spacing and layout.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const DialogHeader = ({ className, ref, ...props }: DialogHeaderProps) => {
  return (
    <div
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
      ref={ref}
      {...props}
    />
  );
};

/**
 * Dialog Footer Props
 * React 19: ref is a regular prop.
 */
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
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
 * Dialog Footer Component
 *
 * Container for dialog action buttons.
 * Responsive: stacked on mobile, row on desktop.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const DialogFooter = ({ className, ref, ...props }: DialogFooterProps) => {
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

/**
 * Dialog Title Props
 * React 19: ref is a regular prop.
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
  /**
   * Ref to the heading element
   */
  ref?: React.RefObject<HTMLHeadingElement | null>;
}

/**
 * Dialog Title Component
 *
 * Accessible heading for the dialog.
 * Lia Design System: text-lg, font-semibold, neutral-900.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const DialogTitle = ({ className, children, ref, ...props }: DialogTitleProps) => {
  return (
    <Heading
      className={cn(
        // Typography (Lia Design System)
        "font-semibold text-lg text-neutral-900",
        // Line height
        "leading-none tracking-tight",
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

/**
 * Dialog Description Props
 * React 19: ref is a regular prop.
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
  /**
   * Ref to the paragraph element
   */
  ref?: React.RefObject<HTMLParagraphElement | null>;
}

/**
 * Dialog Description Component
 *
 * Secondary text providing context for the dialog.
 * Lia Design System: text-sm, neutral-400.
 * React 19: Uses ref as regular prop instead of forwardRef.
 */
export const DialogDescription = ({
  className,
  children,
  ref,
  ...props
}: DialogDescriptionProps) => {
  return (
    <p
      className={cn(
        // Typography (Lia Design System)
        "text-neutral-400 text-sm",
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

/**
 * Dialog Close Component
 *
 * Button to close the dialog programmatically.
 * Use Button with slot="close" instead in most cases.
 * React 19: Uses ref as regular prop instead of forwardRef.
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
  /**
   * Ref to the button element
   */
  ref?: React.RefObject<HTMLButtonElement | null>;
}

export const DialogClose = ({ className, children, asChild, ref }: DialogCloseProps) => {
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
