"use client";

import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

/**
 * Service categories available for filtering - "The Core Four" grouped structure
 * Organized by service domain for better UX and reduced decision fatigue
 */
export const SERVICE_CATEGORIES = [
  {
    label: "Home & Cleaning",
    options: [
      { value: "standard-cleaning", label: "Standard Cleaning" },
      { value: "deep-cleaning", label: "Deep Clean / Move-out" },
      { value: "laundry-ironing", label: "Laundry & Ironing" },
    ],
  },
  {
    label: "Family Care",
    options: [
      { value: "nanny-childcare", label: "Nanny & Childcare" },
      { value: "senior-companionship", label: "Senior Companionship" },
    ],
  },
  {
    label: "Kitchen",
    options: [
      { value: "meal-prep", label: "Meal Prep / Private Chef" },
      { value: "event-cooking", label: "Event Cooking" },
    ],
  },
] as const;

/**
 * Flattened service options for backwards compatibility and lookups
 */
export const SERVICE_OPTIONS = SERVICE_CATEGORIES.flatMap((cat) => cat.options);

export type ServiceCategory = (typeof SERVICE_OPTIONS)[number]["value"];

/**
 * View modes for the directory
 */
export const VIEW_MODES = ["grid", "list", "map"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

/**
 * Sort options for professionals
 */
export const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "experience", label: "Most Experienced" },
  { value: "distance", label: "Nearest First" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

/**
 * Complete filter state for the directory
 */
export type DirectoryFilters = {
  // Location filters
  country: string | null;
  city: string | null;
  neighborhood: string | null;
  radius: number | null;

  // Service & pricing filters
  service: string | null;
  minRate: number | null;
  maxRate: number | null;
  minExperience: number | null;

  // Availability filters
  availableToday: boolean;
  date: string | null;

  // Trust & quality filters
  minRating: number | null;
  verifiedOnly: boolean;
  backgroundChecked: boolean;

  // Specialty tag filters
  englishSpeaking: boolean;
  petFriendly: boolean;
  hasPassport: boolean;

  // Search & view
  query: string | null;
  view: ViewMode;
  sort: SortOption;
  page: number;
};

/**
 * URL query parameter parsers for nuqs
 */
const filterParsers = {
  // Location
  country: parseAsString,
  city: parseAsString,
  neighborhood: parseAsString,
  radius: parseAsInteger,

  // Service & pricing
  service: parseAsString,
  minRate: parseAsInteger,
  maxRate: parseAsInteger,
  minExperience: parseAsInteger,

  // Availability
  availableToday: parseAsBoolean.withDefault(false),
  date: parseAsString,

  // Trust & quality
  minRating: parseAsInteger,
  verifiedOnly: parseAsBoolean.withDefault(false),
  backgroundChecked: parseAsBoolean.withDefault(false),

  // Specialty tags
  englishSpeaking: parseAsBoolean.withDefault(false),
  petFriendly: parseAsBoolean.withDefault(false),
  hasPassport: parseAsBoolean.withDefault(false),

  // Search & view
  query: parseAsString,
  view: parseAsStringLiteral(VIEW_MODES).withDefault("grid"),
  sort: parseAsStringLiteral([
    "rating",
    "reviews",
    "price-asc",
    "price-desc",
    "experience",
    "distance",
  ] as const).withDefault("rating"),
  page: parseAsInteger.withDefault(1),
};

/**
 * Hook for managing directory filter state synced with URL
 *
 * Usage:
 * ```tsx
 * const { filters, setFilters, setFilter, clearFilters, activeFilterCount } = useDirectoryFilters();
 *
 * // Set a single filter
 * setFilter("city", "bogota");
 *
 * // Set multiple filters at once
 * setFilters({ city: "bogota", service: "housekeeping" });
 *
 * // Clear all filters
 * clearFilters();
 * ```
 */
export function useDirectoryFilters() {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: "push",
    shallow: false,
  });

  /**
   * Set a single filter value
   */
  const setFilter = <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => {
    setFilters({ [key]: value } as Partial<typeof filters>);
  };

  /**
   * Clear all filters and reset to defaults
   */
  const clearFilters = () => {
    setFilters({
      country: null,
      city: null,
      neighborhood: null,
      radius: null,
      service: null,
      minRate: null,
      maxRate: null,
      minExperience: null,
      availableToday: false,
      date: null,
      minRating: null,
      verifiedOnly: false,
      backgroundChecked: false,
      englishSpeaking: false,
      petFriendly: false,
      hasPassport: false,
      query: null,
      view: "grid",
      sort: "rating",
      page: 1,
    });
  };

  /**
   * Clear location filters only
   */
  const clearLocationFilters = () => {
    setFilters({
      country: null,
      city: null,
      neighborhood: null,
      radius: null,
    });
  };

  /**
   * Count of active filters (excluding view/sort/page)
   */
  const activeFilterCount = [
    filters.country,
    filters.city,
    filters.neighborhood,
    filters.radius,
    filters.service,
    filters.minRate,
    filters.maxRate,
    filters.minExperience,
    filters.availableToday ? "true" : null,
    filters.date,
    filters.minRating,
    filters.verifiedOnly ? "true" : null,
    filters.backgroundChecked ? "true" : null,
    filters.englishSpeaking ? "true" : null,
    filters.petFriendly ? "true" : null,
    filters.hasPassport ? "true" : null,
    filters.query,
  ].filter(Boolean).length;

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = activeFilterCount > 0;

  /**
   * Get active filters as an array for displaying chips
   */
  const getActiveFilterChips = (): Array<{
    key: keyof DirectoryFilters;
    label: string;
    value: string;
  }> => {
    const chips: Array<{
      key: keyof DirectoryFilters;
      label: string;
      value: string;
    }> = [];

    if (filters.country) {
      chips.push({ key: "country", label: "Country", value: filters.country });
    }
    if (filters.city) {
      chips.push({ key: "city", label: "City", value: filters.city });
    }
    if (filters.neighborhood) {
      chips.push({
        key: "neighborhood",
        label: "Neighborhood",
        value: filters.neighborhood,
      });
    }
    if (filters.radius) {
      chips.push({
        key: "radius",
        label: "Distance",
        value: `${filters.radius}km`,
      });
    }
    if (filters.service) {
      const serviceLabel =
        SERVICE_OPTIONS.find((s) => s.value === filters.service)?.label || filters.service;
      chips.push({ key: "service", label: "Service", value: serviceLabel });
    }
    if (filters.minRate || filters.maxRate) {
      const rateValue =
        filters.minRate && filters.maxRate
          ? `$${filters.minRate}-$${filters.maxRate}`
          : filters.minRate
            ? `$${filters.minRate}+`
            : `Up to $${filters.maxRate}`;
      chips.push({ key: "minRate", label: "Rate", value: rateValue });
    }
    if (filters.minExperience) {
      chips.push({
        key: "minExperience",
        label: "Experience",
        value: `${filters.minExperience}+ years`,
      });
    }
    if (filters.availableToday) {
      chips.push({
        key: "availableToday",
        label: "Availability",
        value: "Today",
      });
    }
    if (filters.date) {
      chips.push({ key: "date", label: "Date", value: filters.date });
    }
    if (filters.minRating) {
      chips.push({
        key: "minRating",
        label: "Rating",
        value: `${filters.minRating}+ stars`,
      });
    }
    if (filters.verifiedOnly) {
      chips.push({ key: "verifiedOnly", label: "Status", value: "Verified" });
    }
    if (filters.backgroundChecked) {
      chips.push({
        key: "backgroundChecked",
        label: "Background",
        value: "Checked",
      });
    }
    if (filters.englishSpeaking) {
      chips.push({
        key: "englishSpeaking",
        label: "Language",
        value: "English Speaking",
      });
    }
    if (filters.petFriendly) {
      chips.push({
        key: "petFriendly",
        label: "Specialty",
        value: "Pet Friendly",
      });
    }
    if (filters.hasPassport) {
      chips.push({
        key: "hasPassport",
        label: "Travel",
        value: "Has Visa/Passport",
      });
    }
    if (filters.query) {
      chips.push({ key: "query", label: "Search", value: filters.query });
    }

    return chips;
  };

  /**
   * Remove a specific filter
   */
  const removeFilter = (key: keyof DirectoryFilters) => {
    const defaultValues: Partial<DirectoryFilters> = {
      country: null,
      city: null,
      neighborhood: null,
      radius: null,
      service: null,
      minRate: null,
      maxRate: null,
      minExperience: null,
      availableToday: false,
      date: null,
      minRating: null,
      verifiedOnly: false,
      backgroundChecked: false,
      englishSpeaking: false,
      petFriendly: false,
      hasPassport: false,
      query: null,
    };

    if (key in defaultValues) {
      setFilter(key, defaultValues[key] as DirectoryFilters[typeof key]);
    }

    // Special case: removing minRate should also remove maxRate
    if (key === "minRate" || key === "maxRate") {
      setFilters({ minRate: null, maxRate: null });
    }
  };

  return {
    filters,
    setFilters,
    setFilter,
    clearFilters,
    clearLocationFilters,
    activeFilterCount,
    hasActiveFilters,
    getActiveFilterChips,
    removeFilter,
  };
}

