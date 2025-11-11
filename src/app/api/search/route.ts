/**
 * Unified Search API
 *
 * GET /api/search?q=query&locale=en&type=all
 * Searches across all Sanity content types
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import { serverClient } from "@/lib/sanity/client";

type SearchResultType = "help_article" | "changelog" | "roadmap" | "city_page";

type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, unknown>;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const locale = searchParams.get("locale") || "en";
    const typeFilter = searchParams.get("type") || "all"; // all, help, changelog, roadmap, city
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const searchQuery = query.trim();
    const results: SearchResult[] = [];

    // Search Help Articles
    if (typeFilter === "all" || typeFilter === "help") {
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
          searchPattern: `*${searchQuery}*`,
        }
      );

      for (const article of helpArticles || []) {
        const categorySlug = article.category?.slug?.current || "uncategorized";
        results.push({
          id: article._id,
          type: "help_article",
          title: article.title,
          description: article.excerpt,
          url: `/${locale}/help/${categorySlug}/${article.slug.current}`,
          metadata: {
            category: article.category?.title,
            categorySlug,
            views: article.views || 0,
          },
        });
      }
    }

    // Search Changelogs
    if (typeFilter === "all" || typeFilter === "changelog") {
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
          searchPattern: `*${searchQuery}*`,
        }
      );

      for (const changelog of changelogs || []) {
        results.push({
          id: changelog._id,
          type: "changelog",
          title: changelog.title,
          description: changelog.summary,
          url: `/${locale}/changelog/${changelog.slug.current}`,
          metadata: {
            sprintNumber: changelog.sprintNumber,
            categories: changelog.categories,
            publishedAt: changelog.publishedAt,
          },
        });
      }
    }

    // Search Roadmap Items
    if (typeFilter === "all" || typeFilter === "roadmap") {
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
          searchPattern: `*${searchQuery}*`,
        }
      );

      for (const item of roadmapItems || []) {
        results.push({
          id: item._id,
          type: "roadmap",
          title: item.title,
          description: item.description,
          url: `/${locale}/roadmap#${item.slug.current}`,
          metadata: {
            status: item.status,
            category: item.category,
          },
        });
      }
    }

    // Search City Pages
    if (typeFilter === "all" || typeFilter === "city") {
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
          searchPattern: `*${searchQuery}*`,
        }
      );

      for (const city of cityPages || []) {
        results.push({
          id: city._id,
          type: "city_page",
          title: city.name,
          description: city.heroSubtitle,
          url: `/${locale}/${city.slug.current}`,
          metadata: {
            services: city.services || [],
          },
        });
      }
    }

    // Limit total results
    const limitedResults = results.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: limitedResults,
      total: results.length,
      query: searchQuery,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
