# Week 3: Real-time Features & Notifications - Implementation Plan

**Date:** 2025-01-16
**Sprint:** Real-time Analytics & Live Updates
**Status:** 🚀 Ready to Begin

---

## Overview

Week 3 focuses on implementing real-time features to enhance the admin dashboard with live updates, instant notifications, and dynamic analytics. This builds on the performance optimizations from Weeks 1-2 by adding reactive, real-time functionality.

---

## Prerequisites (Week 1-2 Completion ✅)

### Week 1 Results ✅
- ✅ CSS typo fixes (68 instances)
- ✅ Color consistency (LIA brand colors)
- ✅ Server component conversion (163 LOC)
- ✅ Block editor code splitting (1,499 LOC)
- ✅ Total optimization: ~1,662 LOC, ~15-20% bundle reduction

### Week 2 Results ✅
- ✅ PricingRuleModal code splitting (385 LOC)
- ✅ Route-level loading states (7 files)
- ✅ Modal lazy loading audit (all optimized)
- ✅ Recharts dependency optimization (~60-70% reduction)
- ✅ Total optimization: ~385 LOC, ~5-10% bundle reduction

### Cumulative Impact (Week 1 + Week 2)
- **Total LOC Optimized:** ~2,047 LOC
- **Estimated Bundle Reduction:** ~25-30%
- **Performance Impact:** TTI -600-900ms, FCP -300-500ms

---

## Week 3 Goals

1. **Supabase Realtime Setup** - Configure Realtime channels for admin dashboard
2. **Live Analytics Dashboard** - Real-time metric updates without page refresh
3. **Notification System** - Toast notifications for admin events
4. **Real-time User Activity** - Live user counts, booking updates, professional status
5. **WebSocket Optimization** - Efficient connection management and fallbacks

**Target Impact:** Instant updates, improved admin UX, reduced manual refresh needs

---

## Task 1: Supabase Realtime Configuration ⏳

### Goal
Set up Supabase Realtime for PostgreSQL Change Data Capture (CDC) and configure channels for admin dashboard events.

### Implementation Strategy

#### 1. Enable Realtime on Database Tables

**Tables to Enable:**
- `bookings` - Track booking status changes
- `users` - Monitor user registrations and profile updates
- `professionals` - Watch professional application status
- `reviews` - New review submissions
- `disputes` - Dispute creation and resolution
- `notifications` - Admin notification queue

**Supabase Configuration:**
```sql
-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Enable realtime for professionals table
ALTER PUBLICATION supabase_realtime ADD TABLE professionals;

-- Enable realtime for reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- Enable realtime for disputes table
ALTER PUBLICATION supabase_realtime ADD TABLE disputes;

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

#### 2. Create Realtime Client Wrapper

**File:** `/src/lib/integrations/supabase/realtime.ts`

```typescript
import { createSupabaseBrowserClient } from './browser-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent<T> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
};

export type RealtimeSubscription = {
  channel: RealtimeChannel;
  unsubscribe: () => void;
};

/**
 * Subscribe to real-time changes on a specific table
 */
export function subscribeToTable<T>(
  table: string,
  callback: (payload: RealtimeEvent<T>) => void,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string; // e.g., "status=eq.pending"
    schema?: string;
  } = {}
): RealtimeSubscription {
  const supabase = createSupabaseBrowserClient();
  const { event = '*', filter, schema = 'public' } = options;

  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        filter,
      },
      (payload) => callback(payload as RealtimeEvent<T>)
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Subscribe to multiple tables with a single channel
 */
