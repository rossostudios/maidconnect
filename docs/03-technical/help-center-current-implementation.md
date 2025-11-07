# MaidConnect Help Center - Current Implementation Summary

## Executive Overview

MaidConnect has a fully implemented, production-ready help center system built with Next.js 16, Supabase PostgreSQL, and React 19. The system supports bilingual content (English/Spanish), full-text search with relevance ranking, feedback collection, analytics, and an admin management interface. All content is stored in the database rather than markdown files.

**Key Features:**
- Bilingual content (EN/ES) with automatic language detection
- Full-text search with relevance ranking (PostgreSQL)
- User feedback/ratings system (helpful/not helpful)
- View count analytics per article
- Admin management interface with create/edit/publish workflow
- Server-side rendered pages with dynamic routing
- Content sanitization for XSS prevention
- Related articles curation system

---

## 1. Routes & Pages

### Public-Facing Help Routes

**Help Center Home**
- **Path:** `/[locale]/help` (e.g., `/en/help`, `/es/help`)
- **File:** `src/app/[locale]/help/page.tsx`
- **Features:**
  - Hero search bar (with auto-focus option)
  - Categories grid (with article counts per category)
  - Popular articles section (sorted by view count, limited to 6)
  - "Contact Support" CTA
  - Metadata generation for SEO

**Category Page**
- **Path:** `/[locale]/help/[category]` (e.g., `/en/help/getting-started`)
- **File:** `src/app/[locale]/help/[category]/page.tsx`
- **Features:**
  - Category name, description, and breadcrumb navigation
  - Articles list for that category (sorted by display order, then by newest)
  - Engagement metrics: views per article, helpfulness percentage
  - Search bar
  - No articles fallback state with link back to categories

**Article Page**
- **Path:** `/[locale]/help/[category]/[article]` (e.g., `/en/help/getting-started/create-booking`)
- **File:** `src/app/[locale]/help/[category]/[article]/page.tsx`
- **Features:**
  - Full markdown article content (rendered as HTML, sanitized)
  - Breadcrumb navigation (Help > Category > Article)
  - View count and update date in article header
  - Feedback section (helpful/not helpful buttons with optional comment form)
  - Related articles section (linked articles grid)
  - "Contact Support" CTA at bottom
  - Fire-and-forget view count increment via RPC

### Admin Routes

**Help Center Admin Dashboard**
- **Path:** `/[locale]/admin/help-center`
- **File:** `src/app/[locale]/admin/help-center/page.tsx`
- **Features:**
  - Stats cards: Total articles, Published, Drafts, Total views
  - Filters: By category, by status (Published/Draft/All)
  - Articles table with: title (EN/ES), category, status, engagement (views/helpful %), updated date
  - Row actions: Edit, Preview, Delete
  - "New Article" CTA button

**Create Article Page**
- **Path:** `/[locale]/admin/help-center/new`
- **File:** `src/app/[locale]/admin/help-center/new/page.tsx`
- **Uses:** `ArticleForm` component (reusable for create/edit)

**Edit Article Page**
- **Path:** `/[locale]/admin/help-center/[id]`
- **File:** `src/app/[locale]/admin/help-center/[id]/page.tsx`
- **Uses:** `ArticleForm` component with prepopulated data

---

## 2. Components

### Public Components

**`src/components/help/search-bar.tsx`** - Client component
- **Props:** `placeholder?`, `autoFocus?`, `className?`
- **Features:**
  - Debounced search input (300ms debounce)
  - Typeahead results dropdown (max 5 results)
  - Results show: category badge, title, excerpt
  - "View all results" button links to `/help?q={query}`
  - Click backdrop to close results
  - Loading state with spinner
  - Clear button on input
- **Backend:** Calls `supabase.rpc('search_help_articles', {...})`

