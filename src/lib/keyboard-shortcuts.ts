/**
 * Keyboard Shortcuts Configuration
 *
 * Centralized configuration for all keyboard shortcuts in the application.
 * Inspired by Linear's keyboard shortcut system.
 */

import type { AppRole } from "./auth";

export type ShortcutCategory = "general" | "navigation" | "actions";

export type KeyboardShortcut = {
  id: string;
  category: ShortcutCategory;
  description: string;
  keys: string[]; // e.g., ["⌘", "K"] or ["G", "D"]
  keysWindows?: string[]; // Optional Windows-specific keys
  action: () => void | string; // Function to execute or route to navigate to
  roles?: AppRole[]; // If specified, only show for these roles
  sequence?: boolean; // If true, keys must be pressed in sequence (like "G then D")
};

/**
 * Get platform-specific modifier key symbol
 */
export function getModifierKey(): string {
  if (typeof window === "undefined") return "⌘";
  return navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl";
}

/**
 * Check if user is on Mac
 */
export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  return navigator.platform.toLowerCase().includes("mac");
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string[], keysWindows?: string[]): string[] {
  const isMacOS = isMac();
  const keysToUse = !isMacOS && keysWindows ? keysWindows : keys;

  return keysToUse.map((key) => {
    // Replace generic ⌘ with platform-specific modifier
    if (key === "⌘") {
      return getModifierKey();
    }
    return key;
  });
}

/**
 * All available keyboard shortcuts
 *
 * Note: Actions are defined as strings (routes) or "special" values that will be handled
 * by the global keyboard hook. The actual navigation/action is performed by the hook.
 */
export const KEYBOARD_SHORTCUTS: Omit<KeyboardShortcut, "action">[] = [
  // ========================================
  // GENERAL
  // ========================================
  {
    id: "open-command-palette",
    category: "general",
    description: "Open command menu",
    keys: ["⌘", "K"],
    keysWindows: ["Ctrl", "K"],
  },
  {
    id: "show-shortcuts",
    category: "general",
    description: "View keyboard shortcuts",
    keys: ["?"],
  },
  {
    id: "close-overlay",
    category: "general",
    description: "Close modal or overlay",
    keys: ["Esc"],
  },
  {
    id: "focus-search",
    category: "general",
    description: "Focus search",
    keys: ["/"],
  },

  // ========================================
  // NAVIGATION (G + key pattern)
  // ========================================
  {
    id: "goto-dashboard",
    category: "navigation",
    description: "Go to dashboard",
    keys: ["G", "then", "D"],
    sequence: true,
  },
  {
    id: "goto-bookings",
    category: "navigation",
    description: "Go to bookings",
    keys: ["G", "then", "B"],
    sequence: true,
  },
  {
    id: "goto-messages",
    category: "navigation",
    description: "Go to messages",
    keys: ["G", "then", "M"],
    sequence: true,
  },
  {
    id: "goto-profile",
    category: "navigation",
    description: "Go to profile",
    keys: ["G", "then", "P"],
    sequence: true,
    roles: ["professional"],
  },
  {
    id: "goto-favorites",
    category: "navigation",
    description: "Go to favorites",
    keys: ["G", "then", "F"],
    sequence: true,
    roles: ["customer"],
  },
  {
    id: "goto-payments",
    category: "navigation",
    description: "Go to payments",
    keys: ["G", "then", "$"],
    sequence: true,
    roles: ["customer"],
  },
  {
    id: "goto-finances",
    category: "navigation",
    description: "Go to finances",
    keys: ["G", "then", "$"],
    sequence: true,
    roles: ["professional"],
  },
  {
    id: "goto-availability",
    category: "navigation",
    description: "Go to availability",
    keys: ["G", "then", "A"],
    sequence: true,
    roles: ["professional"],
  },
  {
    id: "goto-portfolio",
    category: "navigation",
    description: "Go to portfolio",
    keys: ["G", "then", "O"],
    sequence: true,
    roles: ["professional"],
  },
  {
    id: "goto-addresses",
    category: "navigation",
    description: "Go to addresses",
    keys: ["G", "then", "L"],
    sequence: true,
    roles: ["customer"],
  },

  // ========================================
  // ACTIONS
  // ========================================
  {
    id: "new-booking",
    category: "actions",
    description: "New booking",
    keys: ["C"],
    roles: ["customer"],
  },
  {
    id: "new-availability",
    category: "actions",
    description: "Set availability",
    keys: ["N"],
    roles: ["professional"],
  },
];

/**
 * Get shortcuts filtered by role
 */
export function getShortcutsByRole(role?: AppRole): typeof KEYBOARD_SHORTCUTS {
  if (!role) return KEYBOARD_SHORTCUTS;

  return KEYBOARD_SHORTCUTS.filter((shortcut) => {
    if (!shortcut.roles) return true; // No role restriction
    return shortcut.roles.includes(role);
  });
}

/**
 * Get shortcuts by category
 */
export function getShortcutsByCategory(
  category: ShortcutCategory,
  role?: AppRole
): typeof KEYBOARD_SHORTCUTS {
  const shortcuts = getShortcutsByRole(role);
  return shortcuts.filter((s) => s.category === category);
}

/**
 * Category labels for UI
 */
export const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  general: "General",
  navigation: "Navigation",
  actions: "Actions",
};