export function subscribeToTables(
  subscriptions: Array<{
    table: string;
    callback: (payload: RealtimeEvent<unknown>) => void;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
  }>
): RealtimeSubscription {
  const supabase = createSupabaseBrowserClient();
  const channelName = `admin_dashboard_${Date.now()}`;

  let channel = supabase.channel(channelName);

  // Add all subscriptions to the same channel
  for (const sub of subscriptions) {
    channel = channel.on(
      'postgres_changes',
      {
        event: sub.event || '*',
        schema: 'public',
        table: sub.table,
        filter: sub.filter,
      },
      (payload) => sub.callback(payload as RealtimeEvent<unknown>)
    );
  }

  channel.subscribe();

  return {
    channel,
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}

/**
 * Subscribe to a presence channel (for online users)
 */
export function subscribeToPresence(
  channelName: string,
  userId: string,
  metadata: Record<string, unknown> = {}
): RealtimeSubscription {
  const supabase = createSupabaseBrowserClient();

  const channel = supabase
    .channel(channelName)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Presence sync:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...metadata,
        });
      }
    });

  return {
    channel,
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
}
```

#### 3. Create React Hook for Realtime

**File:** `/src/hooks/use-realtime.ts`

```typescript
import { useEffect, useRef } from 'react';
import { subscribeToTable, type RealtimeEvent, type RealtimeSubscription } from '@/lib/integrations/supabase/realtime';

/**
 * React hook for subscribing to real-time table changes
 */
export function useRealtimeTable<T>(
  table: string,
  callback: (payload: RealtimeEvent<T>) => void,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    enabled?: boolean;
  } = {}
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to table changes
    subscriptionRef.current = subscribeToTable<T>(table, callback, options);

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [table, enabled, options.event, options.filter]);
}

/**
 * React hook for subscribing to real-time presence
 */
export function useRealtimePresence(
  channelName: string,
  userId: string,
  metadata: Record<string, unknown> = {},
  options: { enabled?: boolean } = {}
) {
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled || !userId) return;

    // Subscribe to presence channel
    import('@/lib/integrations/supabase/realtime').then(({ subscribeToPresence }) => {
      subscriptionRef.current = subscribeToPresence(channelName, userId, metadata);
    });

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [channelName, userId, enabled]);
}
```

### Files to Create (Task 1)

1. `/src/lib/integrations/supabase/realtime.ts` - Realtime client wrapper
2. `/src/hooks/use-realtime.ts` - React hooks for realtime
3. `/supabase/migrations/20250116_enable_realtime.sql` - Enable realtime on tables

### Impact

- Real-time data synchronization without polling
- Reduced server load (no periodic API requests)
- Instant updates for admin dashboard

---

## Task 2: Live Analytics Dashboard ⏳

### Goal
Add real-time updates to analytics dashboard metrics without page refresh.

### Implementation Strategy

#### 1. Create Real-time Stats Hook

**File:** `/src/hooks/use-realtime-stats.ts`

```typescript
import { useState, useEffect } from 'react';
import { useRealtimeTable } from './use-realtime';
import { createSupabaseBrowserClient } from '@/lib/integrations/supabase/browser-client';

type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  activeUsers: number;
  totalRevenue: number;
  newProfessionals: number;
};

/**
 * Hook for real-time dashboard statistics
 */
export function useRealtimeDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial stats
  useEffect(() => {
    async function fetchInitialStats() {
      const supabase = createSupabaseBrowserClient();

      // Parallel queries for better performance
      const [bookingsResult, usersResult, professionalsResult, revenueResult] = await Promise.all([
        supabase.from('bookings').select('id, status', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('professionals').select('id, created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('bookings').select('total_price_cop').eq('status', 'completed'),
      ]);

      const pendingBookingsResult = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalBookings: bookingsResult.count || 0,
        pendingBookings: pendingBookingsResult.count || 0,
        activeUsers: usersResult.count || 0,
        totalRevenue: revenueResult.data?.reduce((sum, b) => sum + (b.total_price_cop || 0), 0) || 0,
        newProfessionals: professionalsResult.data?.length || 0,
      });

      setIsLoading(false);
    }

    fetchInitialStats();
  }, []);

  // Subscribe to real-time updates for bookings
  useRealtimeTable(
    'bookings',
    (payload) => {
      if (!stats) return;

      if (payload.eventType === 'INSERT') {
        setStats((prev) => ({
          ...prev!,
          totalBookings: prev!.totalBookings + 1,
          pendingBookings: payload.new.status === 'pending' ? prev!.pendingBookings + 1 : prev!.pendingBookings,
        }));
      } else if (payload.eventType === 'UPDATE') {
        const oldStatus = payload.old.status;
        const newStatus = payload.new.status;

        if (oldStatus === 'pending' && newStatus !== 'pending') {
          setStats((prev) => ({
            ...prev!,
            pendingBookings: Math.max(0, prev!.pendingBookings - 1),
          }));
        } else if (oldStatus !== 'pending' && newStatus === 'pending') {
          setStats((prev) => ({
            ...prev!,
            pendingBookings: prev!.pendingBookings + 1,
          }));
        }

        if (newStatus === 'completed' && payload.new.total_price_cop) {
          setStats((prev) => ({
            ...prev!,
            totalRevenue: prev!.totalRevenue + payload.new.total_price_cop,
          }));
        }
      }
    },
    { event: '*' }
  );

  // Subscribe to real-time updates for users
  useRealtimeTable(
    'users',
    (payload) => {
      if (!stats) return;

      if (payload.eventType === 'INSERT') {
        setStats((prev) => ({
          ...prev!,
          activeUsers: prev!.activeUsers + 1,
        }));
      }
    },
    { event: 'INSERT' }
  );

  // Subscribe to real-time updates for professionals
  useRealtimeTable(
    'professionals',
    (payload) => {
      if (!stats) return;

      if (payload.eventType === 'INSERT') {
        setStats((prev) => ({
          ...prev!,
          newProfessionals: prev!.newProfessionals + 1,
        }));
      }
    },
    { event: 'INSERT' }
  );

  return { stats, isLoading };
}
```

#### 2. Update Analytics Dashboard Component

**File:** `/src/components/admin/enhanced-analytics-dashboard.tsx`

Add real-time stats hook:

```tsx
import { useRealtimeDashboardStats } from '@/hooks/use-realtime-stats';

