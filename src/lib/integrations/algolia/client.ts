/**
 * Algolia Integration - Client Setup
 *
 * Provides configured Algolia clients for server and browser contexts.
 * Server clients use Write API key for indexing.
 * Browser clients use Search API key (read-only) for searching.
 */

import type { SearchClient } from "algoliasearch";
import { algoliasearch } from "algoliasearch";
import { ALGOLIA_INDICES } from "./types";

/**
 * Validate required environment variables
 */
function validateEnv() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;

  if (!appId) {
    throw new Error(
      "Missing NEXT_PUBLIC_ALGOLIA_APP_ID environment variable. Please add it to .env.local"
    );
  }

  return { appId };
}

/**
 * Create a search-only Algolia client (safe for browser)
 * Uses the Search API key which is read-only
 */
export function createSearchClient(): SearchClient {
  const { appId } = validateEnv();
  const searchApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

  if (!searchApiKey) {
    throw new Error("Missing NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY environment variable");
  }

  return algoliasearch(appId, searchApiKey);
}

/**
 * Create a write-capable Algolia client (server-side only)
 * Uses the Write API key for indexing operations
 *
 * ⚠️ WARNING: Never expose this client to the browser!
 */
export function createWriteClient(): SearchClient {
  const { appId } = validateEnv();
  const writeApiKey = process.env.ALGOLIA_WRITE_API_KEY;

  if (!writeApiKey) {
    throw new Error(
      "Missing ALGOLIA_WRITE_API_KEY environment variable. This should only be used server-side."
    );
  }

  return algoliasearch(appId, writeApiKey);
}

/**
 * Get a typed index for searching (browser-safe)
 * Note: Algolia v5 doesn't use .index() method anymore.
 * Use searchClient directly with search methods or implement initIndex if needed.
 * TODO: Implement Algolia v5 API for index access
 */
export function getSearchIndex(indexName: string) {
  const client = createSearchClient();
  return { client, indexName } as any;
}

/**
 * Get a typed index for writing (server-side only)
 * Note: Algolia v5 doesn't use .index() method anymore.
 * Use writeClient directly with indexing methods or implement initIndex if needed.
 * TODO: Implement Algolia v5 API for index access
 */
export function getWriteIndex(indexName: string) {
  const client = createWriteClient();
  return { client, indexName } as any;
}

/**
 * Initialize all indices (useful for setup scripts)
 * Returns a map of index names to write-capable index instances
 * TODO: Implement Algolia v5 API for index access
 */
export function initializeIndices() {
  const client = createWriteClient();

  return {
    helpArticles: { client, indexName: ALGOLIA_INDICES.HELP_ARTICLES },
    changelog: { client, indexName: ALGOLIA_INDICES.CHANGELOG },
    roadmap: { client, indexName: ALGOLIA_INDICES.ROADMAP },
    cityPages: { client, indexName: ALGOLIA_INDICES.CITY_PAGES },
    professionals: { client, indexName: ALGOLIA_INDICES.PROFESSIONALS },
  } as any;
}

/**
 * Configure index settings for optimal search experience
 * This should be run once during setup or when updating search configuration
 */
async function configureIndexSettings() {
  const indices = initializeIndices();

  // Help Articles Index Configuration
  await indices.helpArticles.setSettings({
    searchableAttributes: [
      "title", // Highest priority
      "excerpt",
      "content",
      "category.title",
      "tags.title",
    ],
    attributesForFaceting: ["language", "category.title", "tags.title", "isPublished"],
    customRanking: ["desc(publishedAt)"],
    attributesToSnippet: ["content:50", "excerpt:30"],
    attributesToHighlight: ["title", "excerpt", "content"],
    hitsPerPage: 20,
    // biome-ignore lint/style/useNamingConvention: Algolia API uses snake_case
    typo_tolerance: true,
  });

  // Changelog Index Configuration
  await indices.changelog.setSettings({
    searchableAttributes: ["title", "summary", "content", "tags"],
    attributesForFaceting: ["language", "categories", "targetAudience", "sprintNumber"],
    customRanking: ["desc(publishedAt)", "desc(sprintNumber)"],
    attributesToSnippet: ["content:50", "summary:30"],
    attributesToHighlight: ["title", "summary", "content"],
    hitsPerPage: 20,
    // biome-ignore lint/style/useNamingConvention: Algolia API uses snake_case
    typo_tolerance: true,
  });

  // Roadmap Index Configuration
  await indices.roadmap.setSettings({
    searchableAttributes: ["title", "description", "category"],
    attributesForFaceting: ["language", "status", "category", "isPublished"],
    customRanking: ["desc(upvotes)", "desc(publishedAt)"],
    attributesToSnippet: ["description:50"],
    attributesToHighlight: ["title", "description"],
    hitsPerPage: 20,
    // biome-ignore lint/style/useNamingConvention: Algolia API uses snake_case
    typo_tolerance: true,
  });

  // City Pages Index Configuration
  await indices.cityPages.setSettings({
    searchableAttributes: ["name", "heroTitle", "heroSubtitle", "services", "seoContent"],
    attributesForFaceting: ["language", "services", "isPublished"],
    customRanking: ["desc(_updatedAt)"],
    attributesToSnippet: ["seoContent:50", "heroSubtitle:30"],
    attributesToHighlight: ["name", "heroTitle", "heroSubtitle"],
    hitsPerPage: 20,
    // biome-ignore lint/style/useNamingConvention: Algolia API uses snake_case
    typo_tolerance: true,
  });

  // Professionals Index Configuration (synced from Supabase)
  await indices.professionals.setSettings({
    searchableAttributes: ["full_name", "bio", "services", "city", "country"],
    attributesForFaceting: ["services", "city", "country", "is_verified", "is_active"],
    customRanking: ["desc(rating)", "desc(total_reviews)", "desc(is_verified)"],
    attributesToSnippet: ["bio:50"],
    attributesToHighlight: ["full_name", "bio", "services"],
    hitsPerPage: 20,
    // biome-ignore lint/style/useNamingConvention: Algolia API uses snake_case
    typo_tolerance: true,
  });

  console.log("✅ Algolia index settings configured successfully");
}

/**
 * Singleton search client for browser use
 * Lazily instantiated to avoid errors during SSR
 */
let browserSearchClient: SearchClient | null = null;

function getBrowserSearchClient(): SearchClient {
  if (typeof window === "undefined") {
    throw new Error("getBrowserSearchClient() can only be called in the browser");
  }

  if (!browserSearchClient) {
    browserSearchClient = createSearchClient();
  }

  return browserSearchClient;
}
