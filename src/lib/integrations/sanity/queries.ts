import { defineQuery } from "next-sanity";

/**
 * GROQ queries for all content types (2025 Best Practices)
 * Using defineQuery for compile-time type safety and better IDE support
 * These queries are optimized for performance and include all necessary data
 */

// ============================================================================
// HELP CENTER QUERIES
// ============================================================================

export const HELP_CATEGORIES_QUERY =
  defineQuery(`*[_type == "helpCategory" && language == $language && isActive == true] | order(displayOrder asc) {
  _id,
  name,
  slug,
  description,
  icon,
  displayOrder,
  language,
  "articleCount": count(*[_type == "helpArticle" && references(^._id) && isPublished == true])
}`);

const HELP_CATEGORY_BY_SLUG_QUERY =
  defineQuery(`*[_type == "helpCategory" && slug.current == $slug && language == $language][0] {
  _id,
  name,
  slug,
  description,
  icon,
  language
}`);

export const HELP_ARTICLES_BY_CATEGORY_QUERY =
  defineQuery(`*[_type == "helpArticle" && category._ref == $categoryId && language == $language && isPublished == true] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  "category": category->{name, slug},
  "tags": tags[]->{name, slug, color},
  featuredImage,
  publishedAt,
  language
}`);

const HELP_ARTICLE_BY_SLUG_QUERY =
  defineQuery(`*[_type == "helpArticle" && slug.current == $slug && language == $language && isPublished == true][0] {
  _id,
  title,
  slug,
  excerpt,
  content,
  "category": category->{name, slug, icon},
  "tags": tags[]->{name, slug, color},
  "relatedArticles": relatedArticles[]->{
    _id,
    title,
    slug,
    excerpt,
    "category": category->{name, slug}
  },
  featuredImage,
  language,
  publishedAt,
  seoMetadata
}`);

const HELP_ARTICLES_SEARCH_QUERY =
  defineQuery(`*[_type == "helpArticle" && language == $language && isPublished == true && (
  title match $searchTerm + "*" ||
  excerpt match $searchTerm + "*" ||
  pt::text(content) match $searchTerm + "*"
)] | order(_score desc) [0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  "category": category->{name, slug},
  publishedAt,
  language
}`);

const POPULAR_HELP_ARTICLES_QUERY =
  defineQuery(`*[_type == "helpArticle" && language == $language && isPublished == true] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  "category": category->{name, slug},
  publishedAt
}`);

// ============================================================================
// CHANGELOG QUERIES
// ============================================================================

const CHANGELOGS_QUERY =
  defineQuery(`*[_type == "changelog" && language == $language] | order(publishedAt desc, sprintNumber desc) [0...$limit] {
  _id,
  sprintNumber,
  title,
  slug,
  summary,
  categories,
  tags,
  targetAudience,
  featuredImage,
  publishedAt,
  language
}`);

const CHANGELOG_BY_SLUG_QUERY =
  defineQuery(`*[_type == "changelog" && slug.current == $slug && language == $language][0] {
  _id,
  sprintNumber,
  title,
  slug,
  summary,
  content,
  categories,
  tags,
  targetAudience,
  featuredImage,
  publishedAt,
  language
}`);

const LATEST_CHANGELOG_QUERY =
  defineQuery(`*[_type == "changelog" && language == $language] | order(publishedAt desc) [0] {
  _id,
  sprintNumber,
  title,
  slug,
  summary,
  categories,
  tags,
  targetAudience,
  featuredImage,
  publishedAt,
  language
}`);

// ============================================================================
// ROADMAP QUERIES
// ============================================================================

const ROADMAP_ITEMS_QUERY =
  defineQuery(`*[_type == "roadmapItem" && language == $language] | order(priority desc, status asc) {
  _id,
  title,
  slug,
  description,
  status,
  category,
  priority,
  targetQuarter,
  targetAudience,
  featuredImage,
  language,
  shippedAt,
  "changelogTitle": changelogReference->title
}`);

const ROADMAP_ITEM_BY_SLUG_QUERY =
  defineQuery(`*[_type == "roadmapItem" && slug.current == $slug && language == $language][0] {
  _id,
  title,
  slug,
  description,
  status,
  category,
  priority,
  targetQuarter,
  targetAudience,
  featuredImage,
  language,
  shippedAt,
  "changelog": changelogReference->{
    _id,
    title,
    slug,
    summary,
    publishedAt
  }
}`);

const ROADMAP_BY_STATUS_QUERY =
  defineQuery(`*[_type == "roadmapItem" && status == $status && language == $language] | order(priority desc) {
  _id,
  title,
  slug,
  description,
  status,
  category,
  priority,
  targetQuarter,
  targetAudience,
  language
}`);

// ============================================================================
// MARKETING PAGES QUERIES
// ============================================================================

