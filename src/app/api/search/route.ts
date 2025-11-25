/**
 * Unified Search API
 *
 * GET /api/search?q=query&locale=en&type=all
 * Searches across all Sanity content types
 * Cached for 10 minutes (STANDARD duration) to reduce Sanity API load
 */

import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_DURATIONS, CACHE_HEADERS, CACHE_TAGS } from "@/lib/cache";
import { handleApiError } from "@/lib/error-handler";
import { serverClient } from "@/lib/integrations/sanity/client";

type SearchResultType = "help_article" | "changelog" | "roadmap" | "city_page";

type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
};

type SearchFilter = "all" | "help" | "changelog" | "roadmap" | "city";

type SearchContext = {
  locale: string;
  searchPattern: string;
};

type SearchHandler = (context: SearchContext) => Promise<SearchResult[]>;

const SEARCH_HANDLERS: Record<Exclude<SearchFilter, "all">, SearchHandler> = {
  help: searchHelpArticles,
  changelog: searchChangelogs,
  roadmap: searchRoadmapItems,
  city: searchCityPages,
};

type CachedSearchResult = {
  data: SearchResult[];
  total: number;
};

/**
 * Cached search function to reduce Sanity API load
 * Revalidates every 10 minutes (STANDARD duration)
 */
const getCachedSearchResults = unstable_cache(
  async (
    query: string,
    locale: string,
    typeFilter: SearchFilter,
    limit: number
  ): Promise<CachedSearchResult> => {
    const searchContext = {
      locale,
      searchPattern: `*${query}*`,
    };

    const handlers = selectHandlers(typeFilter);
    const results = (await Promise.all(handlers.map((handler) => handler(searchContext)))).flat();

    const limitedResults = results.slice(0, limit);

    return {
      data: limitedResults,
      total: results.length,
    };
  },
  ["unified-search"],
  {
    revalidate: CACHE_DURATIONS.STANDARD,
    tags: [CACHE_TAGS.HELP, CACHE_TAGS.CHANGELOGS, CACHE_TAGS.ROADMAP, CACHE_TAGS.CITIES],
  }
);

export async function GET(request: NextRequest) {
  try {
    const params = parseSearchParams(request);

    if (!params.query) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const { data, total } = await getCachedSearchResults(
      params.query,
      params.locale,
      params.typeFilter,
      params.limit
    );

    return NextResponse.json(
      {
        success: true,
        data,
        total,
        query: params.query,
      },
      { headers: CACHE_HEADERS.STANDARD }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}

function parseSearchParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryValue = searchParams.get("q")?.trim() ?? "";
  const locale = searchParams.get("locale") || "en";
  const limit = Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1);
  const typeFilter = normalizeTypeFilter(searchParams.get("type"));

  return {
    query: queryValue.length ? queryValue : null,
    locale,
    limit,
    typeFilter,
  };
}

function normalizeTypeFilter(value: string | null): SearchFilter {
  if (value === "help" || value === "changelog" || value === "roadmap" || value === "city") {
    return value;
  }
  return "all";
}

function selectHandlers(filter: SearchFilter): SearchHandler[] {
  if (filter === "all") {
    return Object.values(SEARCH_HANDLERS);
  }

  const handler = SEARCH_HANDLERS[filter as Exclude<SearchFilter, "all">];
  return handler ? [handler] : [];
}

async function searchHelpArticles(context: SearchContext): Promise<SearchResult[]> {
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
      language: context.locale,
      searchPattern: context.searchPattern,
    }
  );

  return (helpArticles ?? []).map((article) => {
    const categorySlug = article.category?.slug?.current || "uncategorized";
    return {
      id: article._id,
      type: "help_article",
      title: article.title,
      description: article.excerpt,
      url: `/${context.locale}/help/${categorySlug}/${article.slug.current}`,
      metadata: {
        category: article.category?.title,
        categorySlug,
        views: article.views || 0,
      },
    };
  });
}

async function searchChangelogs(context: SearchContext): Promise<SearchResult[]> {
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
      language: context.locale,
      searchPattern: context.searchPattern,
    }
  );

  return (changelogs ?? []).map((changelog) => ({
    id: changelog._id,
    type: "changelog",
    title: changelog.title,
    description: changelog.summary,
    url: `/${context.locale}/changelog/${changelog.slug.current}`,
    metadata: {
      sprintNumber: changelog.sprintNumber,
      categories: changelog.categories,
      publishedAt: changelog.publishedAt,
    },
  }));
}

async function searchRoadmapItems(context: SearchContext): Promise<SearchResult[]> {
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
      language: context.locale,
      searchPattern: context.searchPattern,
    }
  );

  return (roadmapItems ?? []).map((item) => ({
    id: item._id,
    type: "roadmap",
    title: item.title,
    description: item.description,
    url: `/${context.locale}/roadmap#${item.slug.current}`,
    metadata: {
      status: item.status,
      category: item.category,
    },
  }));
}

async function searchCityPages(context: SearchContext): Promise<SearchResult[]> {
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
      language: context.locale,
      searchPattern: context.searchPattern,
    }
  );

  return (cityPages ?? []).map((city) => ({
    id: city._id,
    type: "city_page",
    title: city.name,
    description: city.heroSubtitle,
    url: `/${context.locale}/${city.slug.current}`,
    metadata: {
      services: city.services || [],
    },
  }));
}
