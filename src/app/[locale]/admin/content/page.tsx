/**
 * Content Management Dashboard
 *
 * Provides a unified interface for managing Sanity CMS content
 * Shows content previews with direct links to edit in Sanity Studio
 */

import {
  Add01Icon,
  ArrowUpRight01Icon,
  Book01Icon,
  ClipboardIcon,
  Edit01Icon,
  FileEditIcon,
  Location01Icon,
  MapsLocation01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { defineQuery } from "next-sanity";
import { requireUser } from "@/lib/auth";
import { sanityFetch } from "@/lib/sanity/live";

export const metadata = {
  title: "Content Management | Admin",
  description: "Manage all website content from one central dashboard",
};

// Type definitions for query responses
type ContentStats = {
  helpArticles: number;
  helpCategories: number;
  changelogs: number;
  roadmapItems: number;
  pages: number;
  cityPages: number;
  publishedArticles: number;
  draftArticles: number;
};

type RecentArticle = {
  _id: string;
  title: string;
  language: string;
  isPublished: boolean;
  _updatedAt: string;
  category: string;
};

type RecentChangelog = {
  _id: string;
  title: string;
  sprintNumber: number;
  language: string;
  _updatedAt: string;
};

type RecentContent = {
  recentArticles: RecentArticle[];
  recentChangelogs: RecentChangelog[];
};

// Content stats query
const CONTENT_STATS_QUERY = defineQuery(`{
  "helpArticles": count(*[_type == "helpArticle"]),
  "helpCategories": count(*[_type == "helpCategory"]),
  "changelogs": count(*[_type == "changelog"]),
  "roadmapItems": count(*[_type == "roadmapItem"]),
  "pages": count(*[_type == "page"]),
  "cityPages": count(*[_type == "cityPage"]),
  "publishedArticles": count(*[_type == "helpArticle" && isPublished == true]),
  "draftArticles": count(*[_type == "helpArticle" && isPublished == false]),
}`);

// Recent content activity query
const RECENT_CONTENT_QUERY = defineQuery(`{
  "recentArticles": *[_type == "helpArticle"] | order(_updatedAt desc) [0...5] {
    _id,
    title,
    language,
    isPublished,
    _updatedAt,
    "category": category->name
  },
  "recentChangelogs": *[_type == "changelog"] | order(_updatedAt desc) [0...3] {
    _id,
    title,
    sprintNumber,
    language,
    _updatedAt
  }
}`);

// Fetch content stats from Sanity
async function getContentStats(): Promise<ContentStats> {
  const { data } = await sanityFetch<ContentStats>({
    query: CONTENT_STATS_QUERY,
    tags: ["helpArticle", "helpCategory", "changelog", "roadmapItem", "page", "cityPage"],
  });

  return data;
}

// Recent content activity
async function getRecentContent(): Promise<RecentContent> {
  const { data } = await sanityFetch<RecentContent>({
    query: RECENT_CONTENT_QUERY,
    tags: ["helpArticle", "changelog"],
  });

  return data;
}

export default async function AdminContentPage() {
  await requireUser({ allowedRoles: ["admin"] });

  const stats = await getContentStats();
  const recent = await getRecentContent();

  const contentTypes = [
    {
      title: "Help Center",
      description: "Manage help articles, categories, and tags",
      icon: Book01Icon,
      studioPath: "/studio/structure/helpArticle",
      stats: [
        { label: "Total Articles", value: stats.helpArticles },
        { label: "Published", value: stats.publishedArticles },
        { label: "Drafts", value: stats.draftArticles },
      ],
    },
    {
      title: "Changelog",
      description: "Product updates and release notes",
      icon: ClipboardIcon,
      studioPath: "/studio/structure/changelog",
      stats: [{ label: "Total Entries", value: stats.changelogs }],
    },
    {
      title: "Roadmap",
      description: "Upcoming features and improvements",
      icon: MapsLocation01Icon,
      studioPath: "/studio/structure/roadmapItem",
      stats: [{ label: "Total Items", value: stats.roadmapItems }],
    },
    {
      title: "Marketing Pages",
      description: "Landing pages and custom content",
      icon: FileEditIcon,
      studioPath: "/studio/structure/page",
      stats: [{ label: "Total Pages", value: stats.pages }],
    },
    {
      title: "City Pages",
      description: "Location-specific content",
      icon: Location01Icon,
      studioPath: "/studio/structure/cityPage",
      stats: [{ label: "Total Cities", value: stats.cityPages }],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 font-bold text-3xl text-stone-900">Content Management</h1>
        <div className="flex items-center justify-between">
          <p className="text-stone-600 text-sm">Manage all website content powered by Sanity CMS</p>
          <Link
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 font-medium text-stone-900 text-sm transition hover:border-stone-300 hover:shadow-sm"
            href="/studio"
            target="_blank"
          >
            <HugeiconsIcon className="h-4 w-4" icon={ArrowUpRight01Icon} />
            Open Studio
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-1 font-medium text-stone-600 text-sm">Total Content</div>
          <div className="font-bold text-3xl text-stone-900">
            {stats.helpArticles +
              stats.changelogs +
              stats.roadmapItems +
              stats.pages +
              stats.cityPages}
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-1 font-medium text-stone-600 text-sm">Help Articles</div>
          <div className="font-bold text-3xl text-stone-900">{stats.helpArticles}</div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-1 font-medium text-stone-600 text-sm">Published</div>
          <div className="font-bold text-3xl text-stone-900">{stats.publishedArticles}</div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-1 font-medium text-stone-600 text-sm">Drafts</div>
          <div className="font-bold text-3xl text-stone-900">{stats.draftArticles}</div>
        </div>
      </div>

      {/* Content Types Grid */}
      <div>
        <h2 className="mb-4 font-bold text-2xl text-stone-900">Content Types</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contentTypes.map((contentType) => (
            <div
              className="group rounded-lg border border-stone-200 bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:border-stone-300 hover:shadow-md"
              key={contentType.title}
            >
              {/* Header */}
              <div className="mb-4 flex items-center gap-3">
                <HugeiconsIcon className="h-5 w-5 text-stone-600" icon={contentType.icon} />
                <h3 className="font-semibold text-base text-stone-900">{contentType.title}</h3>
              </div>
              <p className="mb-4 text-stone-600 text-sm">{contentType.description}</p>

              {/* Stats */}
              <div className="mb-4 space-y-2 border-stone-200 border-t pt-4">
                {contentType.stats.map((stat) => (
                  <div className="flex items-center justify-between" key={stat.label}>
                    <span className="text-stone-600 text-sm">{stat.label}</span>
                    <span className="font-semibold text-stone-900">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 font-medium text-stone-900 text-sm transition hover:border-stone-300 hover:bg-stone-50"
                  href={contentType.studioPath}
                  target="_blank"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Edit01Icon} />
                  Edit
                </Link>
                <Link
                  aria-label={`Create new ${contentType.title}`}
                  className="rounded-lg border border-stone-200 bg-white px-4 py-2 font-medium text-stone-900 text-sm transition hover:border-stone-300 hover:bg-stone-50"
                  href={`${contentType.studioPath};action=create`}
                  target="_blank"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 font-bold text-2xl text-stone-900">Recent Activity</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Recent Articles */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-4 font-semibold text-base text-stone-900">Recent Help Articles</h3>
            <div className="space-y-3">
              {recent.recentArticles.map((article: any) => (
                <Link
                  className="group flex items-start justify-between rounded-lg p-3 transition-colors hover:bg-stone-50"
                  href={`/studio/structure/helpArticle;${article._id}`}
                  key={article._id}
                  target="_blank"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-stone-900">{article.title}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-stone-600 text-xs">{article.category}</span>
                      <span className="text-stone-600 text-xs">•</span>
                      <span className="text-stone-600 text-xs">
                        {article.language.toUpperCase()}
                      </span>
                      {article.isPublished ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-green-700 text-xs">
                          Published
                        </span>
                      ) : (
                        <span className="rounded bg-stone-100 px-2 py-0.5 text-stone-700 text-xs">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <HugeiconsIcon
                    className="ml-2 h-4 w-4 flex-shrink-0 text-stone-600 opacity-0 transition-opacity group-hover:opacity-100"
                    icon={ArrowUpRight01Icon}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Changelogs */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-4 font-semibold text-base text-stone-900">
              Recent Changelog Entries
            </h3>
            <div className="space-y-3">
              {recent.recentChangelogs.map((changelog: any) => (
                <Link
                  className="group flex items-start justify-between rounded-lg p-3 transition-colors hover:bg-stone-50"
                  href={`/studio/structure/changelog;${changelog._id}`}
                  key={changelog._id}
                  target="_blank"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-stone-900">{changelog.title}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-stone-600 text-xs">
                        Sprint {changelog.sprintNumber}
                      </span>
                      <span className="text-stone-600 text-xs">•</span>
                      <span className="text-stone-600 text-xs">
                        {changelog.language.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <HugeiconsIcon
                    className="ml-2 h-4 w-4 flex-shrink-0 text-stone-600 opacity-0 transition-opacity group-hover:opacity-100"
                    icon={ArrowUpRight01Icon}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
