"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type SupabaseContextValue = SupabaseClient;

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

type SupabaseProviderProps = {
  children: ReactNode;
};

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [client] = useState(() => createSupabaseBrowserClient());
  const value = useMemo(() => client, [client]);

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

function useSupabaseClient() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabaseClient must be used within SupabaseProvider");
  }

  return context;
}
