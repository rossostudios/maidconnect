# Help Center

## Overview

Casaora’s Help Center provides searchable, bilingual support content for customers and professionals. It includes category landing pages, article pages with feedback collection, related articles, and a global search with relevance ranking. Content is stored in Supabase, rendered in Next.js, and sanitized for safety.

---

## Table of Contents

- Architecture
- Pages & Routing
- Components
- Database Schema
- Search (RPC)
- Feedback & Analytics
- i18n & SEO
- Admin Publishing Workflow
- Security & RLS
- Future Enhancements

---

## Architecture

- Framework: Next.js 16 (App Router), React 19
- Data: Supabase Postgres (tables + RPC)
- Auth: Supabase Auth (anonymous browsing supported)
- i18n: next-intl (EN/ES)
- Sanitization: `sanitizeRichContent()` before `dangerouslySetInnerHTML`
- Telemetry: View counts + feedback events stored in Postgres

---

## Pages & Routing

- Help Home: `src/app/[locale]/help/page.tsx`
  - Categories grid (with counts)
  - Popular articles by views
  - Hero search bar
  - Uses `SiteHeader` and `SiteFooter` for a consistent marketing shell

- Category Page: `src/app/[locale]/help/[category]/page.tsx`
  - Category metadata (name/description)
  - Article list with views and helpfulness ratio
  - Breadcrumbs + search bar

- Article Page: `src/app/[locale]/help/[category]/[article]/page.tsx`
  - Renders article via `ArticleViewer`
  - Increments view count via Supabase RPC (fire-and-forget)
  - Pulls related articles from explicit relations or popular in-category

---

## Components

- `src/components/help/search-bar.tsx`
  - Debounced typeahead backed by `search_help_articles`
  - “View all” action deep-links to Help Home with `q` query

- `src/components/help/article-viewer.tsx`
  - Sanitizes rich HTML via `sanitizeRichContent()`
  - Collects feedback (helpful/not helpful + optional free-text)
  - Saves feedback for signed-in users or anonymous session IDs
  - Related articles + “Contact support” CTA

---

## Database Schema

Tables and functions are defined in Supabase migrations (see `supabase/migrations-archive/20251102000435_create_help_articles.sql`).

- `help_categories`
  - Fields: `id`, `slug`, `name_en`, `name_es`, `description_en`, `description_es`, `icon`, `display_order`, `is_active`, timestamps

- `help_articles`
  - Fields: `id`, `category_id`, `slug`, `title_en/es`, `excerpt_en/es`, `content_en/es`, `view_count`, `helpful_count`, `not_helpful_count`, `is_published`, `display_order`, timestamps

- `help_article_relations`
  - Fields: `article_id`, `related_article_id`
  - Used to explicitly curate “Related articles”

- `help_article_feedback`
  - Fields: `id`, `article_id`, `user_id` (nullable), `session_id` (nullable), `is_helpful`, `feedback_text` (nullable), timestamps
  - Unique constraint prevents duplicate feedback by same user/session per article

Functions (RPC):
- `search_help_articles(search_query text, locale text, limit_count int)`
- `increment_article_view_count(article_id uuid)`

---

## Search (RPC)

- Client: `HelpSearchBar` calls `supabase.rpc('search_help_articles', { search_query, locale, limit_count })`
- Indexing: GIN indexes on language-specific vectors for fast lookup
- Result shape: `id`, `category_id`, `category_slug`, `category_name`, `slug`, `title`, `excerpt`, `rank`

---

## Feedback & Analytics

- View counts increment on article render via `increment_article_view_count()`
- Feedback is inserted into `help_article_feedback`
  - Signed-in users: `user_id` populated
  - Anonymous: `session_id` stored (UUID in `localStorage`)
- “Helpful%” displayed on category listings: `helpful_count / (helpful_count + not_helpful_count)`

---

## i18n & SEO

- All pages support `en` and `es` locales via next-intl
- Metadata titles/descriptions are localized per page
- Article slugs are language-independent; titles/excerpts are translated
- Breadcrumbs and CTA copy localized via `messages/*.json` under the `help.*` namespace

---

## Admin Publishing Workflow

1. Create or update a category in `help_categories`
   - Set `icon` (e.g., `book-open`, `calendar`, `credit-card`, `shield-check`, `wrench`, `rocket`)
   - Order via `display_order`, activate with `is_active = true`
2. Draft an article in `help_articles`
   - Provide EN/ES fields: `title`, `excerpt`, and `content` (sanitized on render)
   - Set `display_order` for category lists
   - Publish by toggling `is_published = true`
3. (Optional) Add related articles in `help_article_relations`
4. Verify search indexing by testing queries in the Help search bar

Content guidelines
- Keep articles concise (300–800 words) with scannable headings and lists
- Lead with outcomes (“Do X → See Y”) and include screenshots where applicable
- Add “Related” links for cross-navigation
- Close with clear support escalation options

---

## Security & RLS

- RLS enabled on all Help tables; public SELECT for published content only
- Feedback insert policy allows authenticated users or anonymous sessions (non-identifying)
- All admin edits occur through secured tooling (not public clients)

---

## Future Enhancements

- Editor UI for Help content management (role-gated)
- Versioning + changelogs per article
- FAQ schema.org markup on article pages
- Search analytics dashboard (queries, CTR, zero-result terms)
- Inline translation assistance for editors

