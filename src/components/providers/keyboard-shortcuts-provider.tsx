"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { KeyboardShortcutsPanel } from "@/components/keyboard-shortcuts/keyboard-shortcuts-panel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { usePathname } from "@/i18n/routing";
import type { AppRole } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

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
  const pathname = usePathname();
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

      {/* Command Palette (⌘K) */}
      <CommandPalette
        dashboardPath={dashboardPath}
        onClose={shortcuts.closeCommandPalette}
        open={shortcuts.commandPaletteOpen}
        role={role}
      />

      {/* Keyboard Shortcuts Panel (?) */}
      <KeyboardShortcutsPanel
        onClose={shortcuts.closeShortcutsPanel}
        open={shortcuts.shortcutsPanelOpen}
        role={role}
      />
    </KeyboardShortcutsContext.Provider>
  );
}
