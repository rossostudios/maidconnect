"use client";

import { Cancel01Icon, Loading01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Search Bar Component with Autocomplete
 *
 * Research insights applied:
 * - Algolia: Autocomplete after 2-3 characters for optimal UX
 * - Constructor: 24% of users search, they drive 44% of revenue
 * - Baymard Institute: 80% of sites use autocomplete, only 19% do it well
 * - Debouncing: 300ms standard for search-as-you-type
 * - Mobile-first: Critical for small screens where typing is harder
 * - Keyboard navigation: Up/down arrows, enter to select, escape to close
 */

export type SearchSuggestion = {
  id: string;
  name: string;
  service: string | null;
  location: string;
  photoUrl: string;
  rating?: number;
  reviewCount?: number;
};

type SearchBarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
};

export function SearchBar({
  placeholder = "Search by name, service, or location...",
  onSearch,
  onSuggestionSelect,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce query to avoid excessive API calls (300ms standard)
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Only search if query is 2+ characters (research-backed threshold)
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/professionals/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setSuggestions(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("[SearchBar] Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions().catch(() => {
      // Handle error silently
    });
  }, [debouncedQuery]);

  // Handlers
  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleSearch = useCallback(() => {
    onSearch(query);
    setIsOpen(false);
  }, [onSearch, query]);

  const handleSuggestionClick = useCallback(
    (suggestion: SearchSuggestion) => {
      setQuery(suggestion.name);
      setIsOpen(false);
      onSuggestionSelect?.(suggestion);
    },
    [onSuggestionSelect]
  );

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    onSearch("");
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]!);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, handleSearch, handleSuggestionClick]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <HugeiconsIcon
          className="-transtone-y-1/2 pointer-events-none absolute top-1/2 left-5 h-6 w-6 text-[#94a3b8]"
          icon={Search01Icon}
        />
        <input
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={isOpen}
          autoComplete="off"
          className="w-full rounded-full border border-[#e2e8f0] bg-[#f8fafc] py-4 pr-14 pl-14 text-[#0f172a] text-base shadow-[#0f172a]/5 shadow-inner outline-none transition focus:border-[#0f172a]"
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          ref={inputRef}
          role="combobox"
          type="search"
          value={query}
        />

        {/* Loading / Clear Button */}
        <div className="-transtone-y-1/2 absolute top-1/2 right-5 flex items-center gap-2">
          {isLoading && (
            <HugeiconsIcon className="h-5 w-5 animate-spin text-[#94a3b8]" icon={Loading01Icon} />
          )}
          {query.length > 0 && !isLoading && (
            <button
              aria-label="Clear search"
              className="rounded-full p-1 transition hover:bg-[#e2e8f0]"
              onClick={handleClear}
              type="button"
            >
              <HugeiconsIcon className="h-5 w-5 text-[#94a3b8]" icon={Cancel01Icon} />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] shadow-[0_20px_60px_rgba(22,22,22,0.12)]"
          id="search-suggestions"
          ref={dropdownRef}
          role="listbox"
        >
          <div className="max-h-[400px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                aria-selected={index === selectedIndex}
                className={`flex w-full items-center gap-4 border-[#e2e8f0] border-b px-5 py-4 text-left transition last:border-b-0 ${
                  index === selectedIndex ? "bg-[#f8fafc]" : "hover:bg-[#f8fafc]"
                }`}
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                type="button"
              >
                {/* Professional Photo */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#e2e8f0]">
                  <Image
                    alt={suggestion.name}
                    className="h-full w-full object-cover"
                    height={48}
                    loading="lazy"
                    src={suggestion.photoUrl}
                    width={48}
                  />
                </div>

                {/* Professional Info */}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[#0f172a] text-base">
                    {highlightMatch(suggestion.name, query)}
                  </div>
                  <div className="text-[#94a3b8] text-sm">
                    {suggestion.service
                      ? highlightMatch(suggestion.service, query)
                      : "Flexible services"}
                  </div>
                  <div className="text-[#94a3b8] text-xs">
                    {highlightMatch(suggestion.location, query)}
                  </div>
                </div>

                {/* Rating (if available) */}
                {suggestion.rating !== undefined && suggestion.rating > 0 && (
                  <div className="flex flex-shrink-0 items-center gap-1 text-sm">
                    <span className="text-[#0f172a]">★</span>
                    <span className="font-semibold text-[#0f172a]">
                      {suggestion.rating.toFixed(1)}
                    </span>
                    {suggestion.reviewCount !== undefined && suggestion.reviewCount > 0 && (
                      <span className="text-[#94a3b8]">({suggestion.reviewCount})</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="border-[#e2e8f0] border-t bg-[#f8fafc] px-5 py-3">
            <p className="text-center text-[#94a3b8] text-xs">
              Use ↑↓ to navigate, Enter to select, Esc to close
            </p>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isOpen && !isLoading && query.length >= 2 && suggestions.length === 0 && (
        <div
          className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] shadow-[0_20px_60px_rgba(22,22,22,0.12)]"
          ref={dropdownRef}
        >
          <div className="px-5 py-8 text-center">
            <p className="text-[#94a3b8] text-sm">No professionals found for "{query}"</p>
            <p className="mt-1 text-[#94a3b8] text-xs">
              Try searching by name, service type, or city
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Highlight matching text in suggestion
 * Makes it easier for users to see why a result matched
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) {
    return text;
  }

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <mark className="bg-[#64748b]/10 font-semibold text-[#0f172a]" key={index}>
          {part}
        </mark>
      );
    }
    return part;
  });
}

/**
 * Escape special regex characters in user input
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
