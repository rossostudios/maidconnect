/**
 * Sanity Live Content API (Modern Approach)
 *
 * Provides optimized fetching with draft mode support and ISR caching
 * Compatible with next-sanity 11.6.5
 */

import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";
import { serverClient } from "./client";

// Validate environment variables
const token = process.env.SANITY_API_READ_TOKEN;

if (!token && process.env.NODE_ENV !== "production") {
  console.warn(
    "⚠️  SANITY_API_READ_TOKEN is not set. Draft mode and Visual Editing will not work.\n" +
      "   Get it from: https://sanity.io/manage > API > Tokens > Add API token\n" +
      "   Add to .env.local: SANITY_API_READ_TOKEN=your-token-here"
  );
}

/**
 * Fetch content from Sanity with draft mode support and ISR caching
 * - Automatic draft/published perspective switching
 * - Tag-based ISR revalidation
 * - Type-safe queries with defineQuery
 */
export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  tags = [],
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
}): Promise<{ data: QueryResponse }> {
  const isDraftMode = (await draftMode()).isEnabled;

  // Use draft client with token for draft mode, otherwise use public client
  const client = isDraftMode
    ? serverClient.withConfig({
        token,
        perspective: "previewDrafts",
        useCdn: false,
      })
    : serverClient;

  const data = await client.fetch<QueryResponse>(query, params, {
    cache: isDraftMode ? "no-store" : "force-cache",
    next: {
      tags,
      revalidate: isDraftMode ? 0 : 3600, // 1 hour for published content
    },
  });

  return { data };
}
