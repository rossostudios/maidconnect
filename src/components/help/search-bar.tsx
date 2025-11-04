"use client";

import { Loader2, Search, X } from "lucide-react";
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
};

export function HelpSearchBar({
  placeholder,
  autoFocus = false,
  className = "",
}: HelpSearchBarProps) {
  const t = useTranslations("help");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

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
          limit_count: 5,
        });

        if (error) {
          console.error("Search error:", error);
          setResults([]);
        } else {
          setResults((data as SearchResult[]) || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    searchArticles(debouncedQuery).catch(() => {
      // Handle error silently
    });
  }, [debouncedQuery, searchArticles]);

  const handleResultClick = (result: SearchResult) => {
    router.push(`/${locale}/help/${result.category_slug}/${result.slug}`);
    setQuery("");
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          autoFocus={autoFocus}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-12 text-gray-900 placeholder-gray-500 focus:border-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#8B7355]/20"
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
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
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
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
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#8B7355]" />
                  <span className="text-gray-600 text-sm">{t("search.searching")}</span>
                </div>
              );
            }
            if (results.length > 0) {
              return (
                <div className="max-h-96 overflow-y-auto">
                  {results.map((result) => (
                    <button
                      className="w-full border-gray-100 border-b px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50"
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      type="button"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600 text-xs">
                          {result.category_name}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900">{result.title}</div>
                      {result.excerpt && (
                        <p className="mt-1 line-clamp-2 text-gray-600 text-sm">{result.excerpt}</p>
                      )}
                    </button>
                  ))}

                  <div className="border-gray-100 border-t bg-gray-50 px-4 py-2 text-center">
                    <button
                      className="text-[#8B7355] text-sm hover:underline"
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
                  className="mt-2 text-[#8B7355] text-sm hover:underline"
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
