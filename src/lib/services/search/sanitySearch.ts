/**
 * Sanity Search Service
 * Handles unified search across all Sanity content types
 */

import { serverClient } from "@/lib/integrations/sanity/client";

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
 * Search help articles in Sanity
 */
async function searchHelpArticles(query: string, locale: string): Promise<SearchResult[]> {
  const helpArticles = await serverClient.fetch<
    Array<{
      _id: string;
      title: string;
      excerpt: string;
      slug: { current: string };
      category: {
        title: string;
        slug: { current: string };
      };
      views?: number;
    }>
  >(
    `*[
      _type == "helpArticle" &&
      language == $language &&
      isPublished == true &&
      (
        title match $searchPattern ||
        excerpt match $searchPattern ||
        pt::text(content) match $searchPattern
      )
    ] | order(_score desc) [0...10] {
      _id,
      title,
      excerpt,
      slug,
      category->{ title, slug },
      views
    }`,
    {
      language: locale,
      searchPattern: `*${query}*`,
    }
  );

  return (helpArticles || []).map((article) => {
    const categorySlug = article.category?.slug?.current || "uncategorized";
    return {
      id: article._id,
      type: "help_article" as const,
      title: article.title,
      description: article.excerpt,
      url: `/${locale}/help/${categorySlug}/${article.slug.current}`,
      metadata: {
        category: article.category?.title,
        categorySlug,
        views: article.views || 0,
      },
    };
  });
}

/**
 * Search changelog entries in Sanity
 */
async function searchChangelogs(query: string, locale: string): Promise<SearchResult[]> {
  const changelogs = await serverClient.fetch<
    Array<{
      _id: string;
      title: string;
      summary: string;
      slug: { current: string };
      sprintNumber: number;
      categories: string[];
      publishedAt: string;
    }>
  >(
    `*[
      _type == "changelog" &&
      language == $language &&
      publishedAt <= now() &&
      (
        title match $searchPattern ||
        summary match $searchPattern ||
        pt::text(content) match $searchPattern
      )
    ] | order(_score desc, publishedAt desc) [0...10] {
      _id,
      title,
      summary,
      slug,
      sprintNumber,
      categories,
      publishedAt
    }`,
    {
      language: locale,
      searchPattern: `*${query}*`,
    }
  );

  return (changelogs || []).map((changelog) => ({
    id: changelog._id,
    type: "changelog" as const,
    title: changelog.title,
    description: changelog.summary,
    url: `/${locale}/changelog/${changelog.slug.current}`,
    metadata: {
      sprintNumber: changelog.sprintNumber,
      categories: changelog.categories,
      publishedAt: changelog.publishedAt,
    },
  }));
}

/**
 * Search roadmap items in Sanity
 */
async function searchRoadmapItems(query: string, locale: string): Promise<SearchResult[]> {
  const roadmapItems = await serverClient.fetch<
    Array<{
      _id: string;
      title: string;
      description: string;
      slug: { current: string };
      status: string;
      category: string;
    }>
  >(
    `*[
      _type == "roadmapItem" &&
      language == $language &&
      isPublished == true &&
      (
        title match $searchPattern ||
        description match $searchPattern
      )
    ] | order(_score desc) [0...10] {
      _id,
      title,
      description,
      slug,
      status,
      category
    }`,
    {
      language: locale,
      searchPattern: `*${query}*`,
    }
  );

  return (roadmapItems || []).map((item) => ({
    id: item._id,
    type: "roadmap" as const,
    title: item.title,
    description: item.description,
    url: `/${locale}/roadmap#${item.slug.current}`,
    metadata: {
      status: item.status,
      category: item.category,
    },
  }));
}

/**
 * Search city pages in Sanity
 */
async function searchCityPages(query: string, locale: string): Promise<SearchResult[]> {
  const cityPages = await serverClient.fetch<
    Array<{
      _id: string;
      name: string;
      heroSubtitle: string;
      slug: { current: string };
      services?: string[];
    }>
  >(
    `*[
      _type == "cityPage" &&
      language == $language &&
      isPublished == true &&
      (
        name match $searchPattern ||
        heroTitle match $searchPattern ||
        heroSubtitle match $searchPattern ||
        pt::text(seoContent) match $searchPattern
      )
    ] | order(_score desc) [0...5] {
      _id,
      name,
      heroSubtitle,
      slug,
      services
    }`,
    {
      language: locale,
      searchPattern: `*${query}*`,
    }
  );

  return (cityPages || []).map((city) => ({
    id: city._id,
    type: "city_page" as const,
    title: city.name,
    description: city.heroSubtitle,
    url: `/${locale}/${city.slug.current}`,
    metadata: {
      services: city.services || [],
    },
  }));
}

/**
 * Unified search orchestrator
 * Searches across selected content types based on filter
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
