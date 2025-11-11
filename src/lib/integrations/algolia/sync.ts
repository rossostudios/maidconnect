/**
 * Algolia Integration - Sync Utilities
 *
 * Utilities for syncing Sanity content to Algolia indices.
 * Used by webhook handlers and batch sync scripts.
 */

import type { PortableTextBlock } from "sanity";
import { getWriteIndex } from "./client";
import {
  ALGOLIA_INDICES,
  type ChangelogRecord,
  type CityPageRecord,
  type HelpArticleRecord,
  type RoadmapItemRecord,
} from "./types";

/**
 * Convert Portable Text to plain text for indexing
 */
export function portableTextToPlainText(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks) {
    return "";
  }

  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }
      return block.children.map((child) => child.text).join("");
    })
    .join("\n")
    .trim();
}

/**
 * Transform Sanity helpArticle to Algolia record
 */
export function transformHelpArticle(doc: any): HelpArticleRecord {
  return {
    objectID: doc._id,
    _type: "helpArticle",
    title: doc.title || "",
    slug: doc.slug?.current || "",
    excerpt: doc.excerpt || "",
    content: portableTextToPlainText(doc.content),
    category: doc.category
      ? {
          _id: doc.category._id,
          title: doc.category.title,
          slug: doc.category.slug?.current || "",
        }
      : null,
    tags:
      doc.tags?.map((tag: any) => ({
        _id: tag._id,
        title: tag.title,
        slug: tag.slug?.current || "",
      })) || [],
    language: doc.language || "en",
    isPublished: doc.isPublished ?? true,
    publishedAt: doc.publishedAt || doc._createdAt,
    _updatedAt: doc._updatedAt,
  };
}

/**
 * Transform Sanity changelog to Algolia record
 */
export function transformChangelog(doc: any): ChangelogRecord {
  return {
    objectID: doc._id,
    _type: "changelog",
    sprintNumber: doc.sprintNumber || 0,
    title: doc.title || "",
    slug: doc.slug?.current || "",
    summary: doc.summary || "",
    content: portableTextToPlainText(doc.content),
    categories: doc.categories || [],
    tags: doc.tags || [],
    targetAudience: doc.targetAudience || [],
    language: doc.language || "en",
    publishedAt: doc.publishedAt || doc._createdAt,
    _updatedAt: doc._updatedAt,
  };
}

/**
 * Transform Sanity roadmapItem to Algolia record
 */
export function transformRoadmapItem(doc: any): RoadmapItemRecord {
  return {
    objectID: doc._id,
    _type: "roadmapItem",
    title: doc.title || "",
    slug: doc.slug?.current || "",
    description: doc.description || "",
    status: doc.status || "planned",
    category: doc.category || "platform",
    upvotes: doc.upvotes || 0,
    language: doc.language || "en",
    isPublished: doc.isPublished ?? true,
    publishedAt: doc.publishedAt || doc._createdAt,
    estimatedDate: doc.estimatedDate || null,
    _updatedAt: doc._updatedAt,
  };
}

/**
 * Transform Sanity cityPage to Algolia record
 */
export function transformCityPage(doc: any): CityPageRecord {
  return {
    objectID: doc._id,
    _type: "cityPage",
    name: doc.name || "",
    slug: doc.slug?.current || "",
    heroTitle: doc.heroTitle || "",
    heroSubtitle: doc.heroSubtitle || "",
    services: doc.services || [],
    seoContent: doc.seoContent || "",
    language: doc.language || "en",
    isPublished: doc.isPublished ?? true,
    _updatedAt: doc._updatedAt,
  };
}

/**
 * Index a help article in Algolia
 */
export async function indexHelpArticle(doc: any) {
  const index = getWriteIndex(ALGOLIA_INDICES.HELP_ARTICLES);
  const record = transformHelpArticle(doc);
  await index.saveObject(record);
  return record;
}

/**
 * Index a changelog entry in Algolia
 */
export async function indexChangelog(doc: any) {
  const index = getWriteIndex(ALGOLIA_INDICES.CHANGELOG);
  const record = transformChangelog(doc);
  await index.saveObject(record);
  return record;
}

/**
 * Index a roadmap item in Algolia
 */
export async function indexRoadmapItem(doc: any) {
  const index = getWriteIndex(ALGOLIA_INDICES.ROADMAP);
  const record = transformRoadmapItem(doc);
  await index.saveObject(record);
  return record;
}

/**
 * Index a city page in Algolia
 */
export async function indexCityPage(doc: any) {
  const index = getWriteIndex(ALGOLIA_INDICES.CITY_PAGES);
  const record = transformCityPage(doc);
  await index.saveObject(record);
  return record;
}

/**
 * Delete a record from Algolia by document type and ID
 */
export async function deleteRecord(documentType: string, documentId: string) {
  let indexName: string;

  switch (documentType) {
    case "helpArticle":
      indexName = ALGOLIA_INDICES.HELP_ARTICLES;
      break;
    case "changelog":
      indexName = ALGOLIA_INDICES.CHANGELOG;
      break;
    case "roadmapItem":
      indexName = ALGOLIA_INDICES.ROADMAP;
      break;
    case "cityPage":
      indexName = ALGOLIA_INDICES.CITY_PAGES;
      break;
    default:
      throw new Error(`Unsupported document type: ${documentType}`);
  }

  const index = getWriteIndex(indexName);
  await index.deleteObject(documentId);
}

/**
 * Batch index multiple documents
 * Useful for initial sync or bulk updates
 */
export async function batchIndexDocuments(documents: any[], documentType: string) {
  const transformers: Record<string, (doc: any) => any> = {
    helpArticle: transformHelpArticle,
    changelog: transformChangelog,
    roadmapItem: transformRoadmapItem,
    cityPage: transformCityPage,
  };

  const transformer = transformers[documentType];
  if (!transformer) {
    throw new Error(`Unsupported document type: ${documentType}`);
  }

  const records = documents.map(transformer);

  let indexName: string;
  switch (documentType) {
    case "helpArticle":
      indexName = ALGOLIA_INDICES.HELP_ARTICLES;
      break;
    case "changelog":
      indexName = ALGOLIA_INDICES.CHANGELOG;
      break;
    case "roadmapItem":
      indexName = ALGOLIA_INDICES.ROADMAP;
      break;
    case "cityPage":
      indexName = ALGOLIA_INDICES.CITY_PAGES;
      break;
    default:
      throw new Error(`Unsupported document type: ${documentType}`);
  }

  const index = getWriteIndex(indexName);
  await index.saveObjects(records);

  return records;
}

/**
 * Clear an entire index
 * Use with caution - this deletes all records
 */
export async function clearIndex(indexName: string) {
  const index = getWriteIndex(indexName);
  await index.clearObjects();
}

/**
 * Sync a single Sanity document to Algolia
 * Auto-detects document type and routes to appropriate transformer
 */
export async function syncDocument(doc: any, action: "create" | "update" | "delete") {
  const documentType = doc._type;

  if (action === "delete") {
    await deleteRecord(documentType, doc._id);
    return { action: "deleted", documentId: doc._id, documentType };
  }

  // For create/update, use the appropriate indexing function
  switch (documentType) {
    case "helpArticle":
      await indexHelpArticle(doc);
      break;
    case "changelog":
      await indexChangelog(doc);
      break;
    case "roadmapItem":
      await indexRoadmapItem(doc);
      break;
    case "cityPage":
      await indexCityPage(doc);
      break;
    default:
      throw new Error(`Unsupported document type: ${documentType}`);
  }

  return { action, documentId: doc._id, documentType };
}