**`src/components/help/article-viewer.tsx`** - Client component
- **Props:**
  - `article` - Article data (id, title, content, view_count, helpful_count, not_helpful_count, created_at, updated_at)
  - `categorySlug` - Category slug for breadcrumb/related articles
  - `categoryName` - Category display name
  - `relatedArticles?` - Array of related articles
- **Features:**
  - Markdown to HTML conversion with `marked` library
  - HTML sanitization with `sanitizeRichContent()` to prevent XSS
  - Feedback submission (helpful/not helpful toggle)
  - Feedback form appears after "not helpful" selection
  - Duplicate feedback prevention
  - Anonymous user session tracking (localStorage)
  - Related articles grid (2 columns on md+)
  - "Contact Support" CTA
  - Date formatting in locale
- **State Management:** Local React useState for feedback UI
- **Error Handling:** Toast notifications on feedback errors

### Admin Components

**`src/components/admin/help-center/article-form.tsx`** - Client component
- **Props:**
  - `categories` - Array of category objects
  - `article?` - Optional article data for edit mode
- **Features:**
  - Form fields for: category, slug, title (EN/ES), excerpt (EN/ES), content (EN/ES)
  - Language tabs (EN/ES)
  - Preview/Edit mode toggle for content
  - Auto-slug generation from English title (new articles only)
  - Published checkbox
  - Markdown guide reference
  - Markdown to HTML preview with sanitization
  - Form validation before submission
  - Success/error toast notifications
- **Server Actions:** Calls `createArticle()` or `updateArticle()` actions

**`src/components/admin/help-center/article-actions.ts`** - Server actions
- `createArticle(formData)` - Creates new article, returns with success toast
- `updateArticle(id, formData)` - Updates existing article, returns with success toast

**`src/components/admin/help-center/article-row-actions.tsx`** - Client component
- **Props:** `articleId`, `articleSlug`, `articleTitle`, `categorySlug`
- **Actions:** Edit, Preview, Delete (with confirmation)

---

## 3. Database Schema

### Tables

**`help_categories`**
- `id` - UUID primary key
- `slug` - TEXT UNIQUE (URL identifier)
- `name_en`, `name_es` - TEXT (bilingual display names)
- `description_en`, `description_es` - TEXT (optional bilingual descriptions)
- `icon` - TEXT (icon name like 'book-open', 'calendar', 'credit-card', 'shield-check', 'wrench', 'rocket')
- `display_order` - INTEGER (for sorting)
- `is_active` - BOOLEAN (soft delete via RLS)
- `created_at`, `updated_at` - TIMESTAMPTZ

**`help_articles`**
- `id` - UUID primary key
- `category_id` - UUID foreign key → `help_categories.id` (CASCADE on delete)
- `slug` - TEXT (URL identifier, unique per category with CONSTRAINT `unique_category_slug`)
- `title_en`, `title_es` - TEXT (bilingual titles)
- `excerpt_en`, `excerpt_es` - TEXT (optional bilingual excerpts for listings)
- `content_en`, `content_es` - TEXT (markdown content stored as-is, rendered to HTML on display)
- `author_id` - UUID (nullable, references auth.users)
- `view_count` - INTEGER (incremented by RPC on article view)
- `helpful_count`, `not_helpful_count` - INTEGER (incremented by trigger on feedback insert)
- `is_published` - BOOLEAN (RLS filters to published articles)
- `display_order` - INTEGER (for sorting within category)
- `published_at` - TIMESTAMPTZ (optional publication timestamp)
- `created_at`, `updated_at` - TIMESTAMPTZ
- `search_vector_en`, `search_vector_es` - TSVECTOR (GENERATED ALWAYS, indexed)
  - Weights: A=title, B=excerpt, C=content
  - Uses `setweight()` for relevance ranking

