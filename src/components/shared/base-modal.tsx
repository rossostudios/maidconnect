"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

/**
 * BaseModal - Accessible, reusable modal foundation
 *
 * Features:
 * - Keyboard navigation (Escape to close, Tab trap)
 * - Focus management (auto-focus on open, restore on close)
 * - ARIA attributes for screen readers
 * - Configurable backdrop click behavior
 * - Body scroll prevention
 * - Smooth animations
 */
export function BaseModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className = "",
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, preventBodyScroll]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus modal on next tick
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      // Restore focus to previous element
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Focus trap - keep focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby={title ? "modal-title" : undefined}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200"
      onClick={handleBackdropClick}
      role="dialog"
    >
      <div
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-[28px] bg-white shadow-xl transition-transform duration-200 ${sizeClasses[size]} ${className}`}
        ref={modalRef}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#ebe5d8] bg-white px-6 py-5">
            <div className="flex-1 pr-8">
              {title && (
                <h2 className="font-semibold text-xl text-[#211f1a]" id="modal-title">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[#7a6d62]">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                aria-label="Close modal"
                className="rounded-full p-2 text-[#5d574b] transition hover:bg-[#ebe5d8]"
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
