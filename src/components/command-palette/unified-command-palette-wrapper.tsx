/**
 * Unified Command Palette Wrapper
 *
 * Wraps the UnifiedCommandPalette with user session logic.
 * Determines the user's role and dashboard path from Supabase session.
 * Provides a context for opening the command palette from anywhere in the app.
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AppRole } from "@/lib/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { UnifiedCommandPalette } from "./unified-command-palette";

// Create context for command palette
type CommandPaletteContextType = {
  openCommandPalette: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within UnifiedCommandPaletteWrapper");
  }
  return context;
}

type UnifiedCommandPaletteWrapperProps = {
  children: React.ReactNode;
};

export function UnifiedCommandPaletteWrapper({ children }: UnifiedCommandPaletteWrapperProps) {
  const [role, setRole] = useState<AppRole | undefined>(undefined);
  const [dashboardPath, setDashboardPath] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userRole = session.user.user_metadata?.role as AppRole | undefined;
        setRole(userRole);

        // Set dashboard path based on role
        if (userRole === "customer") {
          setDashboardPath("/dashboard/customer");
        } else if (userRole === "professional") {
          setDashboardPath("/dashboard/pro");
        } else if (userRole === "admin") {
          setDashboardPath("/admin");
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userRole = session.user.user_metadata?.role as AppRole | undefined;
        setRole(userRole);

        // Set dashboard path based on role
        if (userRole === "customer") {
          setDashboardPath("/dashboard/customer");
        } else if (userRole === "professional") {
          setDashboardPath("/dashboard/pro");
        } else if (userRole === "admin") {
          setDashboardPath("/admin");
        }
      } else {
        setRole(undefined);
        setDashboardPath(undefined);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsOpen(true);
  }, []);

  const contextValue: CommandPaletteContextType = {
    openCommandPalette,
  };

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <UnifiedCommandPalette
        dashboardPath={dashboardPath}
        externalOpen={isOpen}
        onExternalOpenChange={setIsOpen}
        role={role}
      />
    </CommandPaletteContext.Provider>
  );
}