**`help_article_feedback`**
- `id` - UUID primary key
- `article_id` - UUID foreign key → `help_articles.id` (CASCADE)
- `user_id` - UUID (nullable, for authenticated users)
- `session_id` - TEXT (nullable, for anonymous users via localStorage)
- `is_helpful` - BOOLEAN (true=helpful, false=not helpful)
- `feedback_text` - TEXT (optional free-text feedback)
- `created_at` - TIMESTAMPTZ
- **Constraints:**
  - `UNIQUE NULLS NOT DISTINCT (article_id, user_id)` - Prevent duplicate feedback from same user
  - `UNIQUE NULLS NOT DISTINCT (article_id, session_id)` - Prevent duplicate feedback from same session
  - `CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)` - Require at least one identifier

**`help_article_relations`**
- `article_id` - UUID (primary key, foreign key → help_articles)
- `related_article_id` - UUID (primary key, foreign key → help_articles)
- `created_at` - TIMESTAMPTZ
- **Constraints:**
  - PRIMARY KEY on (article_id, related_article_id)
  - `CHECK (article_id != related_article_id)` - Prevent self-relations
  - Cascade deletes when either article is deleted

### Indexes

- `idx_help_categories_slug` - For slug lookups
- `idx_help_categories_active` - For filtering by is_active=true
- `idx_help_categories_order` - For sorting by display_order
- `idx_help_articles_category` - For category filtering
- `idx_help_articles_slug` - For slug lookups
- `idx_help_articles_published` - For published filtering
- `idx_help_articles_category_slug` - For (category_id, slug) queries
- `idx_help_articles_order` - For display_order sorting
- `idx_help_articles_search_en`, `idx_help_articles_search_es` - GIN indexes on tsvectors for full-text search
- `idx_help_feedback_article` - For feedback counts aggregation
- `idx_help_feedback_user` - For user-specific feedback lookups
- `idx_help_relations_article`, `idx_help_relations_related` - For related article queries

### Functions (RPC)

**`search_help_articles(search_query text, locale text DEFAULT 'en', limit_count int DEFAULT 10)`**
- Returns: `TABLE (id, category_id, category_slug, category_name, slug, title, excerpt, rank)`
- Implementation:
  - Branches on locale (es vs en)
  - Uses `websearch_to_tsquery()` for user-friendly query syntax
  - Ranks results via `ts_rank()` on the locale-specific tsvector
  - Filters to `is_published=true` and `is_active=true`
  - Sorts by rank DESC, then by view_count DESC
  - Limits to `limit_count` results
- Called by `HelpSearchBar` component

**`increment_article_view_count(article_id UUID)`**
- Increments the `view_count` column on the article
- Called fire-and-forget from server component via `supabase.rpc()` in article page
- No error handling needed on client

**`update_article_feedback_counts()`** - Trigger function
- Automatically increments/decrements `helpful_count` and `not_helpful_count` on `help_articles`
- Triggered AFTER INSERT/UPDATE/DELETE on `help_article_feedback`
- Handles vote changes (if user changes helpful→not helpful)

**`update_updated_at_column()`** - Trigger function
- Sets `updated_at = NOW()` on any UPDATE to the table
- Applied to `help_categories` and `help_articles`

### Row-Level Security (RLS)

- All tables: RLS enabled
- `help_categories`: Public SELECT policy for `is_active=true`
- `help_articles`: Public SELECT policy for `is_published=true`
- `help_article_feedback`: 
  - INSERT policy: Allow anyone (no auth required)
  - SELECT policy: Users can view their own feedback or any feedback without user_id
- `help_article_relations`: Public SELECT policy

---

## 4. Data Flow

### Article Display (Public)

1. User navigates to `/en/help/getting-started/create-booking`
2. Server component (`[article]/page.tsx`) calls:
   ```ts
   getArticleData(categorySlug='getting-started', articleSlug='create-booking', locale='en')
   ```
3. Queries `help_articles` with:
   - SELECT title_en, content_en, view_count, helpful_count, not_helpful_count, etc.
   - JOIN to `help_categories` for category metadata
   - Filter: is_published=true, help_categories.slug=categorySlug
