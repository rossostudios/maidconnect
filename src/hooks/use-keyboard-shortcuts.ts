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

  // Check if user is typing in an input field
  const isTypingInInput = useCallback(
    (target: HTMLElement): boolean =>
      target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable,
    []
  );

  // Handle global shortcuts (command palette, help, escape)
  const handleGlobalShortcuts = useCallback(
    (event: KeyboardEvent, isTyping: boolean): boolean => {
      // ⌘K / Ctrl+K - Open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        toggleCommandPalette();
        return true;
      }

      // ? - Show keyboard shortcuts
      if (event.key === "?" && !isTyping) {
        event.preventDefault();
        toggleShortcutsPanel();
        return true;
      }

      // Escape - Close everything
      if (event.key === "Escape") {
        event.preventDefault();
        closeAll();
        return true;
      }

      return false;
    },
    [toggleCommandPalette, toggleShortcutsPanel, closeAll]
  );

  // Handle "G then X" navigation sequences
  const handleGSequence = useCallback(
    (key: string) => {
      resetSequence();

      const gSequenceHandlers: Record<string, () => void> = {
        d: () => dashboardPath && navigate(dashboardPath),
        b: () => {
          if (role === "customer") {
            navigate("/dashboard/customer/bookings");
          }
          if (role === "professional") {
            navigate("/dashboard/pro/bookings");
          }
        },
        m: () => {
          if (role === "customer") {
            navigate("/dashboard/customer/messages");
          }
          if (role === "professional") {
            navigate("/dashboard/pro/messages");
          }
        },
        p: () => role === "professional" && navigate("/dashboard/pro/profile"),
        f: () => role === "customer" && navigate("/dashboard/customer/favorites"),
        $: () => {
          if (role === "customer") {
            navigate("/dashboard/customer/payments");
          }
          if (role === "professional") {
            navigate("/dashboard/pro/finances");
          }
        },
        a: () => role === "professional" && navigate("/dashboard/pro/availability"),
        o: () => role === "professional" && navigate("/dashboard/pro/portfolio"),
        l: () => role === "customer" && navigate("/dashboard/customer/addresses"),
      };

      gSequenceHandlers[key]?.();
    },
    [role, dashboardPath, navigate, resetSequence]
  );

  // Handle single key shortcuts
  const handleSingleKeyShortcuts = useCallback(
    (key: string, event: KeyboardEvent) => {
      const singleKeyHandlers: Record<string, () => void> = {
        c: () => role === "customer" && navigate("/professionals"),
        n: () => role === "professional" && navigate("/dashboard/pro/availability"),
        f: () => {
          if (!role) {
            event.preventDefault();
            navigate("/professionals");
          }
        },
        b: () => {
          if (!role) {
            event.preventDefault();
            navigate("/professionals");
          }
        },
        l: () => {
          if (!role) {
            event.preventDefault();
            navigate("/auth/sign-in");
          }
        },
      };

      singleKeyHandlers[key]?.();
    },
    [role, navigate]
  );

  // Should shortcuts be blocked for current context
  const shouldBlockShortcuts = useCallback(
    (isTyping: boolean): boolean => isTyping || commandPaletteOpen || shortcutsPanelOpen,
    [commandPaletteOpen, shortcutsPanelOpen]
  );

  // Handle search shortcut
  const handleSearchShortcut = useCallback((event: KeyboardEvent, isTyping: boolean): boolean => {
    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      // TODO: Focus search if available
      return true;
    }
    return false;
  }, []);

  // Check if shortcut should be allowed while typing
  const isAllowedWhileTyping = useCallback((event: KeyboardEvent): boolean => {
    const isModifierKey = event.metaKey || event.ctrlKey;
    return isModifierKey || event.key === "Escape";
  }, []);

  // Handle navigation sequences and single key shortcuts
  const handleNavigationShortcuts = useCallback(
    (key: string, event: KeyboardEvent) => {
      // Handle "G then X" sequences
      if (lastKeyRef.current === "g") {
        handleGSequence(key);
        return;
      }

      // Start "G" sequence
      if (key === "g") {
        lastKeyRef.current = "g";
        sequenceTimeoutRef.current = setTimeout(resetSequence, 1000);
        return;
      }

      // Handle single key shortcuts
      handleSingleKeyShortcuts(key, event);
    },
    [handleGSequence, handleSingleKeyShortcuts, resetSequence]
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = isTypingInInput(target);

      // Handle search shortcut
      if (handleSearchShortcut(event, isTyping)) {
        return;
      }

      // Block shortcuts while typing (except allowed ones)
      if (isTyping && !isAllowedWhileTyping(event)) {
        return;
      }

      // Handle global shortcuts first
      if (handleGlobalShortcuts(event, isTyping)) {
        return;
      }

      // Block other shortcuts if typing or overlays open
      if (shouldBlockShortcuts(isTyping)) {
        return;
      }

      const key = event.key.toLowerCase();

      // Handle navigation shortcuts
      handleNavigationShortcuts(key, event);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      resetSequence();
    };
  }, [
    isTypingInInput,
    handleSearchShortcut,
    isAllowedWhileTyping,
    handleGlobalShortcuts,
    shouldBlockShortcuts,
    resetSequence, // Handle navigation shortcuts
    handleNavigationShortcuts,
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