/**
 * Build API query params from filters
 */
export function buildApiQueryParams(
  filters: ReturnType<typeof useDirectoryFilters>["filters"]
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.country) {
    params.set("country", filters.country);
  }
  if (filters.city) {
    params.set("city", filters.city);
  }
  if (filters.neighborhood) {
    params.set("neighborhood", filters.neighborhood);
  }
  if (filters.radius) {
    params.set("radius", filters.radius.toString());
  }
  if (filters.service) {
    params.set("service", filters.service);
  }
  if (filters.minRate) {
    params.set("minRate", filters.minRate.toString());
  }
  if (filters.maxRate) {
    params.set("maxRate", filters.maxRate.toString());
  }
  if (filters.minExperience) {
    params.set("minExperience", filters.minExperience.toString());
  }
  if (filters.availableToday) {
    params.set("availableToday", "true");
  }
  if (filters.date) {
    params.set("date", filters.date);
  }
  if (filters.minRating) {
    params.set("minRating", filters.minRating.toString());
  }
  if (filters.verifiedOnly) {
    params.set("verifiedOnly", "true");
  }
  if (filters.backgroundChecked) {
    params.set("backgroundChecked", "true");
  }
  if (filters.englishSpeaking) {
    params.set("englishSpeaking", "true");
  }
  if (filters.petFriendly) {
    params.set("petFriendly", "true");
  }
  if (filters.hasPassport) {
    params.set("hasPassport", "true");
  }
  if (filters.query) {
    params.set("query", filters.query);
  }
  params.set("sort", filters.sort);
  params.set("page", filters.page.toString());

  return params;
}
