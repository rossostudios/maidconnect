/**
 * Algolia Integration - Search Functions
 *
 * Provides typed search functions for each Algolia index.
 * All search functions use the search-only client (safe for browser).
 */

import { getSearchIndex } from "./client";
import { ALGOLIA_INDICES, type AlgoliaSearchParams } from "./types";

/**
 * Search help articles
 */
export async function searchHelpArticles(params: AlgoliaSearchParams) {
  const index = getSearchIndex(ALGOLIA_INDICES.HELP_ARTICLES);

  const searchParams = {
    query: params.query,
    filters: params.filters,
    facetFilters: params.facetFilters,
    attributesToRetrieve: params.attributesToRetrieve,
    attributesToHighlight: params.attributesToHighlight ?? ["title", "excerpt", "content"],
    attributesToSnippet: params.attributesToSnippet ?? ["content:50", "excerpt:30"],
    hitsPerPage: params.hitsPerPage ?? 20,
    page: params.page ?? 0,
  };

  return await index.search(params.query, searchParams);
}

/**
 * Search changelog entries
 */
export async function searchChangelog(params: AlgoliaSearchParams) {
  const index = getSearchIndex(ALGOLIA_INDICES.CHANGELOG);

  const searchParams = {
    query: params.query,
    filters: params.filters,
    facetFilters: params.facetFilters,
    attributesToRetrieve: params.attributesToRetrieve,
    attributesToHighlight: params.attributesToHighlight ?? ["title", "summary", "content"],
    attributesToSnippet: params.attributesToSnippet ?? ["content:50", "summary:30"],
    hitsPerPage: params.hitsPerPage ?? 20,
    page: params.page ?? 0,
  };

  return await index.search(params.query, searchParams);
}

/**
 * Search roadmap items
 */
export async function searchRoadmap(params: AlgoliaSearchParams) {
  const index = getSearchIndex(ALGOLIA_INDICES.ROADMAP);

  const searchParams = {
    query: params.query,
    filters: params.filters,
    facetFilters: params.facetFilters,
    attributesToRetrieve: params.attributesToRetrieve,
    attributesToHighlight: params.attributesToHighlight ?? ["title", "description"],
    attributesToSnippet: params.attributesToSnippet ?? ["description:50"],
    hitsPerPage: params.hitsPerPage ?? 20,
    page: params.page ?? 0,
  };

  return await index.search(params.query, searchParams);
}

/**
 * Search city pages
 */
export async function searchCityPages(params: AlgoliaSearchParams) {
  const index = getSearchIndex(ALGOLIA_INDICES.CITY_PAGES);

  const searchParams = {
    query: params.query,
    filters: params.filters,
    facetFilters: params.facetFilters,
    attributesToRetrieve: params.attributesToRetrieve,
    attributesToHighlight: params.attributesToHighlight ?? ["name", "heroTitle", "heroSubtitle"],
    attributesToSnippet: params.attributesToSnippet ?? ["seoContent:50", "heroSubtitle:30"],
    hitsPerPage: params.hitsPerPage ?? 20,
    page: params.page ?? 0,
  };

  return await index.search(params.query, searchParams);
}

/**
 * Search professionals (synced from Supabase)
 */
export async function searchProfessionals(params: AlgoliaSearchParams) {
  const index = getSearchIndex(ALGOLIA_INDICES.PROFESSIONALS);

  const searchParams = {
    query: params.query,
    filters: params.filters,
    facetFilters: params.facetFilters,
    attributesToRetrieve: params.attributesToRetrieve,
    attributesToHighlight: params.attributesToHighlight ?? ["full_name", "bio", "services"],
    attributesToSnippet: params.attributesToSnippet ?? ["bio:50"],
    hitsPerPage: params.hitsPerPage ?? 20,
    page: params.page ?? 0,
  };

  return await index.search(params.query, searchParams);
}

/**
 * Multi-index search across all content types
 * Useful for global search like CMD K
 */
export async function searchAll(query: string, language?: "en" | "es") {
  const languageFilter = language ? `language:${language}` : undefined;

  const [helpArticles, changelog, roadmap, cityPages, professionals] = await Promise.all([
    searchHelpArticles({
      query,
      filters: languageFilter,
      hitsPerPage: 5,
    }),
    searchChangelog({
      query,
      filters: languageFilter,
      hitsPerPage: 5,
    }),
    searchRoadmap({
      query,
      filters: languageFilter,
      hitsPerPage: 5,
    }),
    searchCityPages({
      query,
      filters: languageFilter,
      hitsPerPage: 5,
    }),
    searchProfessionals({
      query,
      filters: "is_active:true",
      hitsPerPage: 5,
    }),
  ]);

  return {
    helpArticles: helpArticles.hits,
    changelog: changelog.hits,
    roadmap: roadmap.hits,
    cityPages: cityPages.hits,
    professionals: professionals.hits,
    total:
      helpArticles.nbHits +
      changelog.nbHits +
      roadmap.nbHits +
      cityPages.nbHits +
      professionals.nbHits,
  };
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(query: string, indexName: string, maxResults = 5) {
  const index = getSearchIndex(indexName);

  const results = await index.search(query, {
    hitsPerPage: maxResults,
    attributesToRetrieve: ["title", "name", "full_name"],
    attributesToHighlight: ["title", "name", "full_name"],
  });

  return results.hits.map((hit: any) => ({
    objectID: hit.objectID,
    text: hit.title || hit.name || hit.full_name || "",
    highlightedText:
      hit._highlightResult?.title?.value ||
      hit._highlightResult?.name?.value ||
      hit._highlightResult?.full_name?.value ||
      "",
  }));
}
