/**
 * Algolia Search Service
 * Handles unified search across all content using Algolia
 *
 * This service provides the same API as sanity-search-service.ts
 * but uses Algolia for better search quality, typo tolerance, and performance.
 */

import {
  searchChangelog as algoliaSearchChangelog,
  searchCityPages as algoliaSearchCityPages,
  searchHelpArticles as algoliaSearchHelpArticles,
  searchRoadmap as algoliaSearchRoadmap,
} from "@/lib/integrations/algolia";

export type SearchResultType = "help_article" | "changelog" | "roadmap" | "city_page";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
};

/**
 * Search help articles in Algolia
 */
async function searchHelpArticles(query: string, locale: string): Promise<SearchResult[]> {
  const response = await algoliaSearchHelpArticles({
    query,
    filters: `language:${locale} AND isPublished:true`,
    hitsPerPage: 10,
  });

  return response.hits.map((hit) => {
    const categorySlug = hit.category?.slug || "uncategorized";
    return {
      id: hit.objectID,
      type: "help_article" as const,
      title: hit.title,
      description: hit.excerpt,
      url: `/${locale}/help/${categorySlug}/${hit.slug}`,
      metadata: {
        category: hit.category?.title,
        categorySlug,
        views: 0, // Views are not indexed in Algolia
      },
    };
  });
}

/**
 * Search changelog entries in Algolia
 */
async function searchChangelogs(query: string, locale: string): Promise<SearchResult[]> {
  const response = await algoliaSearchChangelog({
    query,
    filters: `language:${locale}`,
    hitsPerPage: 10,
  });

  return response.hits.map((hit) => ({
    id: hit.objectID,
    type: "changelog" as const,
    title: hit.title,
    description: hit.summary,
    url: `/${locale}/changelog/${hit.slug}`,
    metadata: {
      sprintNumber: hit.sprintNumber,
      categories: hit.categories,
      publishedAt: hit.publishedAt,
    },
  }));
}

/**
 * Search roadmap items in Algolia
 */
async function searchRoadmapItems(query: string, locale: string): Promise<SearchResult[]> {
  const response = await algoliaSearchRoadmap({
    query,
    filters: `language:${locale} AND isPublished:true`,
    hitsPerPage: 10,
  });

  return response.hits.map((hit) => ({
    id: hit.objectID,
    type: "roadmap" as const,
    title: hit.title,
    description: hit.description,
    url: `/${locale}/roadmap#${hit.slug}`,
    metadata: {
      status: hit.status,
      category: hit.category,
    },
  }));
}

/**
 * Search city pages in Algolia
 */
async function searchCityPages(query: string, locale: string): Promise<SearchResult[]> {
  const response = await algoliaSearchCityPages({
    query,
    filters: `language:${locale} AND isPublished:true`,
    hitsPerPage: 5,
  });

  return response.hits.map((hit) => ({
    id: hit.objectID,
    type: "city_page" as const,
    title: hit.name,
    description: hit.heroSubtitle,
    url: `/${locale}/${hit.slug}`,
    metadata: {
      services: hit.services || [],
    },
  }));
}

/**
 * Unified search orchestrator
 * Searches across selected content types based on filter
 *
 * This function maintains the same API as the Sanity search service
 * to allow easy switching between implementations.
 */
export async function searchAllContent({
  query,
  locale,
  typeFilter,
  limit,
}: {
  query: string;
  locale: string;
  typeFilter: string;
  limit: number;
}): Promise<{
  results: SearchResult[];
  total: number;
}> {
  const searchPromises: Promise<SearchResult[]>[] = [];

  // Add search promises based on type filter
  if (typeFilter === "all" || typeFilter === "help") {
    searchPromises.push(searchHelpArticles(query, locale));
  }

  if (typeFilter === "all" || typeFilter === "changelog") {
    searchPromises.push(searchChangelogs(query, locale));
  }

  if (typeFilter === "all" || typeFilter === "roadmap") {
    searchPromises.push(searchRoadmapItems(query, locale));
  }

  if (typeFilter === "all" || typeFilter === "city") {
    searchPromises.push(searchCityPages(query, locale));
  }

  // Execute all searches in parallel
  const searchResults = await Promise.all(searchPromises);

  // Flatten and combine all results
  const allResults = searchResults.flat();

  // Apply limit
  const limitedResults = allResults.slice(0, limit);

  return {
    results: limitedResults,
    total: allResults.length,
  };
}

/**
 * Get search suggestions for autocomplete (Algolia-specific feature)
 * This is a new feature not available in the Sanity implementation
 */
export async function getSearchSuggestions(
  query: string,
  locale: string,
  maxResults = 5
): Promise<Array<{ id: string; title: string; type: SearchResultType }>> {
  if (query.length < 2) {
    return [];
  }

  // Search across all content types with minimal results
  const [helpArticles, changelog, roadmap, cityPages] = await Promise.all([
    algoliaSearchHelpArticles({
      query,
      filters: `language:${locale} AND isPublished:true`,
      hitsPerPage: Math.ceil(maxResults / 4),
      attributesToRetrieve: ["objectID", "title"],
    }),
    algoliaSearchChangelog({
      query,
      filters: `language:${locale}`,
      hitsPerPage: Math.ceil(maxResults / 4),
      attributesToRetrieve: ["objectID", "title"],
    }),
    algoliaSearchRoadmap({
      query,
      filters: `language:${locale} AND isPublished:true`,
      hitsPerPage: Math.ceil(maxResults / 4),
      attributesToRetrieve: ["objectID", "title"],
    }),
    algoliaSearchCityPages({
      query,
      filters: `language:${locale} AND isPublished:true`,
      hitsPerPage: Math.ceil(maxResults / 4),
      attributesToRetrieve: ["objectID", "title", "name"],
    }),
  ]);

  const suggestions = [
    ...helpArticles.hits.map((hit) => ({
      id: hit.objectID,
      title: hit.title,
      type: "help_article" as const,
    })),
    ...changelog.hits.map((hit) => ({
      id: hit.objectID,
      title: hit.title,
      type: "changelog" as const,
    })),
    ...roadmap.hits.map((hit) => ({
      id: hit.objectID,
      title: hit.title,
      type: "roadmap" as const,
    })),
    // @ts-expect-error - cityPages uses 'name' instead of 'title'
    ...cityPages.hits.map((hit) => ({
      id: hit.objectID,
      // @ts-expect-error - cityPages uses 'name' instead of 'title'
      title: hit.name,
      type: "city_page" as const,
    })),
  ];

  return suggestions.slice(0, maxResults);
}
