"use client";

/**
 * useProBookings - React Query Hook for Professional Bookings
 *
 * Features:
 * - Paginated data fetching with TanStack Query
 * - Filter state management (status, date, search)
 * - Automatic revalidation and caching
 * - Optimistic updates for mutations
 * - URL sync support via nuqs (optional)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { Currency } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export type DateFilter = "all" | "today" | "week" | "month" | "history";

export type ProBookingWithCustomer = {
  id: string;
  status: BookingStatus;
  scheduledStart: string;
  scheduledEnd: string | null;
  durationMinutes: number | null;
  serviceName: string | null;
  amount: number;
  currency: Currency;
  address: string | null;
  specialInstructions: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phone: string | null;
  } | null;
};

export type BookingsSummary = {
  today: number;
  pending: number;
  confirmed: number;
  inProgress: number;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProBookingsFilters = {
  status: BookingStatus | "all";
  date: DateFilter;
  search: string;
};

export type ProBookingsResponse = {
  success: boolean;
  bookings: ProBookingWithCustomer[];
  pagination: PaginationInfo;
  summary: BookingsSummary;
  error?: string;
};

// ============================================================================
// API Functions
// ============================================================================

async function fetchProBookings(
  page: number,
  limit: number,
  filters: ProBookingsFilters
): Promise<ProBookingsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status: filters.status,
    date: filters.date,
  });

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  const response = await fetch(`/api/pro/bookings?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}

async function updateBookingStatus(
  bookingId: string,
  action: "accept" | "decline" | "check-in" | "check-out" | "cancel"
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/pro/bookings/${bookingId}/${action}`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to ${action} booking`);
  }

  return response.json();
}

// ============================================================================
// Query Keys
// ============================================================================

export const proBookingsKeys = {
  all: ["pro-bookings"] as const,
  list: (page: number, limit: number, filters: ProBookingsFilters) =>
    [...proBookingsKeys.all, "list", { page, limit, ...filters }] as const,
  detail: (id: string) => [...proBookingsKeys.all, "detail", id] as const,
  summary: () => [...proBookingsKeys.all, "summary"] as const,
};

// ============================================================================
// Hook
// ============================================================================

type UseProBookingsOptions = {
  /** Initial page number */
  initialPage?: number;
  /** Items per page */
  limit?: number;
  /** Initial filter state */
  initialFilters?: Partial<ProBookingsFilters>;
  /** Disable auto-fetching (useful for server components) */
  enabled?: boolean;
};

export function useProBookings(options: UseProBookingsOptions = {}) {
  const { initialPage = 1, limit = 20, initialFilters = {}, enabled = true } = options;

  const queryClient = useQueryClient();

  // Local filter state
  const [page, setPage] = useState(initialPage);
  const [filters, setFiltersState] = useState<ProBookingsFilters>({
    status: initialFilters.status ?? "all",
    date: initialFilters.date ?? "all",
    search: initialFilters.search ?? "",
  });

  // Main query
  const query = useQuery({
    queryKey: proBookingsKeys.list(page, limit, filters),
    queryFn: () => fetchProBookings(page, limit, filters),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const acceptBookingMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "accept"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proBookingsKeys.all });
    },
  });

  const declineBookingMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "decline"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proBookingsKeys.all });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "check-in"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proBookingsKeys.all });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "check-out"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proBookingsKeys.all });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "cancel"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proBookingsKeys.all });
    },
  });

  // ============================================================================
  // Filter Management
  // ============================================================================

  const setFilters = useCallback((newFilters: Partial<ProBookingsFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPage(1);
  }, []);

  const setStatus = useCallback(
    (status: BookingStatus | "all") => {
      setFilters({ status });
    },
    [setFilters]
  );

  const setDateFilter = useCallback(
    (date: DateFilter) => {
      setFilters({ date });
    },
    [setFilters]
  );

  const setSearch = useCallback(
    (search: string) => {
      setFilters({ search });
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    setFiltersState({
      status: "all",
      date: "all",
      search: "",
    });
    setPage(1);
  }, []);

  // ============================================================================
  // Pagination
  // ============================================================================

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    const totalPages = query.data?.pagination.totalPages ?? 1;
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, query.data?.pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  // ============================================================================
  // Utilities
  // ============================================================================

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: proBookingsKeys.all });
  }, [queryClient]);

  const getBookingById = useCallback(
    (bookingId: string): ProBookingWithCustomer | undefined =>
      query.data?.bookings.find((b) => b.id === bookingId),
    [query.data?.bookings]
  );

  // ============================================================================
  // Derived State
  // ============================================================================

  const hasActiveFilters =
    filters.status !== "all" || filters.date !== "all" || filters.search.trim() !== "";

  const isEmpty = !(query.isLoading || query.isError) && (query.data?.bookings.length ?? 0) === 0;

  const pagination = query.data?.pagination ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  };

  return {
    // Data
    bookings: query.data?.bookings ?? [],
    summary: query.data?.summary ?? {
      today: 0,
      pending: 0,
      confirmed: 0,
      inProgress: 0,
    },
    pagination,

    // Query State
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? (query.error as Error).message : null,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,

    // Filter State
    filters,
    hasActiveFilters,

    // Filter Actions
    setFilters,
    setStatus,
    setDateFilter,
    setSearch,
    clearFilters,

    // Pagination
    page,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < pagination.totalPages,
    hasPrevPage: page > 1,

    // Actions
    acceptBooking: acceptBookingMutation.mutateAsync,
    declineBooking: declineBookingMutation.mutateAsync,
    checkIn: checkInMutation.mutateAsync,
    checkOut: checkOutMutation.mutateAsync,
    cancelBooking: cancelBookingMutation.mutateAsync,

    // Mutation States
    isAccepting: acceptBookingMutation.isPending,
    isDeclining: declineBookingMutation.isPending,
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    isCancelling: cancelBookingMutation.isPending,

    // Utilities
    refetch,
    getBookingById,
    isEmpty,
  };
}

// ============================================================================
// Utility Hook for URL-Synced Filters
// ============================================================================

/**
 * Optional hook that syncs booking filters with URL query parameters
 * using nuqs for shareable/bookmarkable filter states
 */
export { useProBookingsWithUrl } from "./use-pro-bookings-url";