4. Calls RPC `increment_article_view_count()` (fire-and-forget)
5. Queries `help_article_relations` to get explicitly linked related articles
6. If no relations, queries same-category articles sorted by view_count
7. Renders `ArticleViewer` component with article data
8. `ArticleViewer` converts markdown to HTML via `marked.parse()`, then sanitizes via `sanitizeRichContent()`
9. HTML is rendered via `dangerouslySetInnerHTML` with sanitized content

### Feedback Submission

1. User clicks "Helpful" or "Not Helpful" on article page
2. Client-side handler (`article-viewer.tsx`):
   - Gets or creates `session_id` in localStorage (for anonymous users)
   - Calls `supabase.auth.getUser()` to check if authenticated
   - Inserts into `help_article_feedback`:
     - article_id, user_id (or null), session_id (or null), is_helpful, feedback_text (optional)
3. Database trigger `update_article_feedback_counts()` fires:
   - Increments `helpful_count` or `not_helpful_count` on `help_articles`
4. If "Not Helpful", shows feedback form for optional comment
5. User can optionally submit comment via UPDATE to `help_article_feedback.feedback_text`
6. Toast notification shows success/error

### Search

1. User types in `HelpSearchBar` component
2. Debounced query (300ms) calls:
   ```ts
   supabase.rpc('search_help_articles', {
     search_query: 'booking',
     locale: 'en',
     limit_count: 5
   })
   ```
3. RPC executes PostgreSQL full-text search:
   - Uses `websearch_to_tsquery()` for query parsing
   - Matches against `search_vector_en` (or `_es` depending on locale)
   - Ranks via `ts_rank()` weighted by field (title > excerpt > content)
   - Returns top 5 results sorted by relevance
4. Results displayed in dropdown with category badge, title, excerpt
5. Click result navigates to article page
6. "View all results" button links to `/help?q={query}` (not currently utilized, but wired up)

### Admin Article Creation

1. Admin navigates to `/admin/help-center/new`
2. `ArticleForm` component renders empty form
3. Admin fills in:
   - Category (dropdown from categories query)
   - English title (auto-generates slug)
   - English excerpt (optional)
   - English content (markdown)
   - Spanish title, excerpt, content
   - Published toggle
4. Clicks "Create Article"
5. Client validates form data (all required fields)
6. Calls server action `createArticle(formData)`:
   ```ts
   await supabase.from('help_articles').insert({
     category_id, slug, title_en, title_es,
     excerpt_en, excerpt_es, content_en, content_es,
     is_published
   })
   ```
7. Redirects to `/admin/help-center` on success
8. Toast notification confirms success

---

## 5. i18n & Localization

### Language Detection (via proxy.ts)

- Default to English
- Geolocation header (`x-vercel-ip-country` or `cf-ipcountry`) checked for Spanish-speaking countries
- Fall back to Accept-Language header parsing
- Stored in `NEXT_LOCALE` cookie (1-year expiration)
- Routes always prefixed with locale: `/en/help`, `/es/help`

### Content Localization

- Database stores all content in both languages:
  - `title_en`, `title_es`
  - `excerpt_en`, `excerpt_es`
  - `content_en`, `content_es`
  - `name_en`, `name_es` (categories)
- Pages query locale-specific columns dynamically:
  ```ts
  const titleField = locale === 'es' ? 'title_es' : 'title_en';
  const { data } = await supabase
    .from('help_articles')
    .select(`${titleField} as title, ...`)
  ```

### UI Text Localization

- Messages in `messages/en.json` and `messages/es.json`
- Organized under `help.*` namespace
- Used via `useTranslations('help')` on client, `getTranslations()` on server
- Keys include:
  - `meta.title`, `meta.description`
  - `hero.title`, `hero.subtitle`
  - `search.placeholder`, `search.searching`, `search.noResults`, etc.
  - `categories.title`, `categories.articles`, etc.
  - `popular.title`, `popular.views`
  - `contact.title`, `contact.description`, `contact.button`
  - `category.articlesCount`, `category.views`, `category.helpful`, etc.
  - `article.meta.*`, `article.feedback.*`, `article.related.*`, `article.contact.*`

