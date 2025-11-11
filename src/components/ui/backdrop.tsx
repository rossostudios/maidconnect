import { useEffect } from "react";

type BackdropProps = {
  onClose: () => void;
  className?: string;
  "aria-label"?: string;
};

/**
 * Accessible backdrop component for overlays, modals, and dropdowns.
 * Handles keyboard events (Escape, Enter, Space) and click-to-close.
 *
 * @example
 * <Backdrop onClose={() => setIsOpen(false)} aria-label="Close menu" />
 */
export function Backdrop({ onClose, className = "", "aria-label": ariaLabel }: BackdropProps) {
  // Handle escape key globally
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <button
      aria-label={ariaLabel || "Close overlay"}
      className={`fixed inset-0 cursor-default border-none bg-transparent p-0 ${className}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      type="button"
    />
  );
}
