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

  // Utility: Escape HTML to prevent XSS
  const escapeHTML = (str: string): string => {
    const htmlEscapeMap: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "/": "&#x2F;",
    };
    return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
  };

  // Utility: Highlight search terms in text (XSS-safe)
  const highlightSearchTerm = useCallback((text: string, searchQuery: string): string => {
    if (!searchQuery.trim()) {
      return escapeHTML(text);
    }
    // First escape HTML entities to prevent XSS
    const escapedText = escapeHTML(text);
    const escapedQueryForHTML = escapeHTML(searchQuery);

    // Escape special regex characters
    const escapedQuery = escapedQueryForHTML.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return escapedText.replace(
      regex,
      '<mark class="bg-[#64748b]/20 text-[#0f172a] font-medium">$1</mark>'
    );
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
        // Use the new unified Sanity-based search API
        const params = new URLSearchParams({
          q: searchQuery,
          locale,
          type: "help", // Only search help articles
          limit: "8",
        });

        const response = await fetch(`/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = await response.json();

        if (data.success) {
          // Transform Sanity search results to match the expected format
          const searchResults: SearchResult[] = (data.data || []).map((result: any) => {
            // Extract slugs from URL path (/locale/help/category/article)
            const urlParts = result.url.split("/").filter(Boolean);
            const categorySlug = result.metadata?.categorySlug || urlParts[2] || "";
            const articleSlug = urlParts[3] || "";

            return {
              id: result.id,
              category_id: result.metadata?.category || "",
              category_slug: categorySlug,
              category_name: result.metadata?.category || "",
              slug: articleSlug,
              title: result.title,
              excerpt: result.description,
              rank: 0, // Not provided by new API
            };
          });

          setResults(searchResults);

          // Track search analytics
          trackSearch(searchQuery, searchResults.length);
        } else {
          console.error("Search error:", data.error);
          setResults([]);
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
          <HugeiconsIcon className="h-5 w-5 text-[#94a3b8]/70" icon={Search01Icon} />
        </div>

        <input
          autoFocus={autoFocus}
          className="w-full rounded-lg border border-[#94a3b8]/40 bg-[#f8fafc] py-3 pr-10 pl-12 text-[#0f172a] placeholder-[#94a3b8] focus:border-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#64748b]/20"
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
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#94a3b8]/70 hover:text-[#94a3b8]"
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
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-[#e2e8f0] bg-[#f8fafc] shadow-lg">
          {(() => {
            if (isLoading && results.length === 0) {
              return (
                <div className="flex items-center justify-center px-4 py-8">
                  <HugeiconsIcon
                    className="mr-2 h-5 w-5 animate-spin text-[#64748b]"
                    icon={Loading01Icon}
                  />
                  <span className="text-[#94a3b8] text-sm">{t("search.searching")}</span>
                </div>
              );
            }
            if (results.length > 0) {
              return (
                <div className="max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <button
                      className={`w-full border-[#e2e8f0]/40 border-b px-4 py-3 text-left transition last:border-b-0 ${
                        selectedIndex === index
                          ? "border-[#64748b] bg-[#64748b]/10"
                          : "hover:bg-[#f8fafc]"
                      }`}
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      type="button"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-[#e2e8f0]/30 px-2 py-0.5 text-[#94a3b8] text-xs">
                          {result.category_name}
                        </span>
                      </div>
                      <div
                        className="font-medium text-[#0f172a]"
                        // snyk:ignore javascript/DOMXSS - Content is sanitized via escapeHTML() in highlightSearchTerm (line 64-69)
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(result.title, query),
                        }}
                      />
                      {result.excerpt && (
                        <p
                          className="mt-1 line-clamp-2 text-[#94a3b8] text-sm"
                          // snyk:ignore javascript/DOMXSS - Content is sanitized via escapeHTML() in highlightSearchTerm (line 64-69)
                          dangerouslySetInnerHTML={{
                            __html: highlightSearchTerm(result.excerpt, query),
                          }}
                        />
                      )}
                    </button>
                  ))}

                  <div className="border-[#e2e8f0]/40 border-t bg-[#f8fafc] px-4 py-2 text-center">
                    <button
                      className="text-[#64748b] text-sm hover:underline"
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
                <p className="text-[#94a3b8] text-sm">{t("search.noResults")}</p>
                <button
                  className="mt-2 text-[#64748b] text-sm hover:underline"
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