export function EnhancedAnalyticsDashboard() {
  const { stats, isLoading } = useRealtimeDashboardStats();

  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          trend="+12.5%"
          icon={Calendar03Icon}
          isLive={true}
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          trend="-3.2%"
          icon={Clock01Icon}
          isLive={true}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          trend="+8.1%"
          icon={UserGroupIcon}
          isLive={true}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend="+15.3%"
          icon={Money01Icon}
          isLive={true}
        />
      </div>

      {/* Rest of dashboard */}
    </div>
  );
}
```

#### 3. Add Live Indicator to Stat Cards

**Update:** `/src/components/admin/StatCard.tsx`

```tsx
export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  isLive = false,
}: StatCardProps) {
  return (
    <div className="border border-neutral-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Icon className="h-8 w-8 text-neutral-400" />
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-xs font-medium text-orange-600">Live</span>
            </div>
          )}
        </div>
      </div>
      {trend && (
        <p className={`mt-2 text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend} vs last month
        </p>
      )}
    </div>
  );
}
```

### Files to Modify (Task 2)

1. `/src/hooks/use-realtime-stats.ts` (create) - Real-time stats hook
2. `/src/components/admin/enhanced-analytics-dashboard.tsx` (modify) - Add real-time updates
3. `/src/components/admin/StatCard.tsx` (modify) - Add live indicator

### Impact

- Instant metric updates without page refresh
- Live indicator shows real-time data
- Reduced manual refresh needs

---

## Task 3: Admin Notification System ⏳

### Goal
Implement toast notifications for admin events (new bookings, disputes, professional applications).

### Implementation Strategy

#### 1. Create Notification Types

**File:** `/src/types/notifications.ts`

```typescript
export type NotificationType = 'booking' | 'dispute' | 'professional' | 'review' | 'user';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AdminNotification = {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, unknown>;
};
```

#### 2. Create Notification Hook

**File:** `/src/hooks/use-admin-notifications.ts`

```typescript
import { useState, useCallback } from 'react';
import { useRealtimeTable } from './use-realtime';
import { toast } from '@/lib/toast';
import type { AdminNotification } from '@/types/notifications';

/**
 * Hook for managing admin notifications
 */
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Subscribe to new bookings
  useRealtimeTable(
    'bookings',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        const booking = payload.new;

        toast({
          title: 'New Booking',
          description: `Booking #${booking.id} created`,
          action: {
            label: 'View',
            onClick: () => {
              window.location.href = `/admin/bookings/${booking.id}`;
            },
          },
        });

        setNotifications((prev) => [
          {
            id: `booking_${booking.id}`,
            type: 'booking',
            priority: 'medium',
            title: 'New Booking',
            message: `Booking #${booking.id} created`,
            actionUrl: `/admin/bookings/${booking.id}`,
            actionLabel: 'View Booking',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    },
    { event: 'INSERT' }
  );

  // Subscribe to new disputes
  useRealtimeTable(
    'disputes',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        const dispute = payload.new;

        toast({
          title: 'New Dispute',
          description: `Dispute #${dispute.id} requires attention`,
          variant: 'destructive',
          action: {
            label: 'Review',
            onClick: () => {
              window.location.href = `/admin/disputes/${dispute.id}`;
            },
          },
        });

        setNotifications((prev) => [
          {
            id: `dispute_${dispute.id}`,
            type: 'dispute',
            priority: 'high',
            title: 'New Dispute',
            message: `Dispute #${dispute.id} requires attention`,
            actionUrl: `/admin/disputes/${dispute.id}`,
            actionLabel: 'Review Dispute',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    },
    { event: 'INSERT' }
  );

  // Subscribe to new professional applications
  useRealtimeTable(
    'professionals',
    (payload) => {
      if (payload.eventType === 'INSERT') {
        const professional = payload.new;

        toast({
          title: 'New Professional Application',
          description: `${professional.full_name} submitted an application`,
          action: {
            label: 'Review',
            onClick: () => {
              window.location.href = `/admin/professionals/${professional.id}`;
            },
          },
        });

        setNotifications((prev) => [
          {
            id: `professional_${professional.id}`,
            type: 'professional',
            priority: 'medium',
            title: 'New Professional Application',
            message: `${professional.full_name} submitted an application`,
            actionUrl: `/admin/professionals/${professional.id}`,
            actionLabel: 'Review Application',
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    },
    { event: 'INSERT' }
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    markAsRead,
    clearAll,
  };
}
```

#### 3. Add Notification Bell to Admin Header

**File:** `/src/components/admin/admin-header.tsx`

```tsx
import { useAdminNotifications } from '@/hooks/use-admin-notifications';
import { Notification01Icon } from '@hugeicons/core-free-icons';

export function AdminHeader() {
  const { notifications, unreadCount } = useAdminNotifications();

  return (
    <header className="border-b border-neutral-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 hover:bg-neutral-100"
            aria-label={`${unreadCount} unread notifications`}
          >
            <Notification01Icon className="h-6 w-6 text-neutral-700" />
            {unreadCount > 0 && (
              <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-orange-500 text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

### Files to Create/Modify (Task 3)

1. `/src/types/notifications.ts` (create) - Notification types
2. `/src/hooks/use-admin-notifications.ts` (create) - Notification hook
3. `/src/components/admin/admin-header.tsx` (modify) - Add notification bell

### Impact

- Instant admin notifications for critical events
- Reduced need to manually check for updates
- Better admin response time

---

## Task 4: Real-time User Activity Tracking ⏳

### Goal
Show live user counts, active sessions, and booking activity on admin dashboard.

### Implementation Strategy

#### 1. Create User Activity Hook

**File:** `/src/hooks/use-realtime-activity.ts`

```typescript
import { useState, useEffect } from 'react';
import { useRealtimePresence } from './use-realtime';
import { createSupabaseBrowserClient } from '@/lib/integrations/supabase/browser-client';

type UserActivity = {
  onlineUsers: number;
  activeSessions: number;
  recentBookings: number;
};

/**
 * Hook for tracking real-time user activity
 */
export function useRealtimeUserActivity() {
  const [activity, setActivity] = useState<UserActivity>({
    onlineUsers: 0,
    activeSessions: 0,
    recentBookings: 0,
  });

  // Subscribe to presence channel for online users
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const channel = supabase.channel('online_users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineCount = Object.keys(state).length;

        setActivity((prev) => ({
          ...prev,
          onlineUsers: onlineCount,
        }));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Track recent bookings (last 24 hours)
  useEffect(() => {
    async function fetchRecentBookings() {
      const supabase = createSupabaseBrowserClient();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', yesterday);

      setActivity((prev) => ({
        ...prev,
        recentBookings: count || 0,
      }));
    }

    fetchRecentBookings();
  }, []);

  return activity;
}
```

#### 2. Add Activity Metrics to Dashboard

**File:** `/src/components/admin/realtime-activity-panel.tsx`

```tsx
import { useRealtimeUserActivity } from '@/hooks/use-realtime-activity';

export function RealtimeActivityPanel() {
  const { onlineUsers, activeSessions, recentBookings } = useRealtimeUserActivity();

  return (
    <div className="border border-neutral-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Live Activity</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Online Users</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-green-500" />
            </span>
            <span className="text-lg font-bold text-neutral-900">{onlineUsers}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Active Sessions</span>
          <span className="text-lg font-bold text-neutral-900">{activeSessions}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Bookings (24h)</span>
          <span className="text-lg font-bold text-neutral-900">{recentBookings}</span>
        </div>
      </div>
    </div>
  );
}
```

### Files to Create (Task 4)

1. `/src/hooks/use-realtime-activity.ts` (create) - User activity hook
2. `/src/components/admin/realtime-activity-panel.tsx` (create) - Activity panel

### Impact

- Live visibility into platform usage
- Better capacity planning
- Instant awareness of platform activity

---

## Task 5: WebSocket Optimization ⏳

### Goal
Optimize Supabase Realtime connection management for efficiency and reliability.

### Implementation Strategy

#### 1. Connection Pooling

**File:** `/src/lib/integrations/supabase/realtime-manager.ts`

```typescript
import { createSupabaseBrowserClient } from './browser-client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Manages Supabase Realtime connections to prevent duplicate subscriptions
 */
class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private supabase = createSupabaseBrowserClient();

  /**
   * Get or create a channel
   */
  getChannel(channelName: string): RealtimeChannel {
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.supabase.channel(channelName);
    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe and remove a channel
   */
  removeChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  removeAllChannels(): void {
    for (const [name, channel] of this.channels.entries()) {
      channel.unsubscribe();
      this.channels.delete(name);
    }
  }

  /**
   * Get connection status
   */
  getStatus(): { [channelName: string]: string } {
    const status: { [channelName: string]: string } = {};

    for (const [name, channel] of this.channels.entries()) {
      // Supabase channels don't expose status directly, so we track subscriptions
      status[name] = 'subscribed';
    }

    return status;
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();
```

#### 2. Automatic Reconnection

**File:** `/src/hooks/use-realtime-connection.ts`

```typescript
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/integrations/supabase/browser-client';

/**
 * Hook for monitoring Realtime connection status
 */
export function useRealtimeConnection() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Monitor connection status
    const channel = supabase.channel('connection_monitor');

    channel
      .on('system', {}, (payload) => {
        if (payload.extension === 'postgres_changes') {
          setStatus('connected');
          setError(null);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setStatus('disconnected');
          setError('Connection error');
        } else if (status === 'TIMED_OUT') {
          setStatus('disconnected');
          setError('Connection timed out');
        } else if (status === 'CLOSED') {
          setStatus('disconnected');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { status, error };
}
```

#### 3. Add Connection Status Indicator

**File:** `/src/components/admin/realtime-status-indicator.tsx`

```tsx
import { useRealtimeConnection } from '@/hooks/use-realtime-connection';

export function RealtimeStatusIndicator() {
  const { status, error } = useRealtimeConnection();

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Live',
      pulse: true,
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting',
      pulse: true,
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      pulse: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2 w-2 ${config.color}`} />
      </span>
      <span className="text-xs font-medium text-neutral-600">{config.text}</span>
      {error && (
        <span className="text-xs text-red-600" title={error}>
          ⚠
        </span>
      )}
    </div>
  );
}
```

### Files to Create (Task 5)

1. `/src/lib/integrations/supabase/realtime-manager.ts` (create) - Connection manager
2. `/src/hooks/use-realtime-connection.ts` (create) - Connection status hook
3. `/src/components/admin/realtime-status-indicator.tsx` (create) - Status indicator

### Impact

- Efficient connection management (no duplicate subscriptions)
- Automatic reconnection on failure
- Visual connection status feedback

---

## Success Metrics

### Functionality Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Real-time Update Latency | <500ms | Monitor payload timestamps |
| Connection Uptime | >99% | Track disconnection events |
| Notification Delivery Rate | 100% | Verify all events trigger notifications |
| WebSocket Connection Count | 1 per admin session | Monitor active connections |

### User Experience Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Admin Refresh Frequency | -80% | Monitor manual refresh rate |
| Time to Notification | <1s | Track event-to-notification time |
| Dashboard Load Time | Same as Week 2 | Lighthouse audit |
| Perceived Responsiveness | "Instant" | User feedback |

---

## Implementation Timeline

### Day 1: Supabase Realtime Setup (Task 1)
- Enable Realtime on database tables
- Create realtime client wrapper
- Create React hooks for realtime
- Test basic subscription

### Day 2: Live Analytics (Task 2)
- Create real-time stats hook
- Update analytics dashboard component
- Add live indicators to stat cards
- Test real-time metric updates

### Day 3: Notification System (Task 3)
- Define notification types
- Create notification hook
- Add notification bell to header
- Test toast notifications

### Day 4: User Activity Tracking (Task 4)
- Create user activity hook
- Build activity panel component
- Integrate presence tracking
- Test live activity metrics

### Day 5: WebSocket Optimization (Task 5)
- Implement connection pooling
- Add automatic reconnection
- Create status indicator
- Test connection resilience

### Day 6-7: Testing & Documentation
- End-to-end testing of all real-time features
- Performance testing (latency, connection count)
- Create week-3-realtime-features-summary.md
- Commit changes

---

## Files to Create (Estimated: 15 files)

### Core Infrastructure
1. `/src/lib/integrations/supabase/realtime.ts`
2. `/src/lib/integrations/supabase/realtime-manager.ts`
3. `/src/hooks/use-realtime.ts`
4. `/src/hooks/use-realtime-connection.ts`

### Feature Implementations
5. `/src/hooks/use-realtime-stats.ts`
6. `/src/hooks/use-admin-notifications.ts`
7. `/src/hooks/use-realtime-activity.ts`
8. `/src/types/notifications.ts`

### UI Components
9. `/src/components/admin/realtime-status-indicator.tsx`
10. `/src/components/admin/realtime-activity-panel.tsx`

### Database Migrations
11. `/supabase/migrations/20250116_enable_realtime.sql`

### Documentation
12. `/docs/week-3-realtime-features-summary.md`

### Modified Files
- `/src/components/admin/enhanced-analytics-dashboard.tsx`
- `/src/components/admin/StatCard.tsx`
- `/src/components/admin/admin-header.tsx`

---

## Risks & Mitigations

### Risk 1: Realtime Connection Overhead
**Risk:** Too many WebSocket connections could impact performance
**Mitigation:** Use connection pooling, single channel for multiple subscriptions

### Risk 2: Notification Spam
**Risk:** Too many notifications could overwhelm admins
**Mitigation:** Implement notification grouping, priority filtering, quiet hours

### Risk 3: Presence Tracking Accuracy
**Risk:** Presence tracking might not accurately reflect online users
**Mitigation:** Implement heartbeat mechanism, timeout detection

### Risk 4: Database Load from Realtime
**Risk:** Realtime subscriptions could increase database load
**Mitigation:** Use row-level security, filter subscriptions, limit event types

---

## Next Steps After Week 3

### Week 4: Security & Access Control Enhancements
- Role-based access control (RBAC) improvements
- Audit logging enhancements
- Rate limiting for admin APIs
- Two-factor authentication (2FA) for admins

### Week 5: Advanced Analytics
- Custom report builder
- Data export functionality
- Advanced filtering and segmentation
- Predictive analytics

---

## Testing Checklist

### Functional Testing
- [ ] Realtime updates appear within 500ms
- [ ] Notifications trigger for all event types
- [ ] Connection status indicator works correctly
- [ ] Presence tracking shows accurate online counts
- [ ] WebSocket reconnects automatically on failure

### Performance Testing
- [ ] Single WebSocket connection per admin session
- [ ] No memory leaks from subscriptions
- [ ] Dashboard load time unchanged from Week 2
- [ ] Low CPU usage from real-time updates

### Edge Cases
- [ ] Handles rapid consecutive events
- [ ] Gracefully handles network interruptions
- [ ] Works on slow connections
- [ ] Handles concurrent admin sessions

---

**Plan Created:** 2025-01-16
**Ready to Begin:** Week 3, Task 1 (Supabase Realtime Setup)
**Estimated Completion:** 7 days
