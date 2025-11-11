/**
 * Base Modal - COMPATIBILITY WRAPPER
 *
 * This is a temporary wrapper around shadcn/ui Dialog
 * to maintain compatibility during component cleanup.
 *
 * TODO: Migrate all components to use Dialog directly
 */

"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = "md",
  showCloseButton: _showCloseButton = true,
}: BaseModalProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className={sizeClasses[size]}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className={className}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
