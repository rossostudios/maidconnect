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
import { geistSans } from "@/app/fonts";
import { requireUser } from "@/lib/auth";
import { sanityFetch } from "@/lib/sanity/live";
import { cn } from "@/lib/utils";

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

const compactDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

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

  const totalContent =
    stats.helpArticles + stats.changelogs + stats.roadmapItems + stats.pages + stats.cityPages;
  const publishRate = stats.helpArticles
    ? Math.round((stats.publishedArticles / stats.helpArticles) * 100)
    : 0;

  const metricCards = [
    {
      label: "Total Content",
      value: totalContent,
      description: "All content types",
    },
    {
      label: "Help Articles",
      value: stats.helpArticles,
      description: "Knowledge base",
    },
    {
      label: "Published",
      value: stats.publishedArticles,
      description: "Live on website",
    },
    {
      label: "Drafts",
      value: stats.draftArticles,
      description: "Pending review",
    },
    {
      label: "Roadmap Items",
      value: stats.roadmapItems,
      description: "Upcoming features",
    },
    {
      label: "City Pages",
      value: stats.cityPages,
      description: "Location pages",
    },
  ];

  const surfaceBreakdown = [
    { label: "Help", value: stats.helpArticles },
    { label: "Marketing", value: stats.pages },
    { label: "Roadmap", value: stats.roadmapItems },
    { label: "Cities", value: stats.cityPages },
  ];

  const formatActivityDate = (iso: string) => compactDateFormatter.format(new Date(iso));

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <p
            className={cn(
              "font-semibold text-neutral-700 text-xs uppercase tracking-[0.35em]",
              geistSans.className
            )}
          >
            Content Dashboard
          </p>
          <div>
            <h1
              className={cn(
                "font-semibold text-3xl text-neutral-900 uppercase tracking-tight",
                geistSans.className
              )}
            >
              Content Management
            </h1>
            <p className={cn("mt-1.5 text-neutral-700 text-sm tracking-wide", geistSans.className)}>
              Manage all website content - blog posts, help articles, changelog, and more. Create,
              edit, and publish directly from this dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {surfaceBreakdown.map((surface) => (
              <div
                className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-1.5"
                key={surface.label}
              >
                <span
                  className={cn(
                    "font-semibold text-neutral-700 text-xs uppercase tracking-[0.3em]",
                    geistSans.className
                  )}
                >
                  {surface.label}
                </span>
                <span
                  className={cn("text-base text-neutral-900 tracking-tight", geistSans.className)}
                >
                  {surface.value}
                </span>
              </div>
            ))}
            <div className="border border-neutral-900 bg-neutral-900 px-3 py-1.5">
              <span
                className={cn(
                  "font-semibold text-white text-xs uppercase tracking-[0.3em]",
                  geistSans.className
                )}
              >
                Publish Rate {publishRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "font-semibold text-neutral-700 text-xs uppercase tracking-[0.3em]",
                    geistSans.className
                  )}
                >
                  CMS Editor
                </p>
                <p className={cn("mt-1 font-medium text-neutral-900", geistSans.className)}>
                  Content editor ready
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-neutral-900">
                <HugeiconsIcon className="h-6 w-6 text-white" icon={FileEditIcon} />
              </div>
            </div>
            <p className={cn("mt-3 text-neutral-700 text-sm", geistSans.className)}>
              Edit content directly in the CMS editor, review drafts, and publish updates to your
              live website.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                className={cn(
                  "inline-flex items-center justify-center gap-2 border border-neutral-900 bg-neutral-900 px-4 py-2 font-semibold text-white text-xs uppercase tracking-[0.3em] transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2",
                  geistSans.className
                )}
                href="/studio"
                target="_blank"
              >
                <HugeiconsIcon className="h-4 w-4" icon={ArrowUpRight01Icon} />
                Open Studio
              </Link>
              <Link
                className={cn(
                  "inline-flex items-center justify-center gap-2 border border-neutral-200 bg-neutral-50 px-4 py-2 font-semibold text-neutral-900 text-xs uppercase tracking-[0.3em] transition hover:border-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                  geistSans.className
                )}
                href="/admin/content/roadmap"
              >
                <HugeiconsIcon className="h-4 w-4" icon={MapsLocation01Icon} />
                Release Roadmap
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div>
          <h2
            className={cn(
              "font-semibold text-neutral-700 text-xs uppercase tracking-[0.35em]",
              geistSans.className
            )}
          >
            Content Overview
          </h2>
          <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
            See content counts across all sections at a glance.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metricCards.map((metric) => (
            <div
              className="border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-[#FF5200]"
              key={metric.label}
            >
              <p
                className={cn(
                  "font-semibold text-neutral-700 text-xs uppercase tracking-[0.25em]",
                  geistSans.className
                )}
              >
                {metric.label}
              </p>
              <p
                className={cn("mt-2 text-3xl text-neutral-900 tracking-tight", geistSans.className)}
              >
                {metric.value}
              </p>
              <p
                className={cn(
                  "mt-2 text-neutral-600 text-xs uppercase tracking-[0.25em]",
                  geistSans.className
                )}
              >
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-1">
          <h2
            className={cn(
              "font-semibold text-neutral-700 text-xs uppercase tracking-[0.35em]",
              geistSans.className
            )}
          >
            Content Types
          </h2>
          <p className={cn("text-neutral-700 text-sm", geistSans.className)}>
            View content counts and create new content for each section.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contentTypes.map((contentType) => (
            <div
              className="group flex flex-col border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-[#FF5200] hover:shadow-md"
              key={contentType.title}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={cn(
                      "font-semibold text-neutral-700 text-xs uppercase tracking-[0.3em]",
                      geistSans.className
                    )}
                  >
                    {contentType.title}
                  </p>
                  <p className={cn("mt-1 text-neutral-700 text-sm", geistSans.className)}>
                    {contentType.description}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 bg-neutral-900">
                  <HugeiconsIcon className="h-6 w-6 text-white" icon={contentType.icon} />
                </div>
              </div>
              <div className="mt-4 space-y-2 border-neutral-100 border-t pt-4">
                {contentType.stats.map((stat) => (
                  <div className="flex items-center justify-between" key={stat.label}>
                    <span
                      className={cn(
                        "text-neutral-600 text-xs uppercase tracking-[0.25em]",
                        geistSans.className
                      )}
                    >
                      {stat.label}
                    </span>
                    <span className={cn("text-lg text-neutral-900", geistSans.className)}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 border border-neutral-900 bg-neutral-900 px-4 py-2 font-semibold text-white text-xs uppercase tracking-[0.25em] transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200] focus-visible:ring-offset-2",
                    geistSans.className
                  )}
                  href={contentType.studioPath}
                  target="_blank"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Edit01Icon} />
                  Manage
                </Link>
                <Link
                  aria-label={`Create new ${contentType.title}`}
                  className={cn(
                    "inline-flex items-center justify-center border border-neutral-200 bg-neutral-50 px-3 py-2 font-semibold text-neutral-900 text-xs uppercase tracking-[0.25em] transition hover:border-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                    geistSans.className
                  )}
                  href={`${contentType.studioPath};action=create`}
                  target="_blank"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-1">
          <h2
            className={cn(
              "font-semibold text-neutral-700 text-xs uppercase tracking-[0.35em]",
              geistSans.className
            )}
          >
            Editorial Activity
          </h2>
          <p className={cn("text-neutral-700 text-sm", geistSans.className)}>
            Latest edits across knowledge base and changelog so you always know what shipped.
          </p>
        </div>
        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="border border-neutral-200 bg-white">
              <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
                <p
                  className={cn(
                    "font-semibold text-neutral-600 text-xs uppercase tracking-[0.3em]",
                    geistSans.className
                  )}
                >
                  Help Articles
                </p>
                <p className={cn("mt-1 text-neutral-600 text-xs", geistSans.className)}>
                  Last 5 updates to help articles
                </p>
              </div>
              <div className="divide-y divide-neutral-100">
                {recent.recentArticles.length > 0 ? (
                  recent.recentArticles.map((article) => (
                    <Link
                      className={cn(
                        "group flex items-center gap-4 px-6 py-4 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200]",
                        geistSans.className
                      )}
                      href={`/studio/structure/helpArticle;${article._id}`}
                      key={article._id}
                      target="_blank"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-neutral-200 bg-neutral-900">
                        <HugeiconsIcon className="h-5 w-5 text-white" icon={Book01Icon} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-900 text-sm">
                          {article.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-neutral-600 text-xs uppercase tracking-[0.25em]">
                          <span>{article.category || "Uncategorized"}</span>
                          <span>•</span>
                          <span>{article.language.toUpperCase()}</span>
                          <span>•</span>
                          <span>{formatActivityDate(article._updatedAt)}</span>
                        </div>
                        <div className="mt-2">
                          {article.isPublished ? (
                            <span className="bg-emerald-600 px-2 py-0.5 font-semibold text-white text-xs uppercase tracking-[0.3em]">
                              Published
                            </span>
                          ) : (
                            <span className="bg-neutral-900 px-2 py-0.5 font-semibold text-white text-xs uppercase tracking-[0.3em]">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                      <HugeiconsIcon
                        className="h-4 w-4 flex-shrink-0 text-neutral-500 transition group-hover:text-neutral-900"
                        icon={ArrowUpRight01Icon}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
                      No article updates yet. Ship a draft to populate this feed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-neutral-200 bg-white">
              <div className="border-neutral-200 border-b bg-neutral-50 px-6 py-4">
                <p
                  className={cn(
                    "font-semibold text-neutral-600 text-xs uppercase tracking-[0.3em]",
                    geistSans.className
                  )}
                >
                  Changelog Updates
                </p>
                <p className={cn("mt-1 text-neutral-600 text-xs", geistSans.className)}>
                  Latest product release notes
                </p>
              </div>
              <div className="divide-y divide-neutral-100">
                {recent.recentChangelogs.length > 0 ? (
                  recent.recentChangelogs.map((changelog) => (
                    <Link
                      className={cn(
                        "group flex items-center gap-4 px-6 py-4 transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5200]",
                        geistSans.className
                      )}
                      href={`/studio/structure/changelog;${changelog._id}`}
                      key={changelog._id}
                      target="_blank"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-neutral-200 bg-neutral-900">
                        <HugeiconsIcon className="h-5 w-5 text-white" icon={ClipboardIcon} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-900 text-sm">
                          {changelog.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-neutral-600 text-xs uppercase tracking-[0.25em]">
                          <span>Sprint {changelog.sprintNumber}</span>
                          <span>•</span>
                          <span>{changelog.language.toUpperCase()}</span>
                          <span>•</span>
                          <span>{formatActivityDate(changelog._updatedAt)}</span>
                        </div>
                      </div>
                      <HugeiconsIcon
                        className="h-4 w-4 flex-shrink-0 text-neutral-500 transition group-hover:text-neutral-900"
                        icon={ArrowUpRight01Icon}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
                      No changelog entries yet. Capture the next release to fill this list.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
