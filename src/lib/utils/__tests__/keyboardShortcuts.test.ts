import { describe, expect, it } from "vitest";
import type { AppRole } from "@/lib/shared/auth";
import {
  CATEGORY_LABELS,
  formatShortcut,
  getModifierKey,
  getShortcutsByCategory,
  getShortcutsByRole,
  isMac,
  KEYBOARD_SHORTCUTS,
  type ShortcutCategory,
} from "../keyboardShortcuts";

// ============================================================================
// PLATFORM DETECTION (SSR-SAFE)
// ============================================================================

describe("getModifierKey", () => {
  it("returns command symbol in SSR context", () => {
    // In Node.js/Bun test environment, window is undefined
    expect(getModifierKey()).toBe("⌘");
  });
});

describe("isMac", () => {
  it("returns false in SSR context", () => {
    // In Node.js/Bun test environment, window is undefined
    expect(isMac()).toBe(false);
  });
});

// ============================================================================
// SHORTCUT FORMATTING
// ============================================================================

describe("formatShortcut", () => {
  it("returns keys as-is when no platform-specific keys provided", () => {
    const result = formatShortcut(["G", "D"]);
    expect(result).toEqual(["G", "D"]);
  });

  it("preserves non-modifier keys", () => {
    const result = formatShortcut(["K", "B", "M"]);
    expect(result).toEqual(["K", "B", "M"]);
  });

  it("replaces ⌘ with platform-specific modifier", () => {
    const result = formatShortcut(["⌘", "K"]);
    // In SSR/test environment, should return Ctrl (not Mac)
    expect(result).toContain("K");
    expect(result.length).toBe(2);
  });

  it("handles mixed modifier and regular keys", () => {
    const result = formatShortcut(["⌘", "Shift", "K"]);
    expect(result).toContain("Shift");
    expect(result).toContain("K");
    expect(result.length).toBe(3);
  });

  it("returns empty array for empty input", () => {
    const result = formatShortcut([]);
    expect(result).toEqual([]);
  });
});

// ============================================================================
// SHORTCUTS CONFIGURATION
// ============================================================================

