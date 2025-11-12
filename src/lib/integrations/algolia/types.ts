/**
 * Algolia Integration - TypeScript Types
 *
 * Defines the shape of records indexed in Algolia for type-safe searching.
 * Each record type corresponds to a Sanity document type or Supabase table.
 */

/**
 * Base Algolia record interface
 * All Algolia records must have an objectID (unique identifier)
 */
export type AlgoliaRecord = {
  objectID: string;
};

/**
 * Help Article record (from Sanity CMS)
 * Searchable fields: title, excerpt, content
 */
export interface HelpArticleRecord extends AlgoliaRecord {
  _type: "helpArticle";
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Portable text converted to plain text
  category: {
    _id: string;
    title: string;
    slug: string;
  } | null;
  tags: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  language: "en" | "es";
  isPublished: boolean;
  publishedAt: string; // ISO timestamp
  _updatedAt: string;
}

/**
 * Changelog record (from Sanity CMS)
 * Searchable fields: title, summary, content
 */
export interface ChangelogRecord extends AlgoliaRecord {
  _type: "changelog";
  sprintNumber: number;
  title: string;
  slug: string;
  summary: string;
  content: string; // Portable text converted to plain text
  categories: string[]; // bug-fix, feature, improvement, breaking-change
  tags: string[];
  targetAudience: string[]; // customer, professional, admin
  language: "en" | "es";
  publishedAt: string;
  _updatedAt: string;
}

/**
 * Roadmap Item record (from Sanity CMS)
 * Searchable fields: title, description
 */
export interface RoadmapItemRecord extends AlgoliaRecord {
  _type: "roadmapItem";
  title: string;
  slug: string;
  description: string;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  category: string; // customer, professional, admin, platform
  upvotes: number;
  language: "en" | "es";
  isPublished: boolean;
  publishedAt: string;
  estimatedDate: string | null;
  _updatedAt: string;
}

/**
 * City Page record (from Sanity CMS)
 * Searchable fields: name, heroTitle, heroSubtitle, seoContent
 */
export interface CityPageRecord extends AlgoliaRecord {
  _type: "cityPage";
  name: string;
  slug: string;
  heroTitle: string;
  heroSubtitle: string;
  services: string[];
  seoContent: string;
  language: "en" | "es";
  isPublished: boolean;
  _updatedAt: string;
}

/**
 * Professional record (from Supabase - synced via Supabase Connector)
 * Searchable fields: name, bio, services, city
 */
export interface ProfessionalRecord extends AlgoliaRecord {
  // objectID is profile.id
  full_name: string;
  bio: string;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  city: string;
  country: string;
  services: string[]; // Aggregated from professional_services join
  profile_image_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

/**
 * Union type of all Algolia records
 */
export type AlgoliaRecordType =
  | HelpArticleRecord
  | ChangelogRecord
  | RoadmapItemRecord
  | CityPageRecord
  | ProfessionalRecord;

/**
 * Index name mapping
 */
export const ALGOLIA_INDICES = {
  HELP_ARTICLES: "help_articles",
  CHANGELOG: "changelog",
  ROADMAP: "roadmap",
  CITY_PAGES: "city_pages",
  PROFESSIONALS: "professionals",
} as const;

export type AlgoliaIndexName = (typeof ALGOLIA_INDICES)[keyof typeof ALGOLIA_INDICES];

/**
 * Search result with highlighting
 */
export type AlgoliaSearchHit<T extends AlgoliaRecord> = T & {
  _highlightResult?: {
    [K in keyof T]?: {
      value: string;
      matchLevel: "none" | "partial" | "full";
      matchedWords: string[];
    };
  };
  _snippetResult?: {
    [K in keyof T]?: {
      value: string;
      matchLevel: "none" | "partial" | "full";
    };
  };
};

/**
 * Search parameters for Algolia
 */
export type AlgoliaSearchParams = {
  query: string;
  filters?: string;
  facetFilters?: string | string[];
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
  attributesToSnippet?: string[];
  hitsPerPage?: number;
  page?: number;
};

/**
 * Search response from Algolia
 */
export type AlgoliaSearchResponse<T extends AlgoliaRecord> = {
  hits: AlgoliaSearchHit<T>[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
  params: string;
};
