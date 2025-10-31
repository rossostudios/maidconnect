/**
 * Global Keyboard Shortcuts Hook
 *
 * Handles all keyboard shortcuts in the application.
 * Manages state for Command Palette and Shortcuts Panel.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";
import type { AppRole } from "@/lib/auth";

export type KeyboardShortcutsState = {
  commandPaletteOpen: boolean;
  shortcutsPanelOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  openShortcutsPanel: () => void;
  closeShortcutsPanel: () => void;
  toggleShortcutsPanel: () => void;
  closeAll: () => void;
};

type UseKeyboardShortcutsOptions = {
  role?: AppRole;
  dashboardPath?: string; // e.g., "/dashboard/customer" or "/dashboard/pro"
};

/**
 * Global keyboard shortcuts hook
 *
 * Usage:
 * ```tsx
 * const shortcuts = useKeyboardShortcuts({ role: "customer", dashboardPath: "/dashboard/customer" });
 * ```
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {}
): KeyboardShortcutsState {
  const { role, dashboardPath } = options;
  const router = useRouter();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsPanelOpen, setShortcutsPanelOpen] = useState(false);

  // Track sequence for "G then X" shortcuts
  const lastKeyRef = useRef<string | null>(null);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset sequence after timeout
  const resetSequence = useCallback(() => {
    lastKeyRef.current = null;
    if (sequenceTimeoutRef.current) {
      clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
  }, []);

  // Open/close functions
  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), []);
  const toggleCommandPalette = useCallback(() => setCommandPaletteOpen((prev) => !prev), []);

  const openShortcutsPanel = useCallback(() => setShortcutsPanelOpen(true), []);
  const closeShortcutsPanel = useCallback(() => setShortcutsPanelOpen(false), []);
  const toggleShortcutsPanel = useCallback(() => setShortcutsPanelOpen((prev) => !prev), []);

  const closeAll = useCallback(() => {
    setCommandPaletteOpen(false);
    setShortcutsPanelOpen(false);
    resetSequence();
  }, [resetSequence]);

  // Navigate helper
  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      closeAll();
    },
    [router, closeAll]
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea/contenteditable
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Allow "/" in non-input contexts
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        // TODO: Focus search if available
        return;
      }

      // Allow shortcuts in input only for Cmd/Ctrl+K and Escape
      const isModifierKey = event.metaKey || event.ctrlKey;
      if (isTyping && !isModifierKey && event.key !== "Escape") {
        return;
      }

      // ⌘K / Ctrl+K - Open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        toggleCommandPalette();
        return;
      }

      // ? - Show keyboard shortcuts
      if (event.key === "?" && !isTyping) {
        event.preventDefault();
        toggleShortcutsPanel();
        return;
      }

      // Escape - Close everything
      if (event.key === "Escape") {
        event.preventDefault();
        closeAll();
        return;
      }

      // Don't handle other shortcuts if typing or if overlays are open
      if (isTyping || commandPaletteOpen || shortcutsPanelOpen) {
        return;
      }

      const key = event.key.toLowerCase();

      // Handle "G then X" sequences
      if (lastKeyRef.current === "g") {
        resetSequence();

        switch (key) {
          case "d": // Go to Dashboard
            if (dashboardPath) {
              navigate(dashboardPath);
            }
            break;
          case "b": // Go to Bookings
            if (role === "customer") {
              navigate("/dashboard/customer/bookings");
            }
            if (role === "professional") {
              navigate("/dashboard/pro/bookings");
            }
            break;
          case "m": // Go to Messages
            if (role === "customer") {
              navigate("/dashboard/customer/messages");
            }
            if (role === "professional") {
              navigate("/dashboard/pro/messages");
            }
            break;
          case "p": // Go to Profile (professional only)
            if (role === "professional") {
              navigate("/dashboard/pro/profile");
            }
            break;
          case "f": // Go to Favorites (customer only)
            if (role === "customer") {
              navigate("/dashboard/customer/favorites");
            }
            break;
          case "$": // Go to Payments/Finances
            if (role === "customer") {
              navigate("/dashboard/customer/payments");
            }
            if (role === "professional") {
              navigate("/dashboard/pro/finances");
            }
            break;
          case "a": // Go to Availability (professional only)
            if (role === "professional") {
              navigate("/dashboard/pro/availability");
            }
            break;
          case "o": // Go to Portfolio (professional only)
            if (role === "professional") {
              navigate("/dashboard/pro/portfolio");
            }
            break;
          case "l": // Go to Addresses (customer only)
            if (role === "customer") {
              navigate("/dashboard/customer/addresses");
            }
            break;
        }
        return;
      }

      // Start "G" sequence
      if (key === "g") {
        lastKeyRef.current = "g";
        // Reset after 1 second if no second key
        sequenceTimeoutRef.current = setTimeout(resetSequence, 1000);
        return;
      }

      // Single key shortcuts
      switch (key) {
        case "c": // New booking (customer)
          if (role === "customer") {
            navigate("/professionals");
          }
          break;
        case "n": // New availability (professional)
          if (role === "professional") {
            navigate("/dashboard/pro/availability");
          }
          break;
        case "f": // Find a professional (public)
          if (!role) {
            event.preventDefault();
            navigate("/professionals");
          }
          break;
        case "b": // Browse all professionals (public)
          if (!role) {
            event.preventDefault();
            navigate("/professionals");
          }
          break;
        case "l": // Login/Signup (public)
          if (!role) {
            event.preventDefault();
            navigate("/auth/sign-in");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      resetSequence();
    };
  }, [
    commandPaletteOpen,
    shortcutsPanelOpen,
    role,
    dashboardPath,
    toggleCommandPalette,
    toggleShortcutsPanel,
    closeAll,
    navigate,
    resetSequence,
  ]);

  return {
    commandPaletteOpen,
    shortcutsPanelOpen,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    openShortcutsPanel,
    closeShortcutsPanel,
    toggleShortcutsPanel,
    closeAll,
  };
}