---

## 6. Security & Content Sanitization

### XSS Prevention

1. Content stored in database as markdown (plain text)
2. On render, converted to HTML via `marked.parse()`
3. Sanitized via `sanitizeRichContent()` function (uses DOMPurify)
4. Rendered via `dangerouslySetInnerHTML` with sanitized HTML
5. Allowed tags: standard markdown output (headings, paragraphs, bold, italic, links, code blocks)

### RLS Policies

- All help tables have RLS enabled
- Public can view only published/active content
- Feedback insert allows unauthenticated requests
- No private content exposed

### Admin Access

- Routes gated via `requireUser({ allowedRoles: ['admin'] })`
- Database mutations only possible via server actions (not direct client API calls)

---

## 7. Admin Features

### Article Management

- **Create:** Full form with bilingual fields, markdown editor with preview
- **Edit:** Load existing article, update all fields
- **Delete:** Remove article (cascades to feedback, relations)
- **Publish/Unpublish:** Toggle `is_published` flag
- **Preview:** View article as public user would see it

### Filtering & Sorting

- Filter by category (dropdown)
- Filter by status (Published/Draft/All)
- Table sorted by `updated_at DESC` (newest first)
- Engagement metrics: view count, helpful %

### Category Management

- Currently managed via direct database seeding (migration file)
- Admin interface not yet built (future enhancement)
- 7 default categories: Getting Started, Bookings, Payments, Communication, Reviews, Safety, Account & Settings

### Analytics

- View count tracking per article
- Feedback counts (helpful vs not helpful)
- Helpfulness percentage calculation
- Admin dashboard displays total views, published count, draft count

---

## 8. Current Implementation Status

### Completed Features

✅ Bilingual content (EN/ES) with automatic language detection
✅ Database schema with all necessary tables and indexes
✅ Full-text search with relevance ranking (PostgreSQL tsvectors)
✅ View count tracking per article
✅ Feedback system (helpful/not helpful) with optional comments
✅ Admin article creation/editing interface
✅ Markdown editor with live preview
✅ Public article browsing with categories
✅ Related articles curation system
✅ Search bar on help pages (typeahead)
✅ RLS policies for public/private content
✅ Content sanitization (XSS prevention)
✅ Responsive design (Tailwind CSS)
✅ i18n for all UI text
✅ SEO metadata generation

### Known Limitations

- Article management interface requires direct database seeding for categories
- No bulk import/export for articles
- No article versioning/history
- Search only available on help pages (not site-wide)
- No search analytics dashboard
- No scheduled publishing
- No article comments/discussion

---

## 9. Deployment Considerations

### Database Migrations

- Help tables created via migration: `20251102000435_create_help_articles.sql`
- Categories seeded via migration: `20251107120000_seed_help_categories.sql`
- Both migrations are in the codebase and will be applied on deploy

### Environment Variables

- Standard Supabase credentials (already configured)
- No additional secrets needed for help center

### Performance Notes

- Full-text search indexed via GIN indexes (fast for queries up to 10k+ articles)
- View count increments are fire-and-forget (non-blocking)
- Article pages are server-rendered (static generation possible with revalidation)
- Search results limited to 5 by default (configurable)

---

## 10. Content Currently Seeded

### Categories (7 total)
1. **Getting Started** - Platform introduction
2. **Bookings & Scheduling** - Booking management
3. **Payments & Refunds** - Payment and refund info
4. **Communication** - Messaging and translation
5. **Reviews & Ratings** - Review system
6. **Safety & Trust** - Verification and safety
7. **Account & Settings** - Account management

### Articles

Currently no articles are seeded (migrations create empty tables). Articles must be added via admin interface or direct database insert.

