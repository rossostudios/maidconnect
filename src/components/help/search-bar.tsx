"use client";

import { Cancel01Icon, Loading01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type SearchResult = {
  id: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  slug: string;
  title: string;
  excerpt: string | null;
  rank: number;
};

type HelpSearchBarProps = {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onClose?: () => void;
};

export function HelpSearchBar({
  placeholder,
  autoFocus = false,
  className = "",
  onClose,
}: HelpSearchBarProps) {
  const t = useTranslations("help");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, []);

  // Utility: Highlight search terms in text
  const highlightSearchTerm = useCallback((text: string, searchQuery: string): string => {
    if (!searchQuery.trim()) {
      return text;
    }
    // Escape special regex characters
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 font-medium">$1</mark>');
  }, []);

  // Track search analytics
  const trackSearch = useCallback(
    async (searchQuery: string, resultCount: number) => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let sessionId = localStorage.getItem("help_session_id");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem("help_session_id", sessionId);
        }

        await supabase.from("help_search_analytics").insert({
          query: searchQuery.trim(),
          locale,
          result_count: resultCount,
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
        });
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.error("Analytics tracking failed:", error);
      }
    },
    [locale]
  );

  const searchArticles = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.rpc("search_help_articles", {
          search_query: searchQuery,
          locale,
          limit_count: 8, // Increased from 5 to 8
        });

        if (error) {
          console.error("Search error:", error);
          setResults([]);
        } else {
          const searchResults = (data as SearchResult[]) || [];
          setResults(searchResults);

          // Track search analytics
          trackSearch(searchQuery, searchResults.length);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [locale, trackSearch]
  );

  useEffect(() => {
    searchArticles(debouncedQuery).catch(() => {
      // Handle error silently
    });
  }, [debouncedQuery, searchArticles]);

  const handleResultClick = async (result: SearchResult) => {
    // Track the click in analytics
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const sessionId = localStorage.getItem("help_session_id");

      await supabase
        .from("help_search_analytics")
        .update({ clicked_article_id: result.id })
        .match({
          query: query.trim(),
          locale,
          ...(user ? { user_id: user.id } : { session_id: sessionId }),
        })
        .order("created_at", { ascending: false })
        .limit(1);
    } catch (error) {
      console.error("Click tracking failed:", error);
    }

    // Navigate to article
    router.push(`/${locale}/help/${result.category_slug}/${result.slug}`);
    setQuery("");
    setShowResults(false);
    onClose?.();
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    onClose?.();
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <HugeiconsIcon className="h-5 w-5 text-gray-400" icon={Search01Icon} />
        </div>

        <input
          autoFocus={autoFocus}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-12 text-gray-900 placeholder-gray-500 focus:border-[#E85D48] focus:outline-none focus:ring-2 focus:ring-[#E85D48]/20"
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("search.placeholder")}
          type="search"
          value={query}
        />

        {/* Clear/Loading button */}
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
            type="button"
          >
            {isLoading ? (
              <HugeiconsIcon className="h-5 w-5 animate-spin" icon={Loading01Icon} />
            ) : (
              <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {(() => {
            if (isLoading && results.length === 0) {
              return (
                <div className="flex items-center justify-center px-4 py-8">
                  <HugeiconsIcon
                    className="mr-2 h-5 w-5 animate-spin text-[#E85D48]"
                    icon={Loading01Icon}
                  />
                  <span className="text-gray-600 text-sm">{t("search.searching")}</span>
                </div>
              );
            }
            if (results.length > 0) {
              return (
                <div className="max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <button
                      className={`w-full border-gray-100 border-b px-4 py-3 text-left transition last:border-b-0 ${
                        selectedIndex === index
                          ? "border-[#E85D48] bg-[#E85D48]/10"
                          : "hover:bg-gray-50"
                      }`}
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      type="button"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600 text-xs">
                          {result.category_name}
                        </span>
                      </div>
                      <div
                        className="font-medium text-gray-900"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(result.title, query),
                        }}
                      />
                      {result.excerpt && (
                        <p
                          className="mt-1 line-clamp-2 text-gray-600 text-sm"
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerm(result.excerpt, query),
                          }}
                        />
                      )}
                    </button>
                  ))}

                  <div className="border-gray-100 border-t bg-gray-50 px-4 py-2 text-center">
                    <button
                      className="text-[#E85D48] text-sm hover:underline"
                      onClick={() => {
                        router.push(`/${locale}/help?q=${encodeURIComponent(query)}`);
                        setShowResults(false);
                      }}
                      type="button"
                    >
                      {t("search.viewAll")}
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-600 text-sm">{t("search.noResults")}</p>
                <button
                  className="mt-2 text-[#E85D48] text-sm hover:underline"
                  onClick={() => router.push(`/${locale}/help`)}
                  type="button"
                >
                  {t("search.browseAll")}
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Backdrop to close results */}
      {showResults && query.length >= 2 && (
        <button
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowResults(false);
            }
          }}
          tabIndex={-1}
          type="button"
        >
          <span className="sr-only">Close search results</span>
        </button>
      )}
    </div>
  );
}