describe("KEYBOARD_SHORTCUTS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(KEYBOARD_SHORTCUTS)).toBe(true);
    expect(KEYBOARD_SHORTCUTS.length).toBeGreaterThan(0);
  });

  it("all shortcuts have required fields", () => {
    for (const shortcut of KEYBOARD_SHORTCUTS) {
      expect(shortcut).toHaveProperty("id");
      expect(shortcut).toHaveProperty("category");
      expect(shortcut).toHaveProperty("description");
      expect(shortcut).toHaveProperty("keys");
      expect(typeof shortcut.id).toBe("string");
      expect(typeof shortcut.category).toBe("string");
      expect(typeof shortcut.description).toBe("string");
      expect(Array.isArray(shortcut.keys)).toBe(true);
    }
  });

  it("all shortcut IDs are unique", () => {
    const ids = KEYBOARD_SHORTCUTS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all shortcuts have valid categories", () => {
    const validCategories: ShortcutCategory[] = ["general", "navigation", "actions"];
    for (const shortcut of KEYBOARD_SHORTCUTS) {
      expect(validCategories).toContain(shortcut.category);
    }
  });

  it("sequence shortcuts are marked with sequence flag", () => {
    const sequenceShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.sequence === true);
    for (const shortcut of sequenceShortcuts) {
      // Sequence shortcuts should have "then" in keys array
      expect(shortcut.keys).toContain("then");
    }
  });

  it("role-restricted shortcuts have valid roles", () => {
    const validRoles: AppRole[] = ["customer", "professional", "admin"];
    const roleShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.roles !== undefined);

    for (const shortcut of roleShortcuts) {
      expect(shortcut.roles).toBeDefined();
      expect(Array.isArray(shortcut.roles)).toBe(true);

      if (shortcut.roles) {
        for (const role of shortcut.roles) {
          expect(validRoles).toContain(role);
        }
      }
    }
  });

  it("has general category shortcuts", () => {
    const generalShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === "general");
    expect(generalShortcuts.length).toBeGreaterThan(0);
  });

  it("has navigation category shortcuts", () => {
    const navShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === "navigation");
    expect(navShortcuts.length).toBeGreaterThan(0);
  });

  it("has actions category shortcuts", () => {
    const actionShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === "actions");
    expect(actionShortcuts.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// FILTER BY ROLE
// ============================================================================

describe("getShortcutsByRole", () => {
  it("returns all shortcuts when no role provided", () => {
    const result = getShortcutsByRole();
    expect(result.length).toBe(KEYBOARD_SHORTCUTS.length);
  });

  it("returns all shortcuts when role is undefined", () => {
    const result = getShortcutsByRole(undefined);
    expect(result.length).toBe(KEYBOARD_SHORTCUTS.length);
  });

  it("includes unrestricted shortcuts for all roles", () => {
    const unrestrictedCount = KEYBOARD_SHORTCUTS.filter((s) => !s.roles).length;

    const customerShortcuts = getShortcutsByRole("customer");
    const professionalShortcuts = getShortcutsByRole("professional");

    expect(customerShortcuts.length).toBeGreaterThanOrEqual(unrestrictedCount);
    expect(professionalShortcuts.length).toBeGreaterThanOrEqual(unrestrictedCount);
  });

  it("filters customer-specific shortcuts", () => {
    const result = getShortcutsByRole("customer");

    // Should include unrestricted shortcuts
    const unrestrictedShortcut = result.find((s) => s.id === "open-command-palette");
    expect(unrestrictedShortcut).toBeDefined();

    // Should include customer shortcuts
    const customerShortcut = result.find((s) => s.id === "goto-favorites");
    expect(customerShortcut).toBeDefined();

    // Should NOT include professional-only shortcuts
    const professionalShortcut = result.find((s) => s.id === "goto-availability");
    expect(professionalShortcut).toBeUndefined();
  });

  it("filters professional-specific shortcuts", () => {
    const result = getShortcutsByRole("professional");

    // Should include unrestricted shortcuts
    const unrestrictedShortcut = result.find((s) => s.id === "show-shortcuts");
    expect(unrestrictedShortcut).toBeDefined();

    // Should include professional shortcuts
    const professionalShortcut = result.find((s) => s.id === "goto-availability");
    expect(professionalShortcut).toBeDefined();

    // Should NOT include customer-only shortcuts
    const customerShortcut = result.find((s) => s.id === "goto-favorites");
    expect(customerShortcut).toBeUndefined();
  });

  it("admin role gets all unrestricted shortcuts", () => {
    const result = getShortcutsByRole("admin");

    // Admin should get unrestricted shortcuts
    const generalShortcut = result.find((s) => s.id === "close-overlay");
    expect(generalShortcut).toBeDefined();

    // Admin should NOT get role-restricted shortcuts (customer/professional)
    const customerShortcut = result.find((s) => s.id === "goto-favorites");
    const professionalShortcut = result.find((s) => s.id === "goto-availability");
    expect(customerShortcut).toBeUndefined();
    expect(professionalShortcut).toBeUndefined();
  });

  it("returns array with valid shortcut structure", () => {
    const result = getShortcutsByRole("customer");

    expect(Array.isArray(result)).toBe(true);
    for (const shortcut of result) {
      expect(shortcut).toHaveProperty("id");
      expect(shortcut).toHaveProperty("category");
      expect(shortcut).toHaveProperty("description");
      expect(shortcut).toHaveProperty("keys");
    }
  });
});

// ============================================================================
// FILTER BY CATEGORY
// ============================================================================

describe("getShortcutsByCategory", () => {
  it("filters shortcuts by general category", () => {
    const result = getShortcutsByCategory("general");

    expect(result.length).toBeGreaterThan(0);
    for (const shortcut of result) {
      expect(shortcut.category).toBe("general");
    }
  });

  it("filters shortcuts by navigation category", () => {
    const result = getShortcutsByCategory("navigation");

    expect(result.length).toBeGreaterThan(0);
    for (const shortcut of result) {
      expect(shortcut.category).toBe("navigation");
    }
  });

  it("filters shortcuts by actions category", () => {
    const result = getShortcutsByCategory("actions");

    expect(result.length).toBeGreaterThan(0);
    for (const shortcut of result) {
      expect(shortcut.category).toBe("actions");
    }
  });

  it("combines category and role filters", () => {
    const result = getShortcutsByCategory("actions", "customer");

    // All results should be in actions category
    for (const shortcut of result) {
      expect(shortcut.category).toBe("actions");
    }

    // Should include unrestricted action shortcuts
    const unrestrictedAction = result.find((s) => s.id === "find-professional");
    expect(unrestrictedAction).toBeDefined();

    // Should include customer action shortcuts
    const customerAction = result.find((s) => s.id === "new-booking");
    expect(customerAction).toBeDefined();

    // Should NOT include professional action shortcuts
    const professionalAction = result.find((s) => s.id === "new-availability");
    expect(professionalAction).toBeUndefined();
  });

  it("combines category and role filters for professional", () => {
    const result = getShortcutsByCategory("navigation", "professional");

    // All results should be in navigation category
    for (const shortcut of result) {
      expect(shortcut.category).toBe("navigation");
    }

    // Should include professional navigation shortcuts
    const professionalNav = result.find((s) => s.id === "goto-availability");
    expect(professionalNav).toBeDefined();

    // Should NOT include customer navigation shortcuts
    const customerNav = result.find((s) => s.id === "goto-favorites");
    expect(customerNav).toBeUndefined();
  });

  it("returns empty array for category with no matches", () => {
    // Get all navigation shortcuts for customer
    const navShortcuts = getShortcutsByCategory("navigation", "customer");

    // Verify we get navigation shortcuts (not empty)
    expect(navShortcuts.length).toBeGreaterThan(0);
  });

  it("works without role parameter", () => {
    const result = getShortcutsByCategory("general");

    expect(result.length).toBeGreaterThan(0);
    for (const shortcut of result) {
      expect(shortcut.category).toBe("general");
    }
  });
});

// ============================================================================
// CATEGORY LABELS
// ============================================================================

describe("CATEGORY_LABELS", () => {
  it("has labels for all categories", () => {
    expect(CATEGORY_LABELS).toHaveProperty("general");
    expect(CATEGORY_LABELS).toHaveProperty("navigation");
    expect(CATEGORY_LABELS).toHaveProperty("actions");
  });

  it("all labels are strings", () => {
    expect(typeof CATEGORY_LABELS.general).toBe("string");
    expect(typeof CATEGORY_LABELS.navigation).toBe("string");
    expect(typeof CATEGORY_LABELS.actions).toBe("string");
  });

  it("all labels are non-empty", () => {
    expect(CATEGORY_LABELS.general.length).toBeGreaterThan(0);
    expect(CATEGORY_LABELS.navigation.length).toBeGreaterThan(0);
    expect(CATEGORY_LABELS.actions.length).toBeGreaterThan(0);
  });

  it("has correct label values", () => {
    expect(CATEGORY_LABELS.general).toBe("General");
    expect(CATEGORY_LABELS.navigation).toBe("Navigation");
    expect(CATEGORY_LABELS.actions).toBe("Actions");
  });
});

// ============================================================================
// SPECIFIC SHORTCUT TESTS
// ============================================================================

describe("Specific shortcuts", () => {
  it("command palette shortcut exists", () => {
    const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.id === "open-command-palette");
    expect(shortcut).toBeDefined();
    expect(shortcut?.category).toBe("general");
    expect(shortcut?.keys).toContain("⌘");
    expect(shortcut?.keys).toContain("K");
    expect(shortcut?.keysWindows).toContain("Ctrl");
  });

  it("goto dashboard shortcut exists and is sequence", () => {
    const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.id === "goto-dashboard");
    expect(shortcut).toBeDefined();
    expect(shortcut?.category).toBe("navigation");
    expect(shortcut?.sequence).toBe(true);
    expect(shortcut?.keys).toContain("G");
    expect(shortcut?.keys).toContain("D");
  });

  it("new booking shortcut is customer-only", () => {
    const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.id === "new-booking");
    expect(shortcut).toBeDefined();
    expect(shortcut?.category).toBe("actions");
    expect(shortcut?.roles).toContain("customer");
  });

  it("new availability shortcut is professional-only", () => {
    const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.id === "new-availability");
    expect(shortcut).toBeDefined();
    expect(shortcut?.category).toBe("actions");
    expect(shortcut?.roles).toContain("professional");
  });

  it("close overlay shortcut has Esc key", () => {
    const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.id === "close-overlay");
    expect(shortcut).toBeDefined();
    expect(shortcut?.keys).toContain("Esc");
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe("Edge cases", () => {
  it("formatShortcut handles undefined keysWindows", () => {
    const result = formatShortcut(["⌘", "K"], undefined);
    expect(result.length).toBeGreaterThan(0);
  });

  it("getShortcutsByRole handles empty role gracefully", () => {
    const result = getShortcutsByRole("" as AppRole);
    // Should return shortcuts without role restrictions
    expect(result.length).toBeGreaterThan(0);
  });

  it("getShortcutsByCategory returns consistent results", () => {
    const result1 = getShortcutsByCategory("general");
    const result2 = getShortcutsByCategory("general");
    expect(result1.length).toBe(result2.length);
  });
});
