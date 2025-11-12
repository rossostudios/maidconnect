"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance per component mount
  // This follows React 19 best practices for state initialization
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data stale after 1 minute
            staleTime: 60 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000, // Renamed from cacheTime in TanStack Query v5
            // Don't refetch on window focus to reduce unnecessary requests
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Use structural sharing to optimize re-renders
            structuralSharing: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
