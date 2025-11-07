# Help Center - Quick Reference

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC HELP PAGES                        │
├─────────────────────────────────────────────────────────────┤
│ /[locale]/help                   (Home with categories)      │
│ /[locale]/help/[category]        (Category listing)         │
│ /[locale]/help/[category]/[article] (Article viewer)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      React Components                       │
├─────────────────────────────────────────────────────────────┤
│ • HelpSearchBar     (Typeahead with RPC search)             │
│ • ArticleViewer     (Article display + feedback)            │
│ • ArticleForm       (Create/edit with markdown editor)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE POSTGRES DB                      │
├─────────────────────────────────────────────────────────────┤
│ Tables:                                                     │
│ • help_categories        (7 seeded categories)             │
│ • help_articles          (bilingual content + metadata)    │
│ • help_article_feedback  (helpful/not helpful votes)       │
│ • help_article_relations (related articles links)          │
│                                                            │
│ Functions (RPC):                                           │
│ • search_help_articles() (full-text search)               │
│ • increment_article_view_count() (analytics)              │
│                                                            │
│ Triggers:                                                  │
│ • update_article_feedback_counts (auto-count votes)       │
│ • update_updated_at_column (auto-timestamp)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow (Quick)

### Article View
```
User visits /en/help/getting-started/create-booking
    ↓
Server component fetches article from DB
    ↓
Increments view_count via RPC (fire-and-forget)
    ↓
Fetches related articles (explicit links or same-category)
    ↓
Passes to ArticleViewer component
    ↓
Markdown → HTML → Sanitize → Render
```

### Feedback Submission
```
User clicks "Helpful" / "Not Helpful"
    ↓
Client-side handler (ArticleViewer)
    ↓
Gets/creates session_id for anonymous users
    ↓
Inserts into help_article_feedback
    ↓
Trigger updates helpful_count / not_helpful_count
    ↓
Show toast notification
```

### Search
```
User types in HelpSearchBar
    ↓
Debounced 300ms
    ↓
Calls supabase.rpc('search_help_articles', ...)
    ↓
PostgreSQL full-text search (tsvector + ts_rank)
    ↓
Returns top 5 results ranked by relevance
    ↓
Display in dropdown with category, title, excerpt
```

---

## Key Statistics

| Metric | Value |
|--------|-------|
| **Public Routes** | 3 (Home, Category, Article) |
| **Admin Routes** | 3 (Dashboard, Create, Edit) |
| **Components** | 5 main components |
| **Database Tables** | 4 tables |
| **RPC Functions** | 2 functions |
| **Database Triggers** | 2 triggers |
| **Categories** | 7 seeded |
| **Articles** | 0 (none seeded, add via admin) |
| **Locales** | 2 (EN/ES) |
| **Search Languages** | 2 (English, Spanish) |

---

## Routes Map

```
PUBLIC ROUTES
├── /[locale]/help
│   ├── Hero search
│   ├── Categories grid
│   └── Popular articles
├── /[locale]/help/[category]
│   ├── Category metadata
│   ├── Article list
│   └── Search bar
└── /[locale]/help/[category]/[article]
    ├── Article content
    ├── Feedback section
    └── Related articles

ADMIN ROUTES
├── /[locale]/admin/help-center
│   ├── Stats cards
│   ├── Filters (category, status)
│   └── Articles table
├── /[locale]/admin/help-center/new
│   └── ArticleForm (create)
└── /[locale]/admin/help-center/[id]
    └── ArticleForm (edit)
```

---

## Component Props

### HelpSearchBar
```ts
{
  placeholder?: string        // Custom placeholder text
  autoFocus?: boolean         // Auto-focus input
  className?: string          // Additional CSS classes
}
```

### ArticleViewer
```ts
{
  article: {
    id: string
    title: string
    content: string          // Markdown
    view_count: number
    helpful_count: number
    not_helpful_count: number
    created_at: string
    updated_at: string
  }
  categorySlug: string        // For breadcrumbs
  categoryName: string        // Display name
  relatedArticles?: Array<{
    id: string
    category_slug: string
    slug: string
    title: string
    excerpt: string | null
  }>
}
```

### ArticleForm
```ts
{
  categories: Array<{         // Loaded from DB
    id: string
    slug: string
    name_en: string
    name_es: string
  }>
  article?: {                 // Optional (edit mode)
    id: string
    category_id: string
    slug: string
    title_en: string
    title_es: string
    excerpt_en: string | null
    excerpt_es: string | null
    content_en: string
    content_es: string
    is_published: boolean
  }
}
```

---

## Database Schema Overview

### Bilingual Content
```sql
-- In help_articles:
title_en, title_es           -- Article titles
excerpt_en, excerpt_es       -- Short summaries
content_en, content_es       -- Markdown content

-- In help_categories:
name_en, name_es             -- Category names
description_en, description_es -- Category descriptions
```

### Analytics
```sql
-- Tracked on help_articles:
view_count                   -- Incremented on article view
helpful_count                -- Incremented when marked helpful
not_helpful_count           -- Incremented when marked not helpful

-- Stored in help_article_feedback:
id                          -- Unique feedback ID
article_id                  -- Which article
user_id                     -- Who (null for anonymous)
session_id                  -- Anonymous tracking
is_helpful                  -- true/false vote
feedback_text               -- Optional comment
created_at                  -- When submitted
```