---

## 11. File Structure Reference

```
maidconnect/
├── src/
│   ├── app/[locale]/
│   │   ├── help/
│   │   │   ├── page.tsx                 (Home)
│   │   │   ├── [category]/page.tsx      (Category listing)
│   │   │   └── [category]/[article]/    (Article viewer)
│   │   │       └── page.tsx
│   │   └── admin/help-center/
│   │       ├── page.tsx                 (Dashboard)
│   │       ├── new/page.tsx             (Create form)
│   │       └── [id]/page.tsx            (Edit form)
│   ├── components/
│   │   ├── help/
│   │   │   ├── search-bar.tsx           (Typeahead search)
│   │   │   └── article-viewer.tsx       (Article display + feedback)
│   │   └── admin/help-center/
│   │       ├── article-form.tsx         (Create/edit form)
│   │       ├── article-actions.ts       (Server actions)
│   │       └── article-row-actions.tsx  (Table actions)
│   └── lib/
│       ├── sanitize.ts                  (XSS prevention utility)
│       └── ...
├── messages/
│   ├── en.json                          (English i18n)
│   └── es.json                          (Spanish i18n)
├── supabase/
│   ├── migrations/
│   │   └── 20251107120000_seed_help_categories.sql
│   └── migrations-archive/
│       └── 20251102000435_create_help_articles.sql
└── docs/04-features/
    ├── help-center.md                   (Architecture docs)
    ├── help-center-categories.md        (Category reference)
    ├── help-center-content-guidelines.md (Writing guidelines)
    ├── help-center-sops.md              (Standard operating procedures)
    └── help-center-phase1-content-plan.md
```

---

## 12. Key Technologies

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.0 |
| Runtime | React | 19.2 |
| Language | TypeScript | 5 |
| Database | PostgreSQL (Supabase) | Latest |
| ORM/Client | Supabase JS | 2.76+ |
| Styling | Tailwind CSS | 4 |
| i18n | next-intl | 4.4+ |
| Markdown Parser | marked | 17.0 |
| XSS Prevention | DOMPurify | 3.3+ |
| Icons | Hugeicons | 1.2+ |
| Form Handling | React Hook Form | (via articles) |
| Validation | Zod | 4.1+ |

---

## 13. Recommendations for Mintlify Migration

### Considerations

1. **Markdown vs Database Content**
   - Mintlify uses MDX files in Git
   - Current system uses database (dynamic, no Git-based versioning)
   - Trade-off: Git versioning vs database flexibility

2. **Search Integration**
   - Mintlify has built-in search (Algolia)
   - Current system uses PostgreSQL FTS
   - Mintlify search will be faster but requires indexing setup

3. **Customization**
   - Mintlify UI is more opinionated
   - Current system offers full design control
   - Custom Mintlify theme would be needed to match brand

4. **Admin Workflow**
   - Mintlify requires Git commits for publishing
   - Current system allows instant publishing via database
   - Dev-friendly vs non-technical friendly

5. **i18n**
   - Mintlify supports i18n via file structure
   - Would need to adapt MaidConnect's bilingual setup

6. **Analytics**
   - Mintlify has limited built-in analytics
   - Current system tracks views and feedback in database
   - Custom implementation needed for Mintlify

### Migration Path

If proceeding with Mintlify:
1. Export all articles from database to MDX files
2. Organize by category per Mintlify structure
3. Set up Mintlify project with custom branding
4. Implement i18n for EN/ES
5. Replace `/help` routes with Mintlify iframe or API integration
6. Migrate article feedback/analytics to external service (or custom solution)

---

## Summary

The MaidConnect help center is **production-ready** with a complete tech stack, security measures, and admin interface. It's data-driven (database-backed), feature-rich, and scales well. Migration to Mintlify is possible but would represent a shift from database-driven to Git-driven content management with trade-offs in customization and real-time publishing.

