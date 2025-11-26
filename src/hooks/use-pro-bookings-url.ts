"use client";

/**
 * useProBookingsWithUrl - URL-Synced Professional Bookings Hook
 *
 * Extends useProBookings with URL query parameter sync using nuqs.
 * Useful for shareable/bookmarkable filter states.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback } from "react";
import {
  type BookingStatus,
  type DateFilter,
  type ProBookingsFilters,
  type ProBookingsResponse,
  type ProBookingWithCustomer,
  proBookingsKeys,
} from "./use-pro-bookings";

// ============================================================================
// API Function
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
// URL Parsers
// ============================================================================

const STATUS_VALUES = [
  "all",
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const DATE_FILTER_VALUES = ["all", "today", "week", "month", "history"] as const;

const filterParsers = {
  page: parseAsInteger.withDefault(1),
  status: parseAsStringLiteral(STATUS_VALUES).withDefault("all"),
  date: parseAsStringLiteral(DATE_FILTER_VALUES).withDefault("all"),
  search: parseAsString.withDefault(""),
};

// ============================================================================
// Hook
// ============================================================================

type UseProBookingsWithUrlOptions = {
  /** Items per page */
  limit?: number;
  /** Disable auto-fetching */
  enabled?: boolean;
};

export function useProBookingsWithUrl(options: UseProBookingsWithUrlOptions = {}) {
  const { limit = 20, enabled = true } = options;

  const queryClient = useQueryClient();

  // URL-synced state
  const [urlState, setUrlState] = useQueryStates(filterParsers, {
    history: "push",
    shallow: false,
  });

  const page = urlState.page;
  const filters: ProBookingsFilters = {
    status: urlState.status as BookingStatus | "all",
    date: urlState.date as DateFilter,
    search: urlState.search,
  };

  // Main query
  const query = useQuery({
    queryKey: proBookingsKeys.list(page, limit, filters),
    queryFn: () => fetchProBookings(page, limit, filters),
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
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

  const setFilters = useCallback(
    (newFilters: Partial<ProBookingsFilters>) => {
      setUrlState({
        ...newFilters,
        page: 1, // Reset to first page when filters change
      });
    },
    [setUrlState]
  );

  const setStatus = useCallback(
    (status: BookingStatus | "all") => {
      setUrlState({ status, page: 1 });
    },
    [setUrlState]
  );

  const setDateFilter = useCallback(
    (date: DateFilter) => {
      setUrlState({ date, page: 1 });
    },
    [setUrlState]
  );

  const setSearch = useCallback(
    (search: string) => {
      setUrlState({ search, page: 1 });
    },
    [setUrlState]
  );

  const clearFilters = useCallback(() => {
    setUrlState({
      status: "all",
      date: "all",
      search: "",
      page: 1,
    });
  }, [setUrlState]);

  // ============================================================================
  // Pagination
  // ============================================================================

  const goToPage = useCallback(
    (newPage: number) => {
      setUrlState({ page: newPage });
    },
    [setUrlState]
  );

  const nextPage = useCallback(() => {
    const totalPages = query.data?.pagination.totalPages ?? 1;
    if (page < totalPages) {
      setUrlState({ page: page + 1 });
    }
  }, [page, query.data?.pagination.totalPages, setUrlState]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setUrlState({ page: page - 1 });
    }
  }, [page, setUrlState]);

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
