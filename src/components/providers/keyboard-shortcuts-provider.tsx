"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { AppRole } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Dynamically import heavy command palette components
const CommandPalette = dynamic(
  () =>
    import("@/components/command-palette/command-palette").then((mod) => ({
      default: mod.CommandPalette,
    })),
  {
    ssr: false,
  }
);

const KeyboardShortcutsPanel = dynamic(
  () =>
    import("@/components/keyboard-shortcuts/keyboard-shortcuts-panel").then((mod) => ({
      default: mod.KeyboardShortcutsPanel,
    })),
  {
    ssr: false,
  }
);

// Create context for keyboard shortcuts
type KeyboardShortcutsContextType = {
  openCommandPalette: () => void;
  openShortcutsPanel: () => void;
  closeCommandPalette: () => void;
  closeShortcutsPanel: () => void;
  toggleShortcutsPanel: () => void;
};

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error("useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider");
  }
  return context;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole | undefined>();
  const [dashboardPath, setDashboardPath] = useState<string | undefined>();

  // Get user role from Supabase
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(undefined);
        setDashboardPath(undefined);
        return;
      }

      // Get profile to determine role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role) {
        setRole(profile.role as AppRole);

        // Set dashboard path based on role
        if (profile.role === "customer") {
          setDashboardPath("/dashboard/customer");
        } else if (profile.role === "professional") {
          setDashboardPath("/dashboard/pro");
        } else if (profile.role === "admin") {
          setDashboardPath("/dashboard/admin");
        }
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initialize keyboard shortcuts
  const shortcuts = useKeyboardShortcuts({
    role,
    dashboardPath,
  });

  // Create context value
  const contextValue: KeyboardShortcutsContextType = {
    openCommandPalette: shortcuts.openCommandPalette,
    openShortcutsPanel: shortcuts.openShortcutsPanel,
    closeCommandPalette: shortcuts.closeCommandPalette,
    closeShortcutsPanel: shortcuts.closeShortcutsPanel,
    toggleShortcutsPanel: shortcuts.toggleShortcutsPanel,
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}

      {/* Command Palette (⌘K) - only mount when opened */}
      {shortcuts.commandPaletteOpen && (
        <CommandPalette
          dashboardPath={dashboardPath}
          onClose={shortcuts.closeCommandPalette}
          open={shortcuts.commandPaletteOpen}
          role={role}
        />
      )}

      {/* Keyboard Shortcuts Panel (?) - only mount when opened */}
      {shortcuts.shortcutsPanelOpen && (
        <KeyboardShortcutsPanel
          onClose={shortcuts.closeShortcutsPanel}
          open={shortcuts.shortcutsPanelOpen}
          role={role}
        />
      )}
    </KeyboardShortcutsContext.Provider>
  );
}