### Full-Text Search
```sql
-- Generated columns (automatically maintained):
search_vector_en            -- Weighted English tsvector
search_vector_es            -- Weighted Spanish tsvector

-- Weights (search relevance):
A = title (highest priority)
B = excerpt (medium)
C = content (lowest)

-- Indexed for fast queries:
CREATE INDEX idx_help_articles_search_en GIN (search_vector_en)
CREATE INDEX idx_help_articles_search_es GIN (search_vector_es)
```

---

## i18n Keys (messages/*.json)

```json
{
  "help": {
    "meta": {
      "title": "Help Center",
      "description": "..."
    },
    "hero": {
      "title": "How can we help you?",
      "subtitle": "..."
    },
    "search": {
      "placeholder": "Search for help...",
      "searching": "Searching...",
      "noResults": "No articles found...",
      "viewAll": "View all results",
      "browseAll": "Browse all articles"
    },
    "categories": {
      "title": "Browse by Category",
      "article": "article",
      "articles": "articles",
      "browse": "Browse articles"
    },
    "popular": {
      "title": "Popular Articles",
      "view": "view",
      "views": "views"
    },
    "contact": {
      "title": "Still need help?",
      "description": "...",
      "button": "Contact Support"
    },
    "category": {
      "articlesCount": "...",
      "helpful": "helpful",
      "noArticles": { ... }
    },
    "article": {
      "meta": { ... },
      "feedback": { ... },
      "related": { ... },
      "contact": { ... }
    }
  }
}
```

---

## Seeded Categories (7 Total)

| Slug | Icon | EN Name | ES Name |
|------|------|---------|---------|
| getting-started | rocket | Getting Started | Primeros Pasos |
| bookings-scheduling | calendar | Bookings & Scheduling | Reservas y Programación |
| payments-refunds | credit-card | Payments & Refunds | Pagos y Reembolsos |
| communication | book-open | Communication | Comunicación |
| reviews-ratings | book-open | Reviews & Ratings | Reseñas y Calificaciones |
| safety-trust | shield-check | Safety & Trust | Seguridad y Confianza |
| account-settings | wrench | Account & Settings | Cuenta y Configuración |

---

## Admin Workflow

### Creating an Article
1. Navigate to `/admin/help-center/new`
2. Select category from dropdown
3. Enter English title (auto-generates slug)
4. Enter English excerpt (optional)
5. Write English content (markdown)
6. Switch to Spanish tab
7. Translate all fields to Spanish
8. Toggle "Published" checkbox
9. Click "Create Article"
10. Redirected to dashboard on success

### Editing an Article
1. Navigate to `/admin/help-center`
2. Find article in table
3. Click edit icon
4. Update any fields
5. Click "Update Article"
6. Redirected to dashboard on success

### Publishing/Unpublishing
- Toggle `is_published` checkbox in ArticleForm
- Unpublished articles hidden from public (RLS filters)
- Published articles immediately visible

---

## Performance Notes

### Search
- GIN indexes on tsvectors = O(log N) lookup for 10k+ articles
- 300ms debounce prevents excessive queries
- Top 5 results returned (configurable)

### View Counting
- Fire-and-forget RPC call (non-blocking)
- Increment happens asynchronously
- No UI wait time

### Article Pages
- Server-rendered by Next.js
- Markdown converted client-side
- Sanitization prevents XSS
- Related articles prefetched server-side

---

## Security Checklist

✅ RLS enabled on all tables
✅ Public can view only published/active content
✅ Content sanitized via DOMPurify before rendering
✅ Admin routes gated by role (requireUser(['admin']))
✅ Database mutations via server actions only
✅ Feedback insert allows anonymous (session_id tracked)
✅ Slug uniqueness enforced per category
✅ Self-relations prevented in article_relations
✅ Duplicate feedback prevented per user/session
✅ Trigger functions secure with SECURITY DEFINER

---

## Troubleshooting

### Search returns no results
- Check `is_published=true` on article
- Check `is_active=true` on category
- Verify search_vector_en/es was generated
- Test query with `websearch_to_tsquery()`

### Articles not appearing on category page
- Check `is_published=true` on article
- Verify correct `category_id` FK
- Check article count in category card

### Feedback not saving
- Check user_id OR session_id is set
- Verify unique constraint not violated
- Check database logs for errors

### View count not incrementing
- RPC called fire-and-forget (check async logs)
- Verify article.id passed correctly
- Check database permissions

---

## Related Documentation

- **Features:** `/docs/04-features/help-center.md`
- **Content Guidelines:** `/docs/04-features/help-center-content-guidelines.md`
- **Categories:** `/docs/04-features/help-center-categories.md`
- **SOPs:** `/docs/04-features/help-center-sops.md`
- **Full Implementation:** `/docs/03-technical/help-center-current-implementation.md`

---

## File Locations

```
src/
├── app/[locale]/help/
│   ├── page.tsx
│   ├── [category]/page.tsx
│   └── [category]/[article]/page.tsx
├── app/[locale]/admin/help-center/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/page.tsx
├── components/help/
│   ├── search-bar.tsx
│   └── article-viewer.tsx
└── components/admin/help-center/
    ├── article-form.tsx
    ├── article-actions.ts
    └── article-row-actions.tsx

messages/
├── en.json (help.* keys)
└── es.json (help.* keys)

supabase/migrations/
├── 20251102000435_create_help_articles.sql (tables/functions)
└── 20251107120000_seed_help_categories.sql  (initial data)
```

---

**Last Updated:** 2025-11-07
**Status:** Production Ready
**Maintainer:** Development Team
