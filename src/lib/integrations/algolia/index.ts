/**
 * Algolia Integration - Main Export
 *
 * Centralized exports for the Algolia integration.
 * Import from this file to access all Algolia functionality.
 */

// Client exports
export {
  configureIndexSettings,
  createSearchClient,
  createWriteClient,
  getBrowserSearchClient,
  getSearchIndex,
  getWriteIndex,
  initializeIndices,
} from "./client";

// Search exports
export {
  getSearchSuggestions,
  searchAll,
  searchChangelog,
  searchCityPages,
  searchHelpArticles,
  searchProfessionals,
  searchRoadmap,
} from "./search";

// Sync exports
export {
  batchIndexDocuments,
  clearIndex,
  deleteRecord,
  indexChangelog,
  indexCityPage,
  indexHelpArticle,
  indexRoadmapItem,
  portableTextToPlainText,
  syncDocument,
  transformChangelog,
  transformCityPage,
  transformHelpArticle,
  transformRoadmapItem,
} from "./sync";

// Type exports
export {
  ALGOLIA_INDICES,
  type AlgoliaIndexName,
  type AlgoliaRecord,
  type AlgoliaRecordType,
  type AlgoliaSearchHit,
  type AlgoliaSearchParams,
  type AlgoliaSearchResponse,
  type ChangelogRecord,
  type CityPageRecord,
  type HelpArticleRecord,
  type ProfessionalRecord,
  type RoadmapItemRecord,
} from "./types";