const PAGE_BY_SLUG_QUERY =
  defineQuery(`*[_type == "page" && slug.current == $slug && language == $language && isPublished == true][0] {
  _id,
  title,
  slug,
  pageType,
  sections,
  language,
  seoMetadata,
  publishedAt
}`);

const PAGE_BY_TYPE_QUERY =
  defineQuery(`*[_type == "page" && pageType == $pageType && language == $language && isPublished == true][0] {
  _id,
  title,
  slug,
  pageType,
  sections,
  language,
  seoMetadata,
  publishedAt
}`);

const CITY_PAGE_BY_SLUG_QUERY =
  defineQuery(`*[_type == "cityPage" && citySlug.current == $citySlug && language == $language && isPublished == true][0] {
  _id,
  cityName,
  citySlug,
  heroTitle,
  heroDescription,
  featuredImage,
  description,
  neighborhoodsServed,
  localBusinessSchema,
  language,
  seoMetadata,
  publishedAt
}`);

const ALL_CITY_PAGES_QUERY =
  defineQuery(`*[_type == "cityPage" && language == $language && isPublished == true] | order(cityName asc) {
  _id,
  cityName,
  citySlug,
  heroTitle,
  heroDescription,
  featuredImage,
  language
}`);

// ============================================================================
// GLOBAL SEARCH QUERY
// ============================================================================

const GLOBAL_SEARCH_QUERY = defineQuery(`{
  "helpArticles": *[_type == "helpArticle" && language == $language && isPublished == true && (
    title match $searchTerm + "*" ||
    excerpt match $searchTerm + "*"
  )] | order(_score desc) [0...5] {
    _id,
    _type,
    title,
    slug,
    "category": category->name
  },
  "changelogs": *[_type == "changelog" && language == $language && (
    title match $searchTerm + "*" ||
    summary match $searchTerm + "*"
  )] | order(_score desc) [0...5] {
    _id,
    _type,
    title,
    slug,
    sprintNumber
  },
  "roadmapItems": *[_type == "roadmapItem" && language == $language && (
    title match $searchTerm + "*"
  )] | order(_score desc) [0...5] {
    _id,
    _type,
    title,
    slug,
    status
  }
}`);

// ============================================================================
// SITEMAP QUERIES
// ============================================================================

const SITEMAP_HELP_ARTICLES_QUERY = defineQuery(`*[_type == "helpArticle" && isPublished == true] {
  "slug": slug.current,
  language,
  publishedAt
}`);

const SITEMAP_CHANGELOGS_QUERY = defineQuery(`*[_type == "changelog"] {
  "slug": slug.current,
  language,
  publishedAt
}`);

const SITEMAP_ROADMAP_ITEMS_QUERY = defineQuery(`*[_type == "roadmapItem"] {
  "slug": slug.current,
  language
}`);

const SITEMAP_PAGES_QUERY = defineQuery(`*[_type == "page" && isPublished == true] {
  "slug": slug.current,
  language,
  publishedAt
}`);

const SITEMAP_CITY_PAGES_QUERY = defineQuery(`*[_type == "cityPage" && isPublished == true] {
  "slug": citySlug.current,
  language,
  publishedAt
}`);

// ============================================================================
// BLOG QUERIES
// ============================================================================

const BLOG_POSTS_QUERY =
  defineQuery(`*[_type == "blogPost" && language == $language && isPublished == true] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  author,
  publishedAt,
  readingTime,
  featuredImage {
    asset,
    alt
  },
  "categoryName": category->name,
  "categorySlug": category->slug,
  tags,
  language
}`);

const BLOG_POST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "blogPost" && slug.current == $slug && language == $language && isPublished == true][0] {
  _id,
  title,
  slug,
  excerpt,
  content,
  author,
  publishedAt,
  readingTime,
  featuredImage {
    asset,
    alt
  },
  "category": category->{name, slug},
  tags,
  language,
  seoMetadata
}`);

const FEATURED_BLOG_POSTS_QUERY =
  defineQuery(`*[_type == "blogPost" && language == $language && isPublished == true && isFeatured == true] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  author,
  publishedAt,
  readingTime,
  featuredImage {
    asset,
    alt
  },
  "categoryName": category->name,
  tags,
  language
}`);

const BLOG_POSTS_BY_CATEGORY_QUERY =
  defineQuery(`*[_type == "blogPost" && category._ref == $categoryId && language == $language && isPublished == true] | order(publishedAt desc) [0...$limit] {
  _id,
  title,
  slug,
  excerpt,
  author,
  publishedAt,
  readingTime,
  featuredImage {
    asset,
    alt
  },
  tags,
  language
}`);

const SITEMAP_BLOG_POSTS_QUERY = defineQuery(`*[_type == "blogPost" && isPublished == true] {
  "slug": slug.current,
  language,
  publishedAt
}`);
