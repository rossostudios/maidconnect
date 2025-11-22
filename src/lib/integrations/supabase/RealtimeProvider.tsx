"use client";

/**
 * Realtime Provider
 *
 * Provides Supabase realtime connection management to the entire app.
 * Wraps the app with a React Context that exposes:
 * - Connection health status
 * - Connection manager instance
 * - Automatic reconnection handling
 *
 * Week 1: Realtime Optimization - Task 2
 *
 * @example
 * ```tsx
 * // In app layout
 * <RealtimeProvider>
 *   <YourApp />
 * </RealtimeProvider>
 *
 * // In any component
 * const { health, manager } = useRealtime();
 * console.log('Connected:', health.state === 'connected');
 * ```
 */

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import {
  type ConnectionHealth,
  getConnectionManager,
  type RealtimeConnectionManager,
} from "./realtime-connection-manager";

/**
 * Realtime Context Value
 */
type RealtimeContextValue = {
  /** Connection manager instance */
  manager: RealtimeConnectionManager;
  /** Current connection health */
  health: ConnectionHealth;
  /** Whether the provider is initialized */
  isInitialized: boolean;
};

/**
 * Realtime Context
 */
const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/**
 * Realtime Provider Props
 */
type RealtimeProviderProps = {
  children: ReactNode;
};

/**
 * Realtime Provider Component
 *
 * Manages the global realtime connection state and provides it via React Context.
 * Automatically handles connection lifecycle (connect on mount, cleanup on unmount).
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [manager] = useState(() => getConnectionManager());
  const [health, setHealth] = useState<ConnectionHealth>(() => manager.getHealth());
  const [isInitialized, setIsInitialized] = useState(false);

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = manager.onConnectionChange((newHealth) => {
      setHealth(newHealth);
    });

    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Note: We don't call manager.cleanup() here because the manager is a singleton
      // and may be used by other parts of the app. Cleanup should happen at app shutdown.
    };
  }, [manager]);

  return (
    <RealtimeContext.Provider value={{ manager, health, isInitialized }}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to access Realtime Context
 *
 * Provides access to the connection manager and current health status.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { health, manager } = useRealtime();
 *
 *   if (health.state === 'error') {
 *     return <div>Connection error. Reconnecting...</div>;
 *   }
 *
 *   if (health.state === 'connecting') {
 *     return <div>Connecting...</div>;
 *   }
 *
 *   return <div>Connected! Active subscriptions: {health.subscriptionCount}</div>;
 * }
 * ```
 */
export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }

  return context;
}

/**
 * Hook to get connection health status only
 *
 * Simpler hook that only returns health status without the manager instance.
 *
 * @example
 * ```tsx
 * function ConnectionStatusBadge() {
 *   const health = useRealtimeHealth();
 *
 *   return (
 *     <div className={cn(
 *       'px-3 py-1 rounded-full text-sm',
 *       health.state === 'connected' && 'bg-green-50 text-green-700',
 *       health.state === 'connecting' && 'bg-blue-50 text-blue-700',
 *       health.state === 'error' && 'bg-red-50 text-red-700'
 *     )}>
 *       {health.state}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRealtimeHealth() {
  const { health } = useRealtime();
  return health;
}
