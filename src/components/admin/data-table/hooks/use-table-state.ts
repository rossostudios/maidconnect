"use client";

import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type UseTableStateOptions = {
  pageSize?: number;
  enableUrlSync?: boolean;
  storageKey?: string;
};

/**
 * Manages table state with URL synchronization and local storage persistence
 *
 * Features:
 * - URL state sync for shareable links
 * - Local storage for column visibility preferences
 * - Pagination, sorting, and filtering state
 */
export function useTableState(options: UseTableStateOptions = {}) {
  const { pageSize = 10, enableUrlSync = true, storageKey = "table-state" } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize pagination from URL or defaults
  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (!enableUrlSync) {
      return { pageIndex: 0, pageSize };
    }

    const page = searchParams.get("page");
    const size = searchParams.get("pageSize");

    return {
      pageIndex: page ? Number.parseInt(page, 10) - 1 : 0,
      pageSize: size ? Number.parseInt(size, 10) : pageSize,
    };
  });

  // Initialize sorting from URL or defaults
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (!enableUrlSync) {
      return [];
    }

    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    if (sortBy) {
      return [{ id: sortBy, desc: sortOrder === "desc" }];
    }

    return [];
  });

  // Initialize filters from URL or defaults
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (!enableUrlSync) {
      return [];
    }

    const filters: ColumnFiltersState = [];
    const filterParams = searchParams.get("filters");

    if (filterParams) {
      try {
        const parsed = JSON.parse(decodeURIComponent(filterParams));
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return filters;
  });

  // Initialize global filter from URL
  const [globalFilter, setGlobalFilter] = useState<string>(() => {
    if (!enableUrlSync) {
      return "";
    }
    return searchParams.get("search") || "";
  });

  // Initialize column visibility from local storage
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const stored = localStorage.getItem(`${storageKey}-visibility`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sync table state to URL
  useEffect(() => {
    if (!enableUrlSync) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    // Pagination
    if (pagination.pageIndex > 0) {
      params.set("page", String(pagination.pageIndex + 1));
    } else {
      params.delete("page");
    }

    if (pagination.pageSize !== pageSize) {
      params.set("pageSize", String(pagination.pageSize));
    } else {
      params.delete("pageSize");
    }

    // Sorting
    if (sorting.length > 0) {
      params.set("sortBy", sorting[0]!.id);
      params.set("sortOrder", sorting[0]!.desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }

    // Filters
    if (columnFilters.length > 0) {
      params.set("filters", encodeURIComponent(JSON.stringify(columnFilters)));
    } else {
      params.delete("filters");
    }

    // Global search
    if (globalFilter) {
      params.set("search", globalFilter);
    } else {
      params.delete("search");
    }

    // Update URL without navigation
    const newUrl = `${pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    pathname,
    router,
    searchParams,
    enableUrlSync,
    pageSize,
  ]);

  // Persist column visibility to local storage
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(`${storageKey}-visibility`, JSON.stringify(columnVisibility));
    } catch {
      // Ignore storage errors
    }
  }, [columnVisibility, storageKey]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter("");
    setSorting([]);
  }, []);

  const resetAll = useCallback(() => {
    resetFilters();
    setPagination({ pageIndex: 0, pageSize });
    setColumnVisibility({});
  }, [resetFilters, pageSize]);

  return {
    // State
    pagination,
    sorting,
    columnFilters,
    columnVisibility,
    globalFilter,

    // Setters
    setPagination,
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setGlobalFilter,

    // Helpers
    resetFilters,
    resetAll,

    // Computed
    hasFilters: columnFilters.length > 0 || globalFilter.length > 0,
    hasSorting: sorting.length > 0,
  };
}
