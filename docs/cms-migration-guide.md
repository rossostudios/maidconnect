# Casaora CMS Migration Guide

**Date:** 2025-01-16
**Author:** Claude Code
**Status:** Ready for Execution

## Executive Summary

This guide walks through migrating Casaora from a **hybrid CMS system** (Supabase + Custom BlockEditor) to a **fully Sanity-based CMS**. The migration will:

1. **Eliminate 1,500 LOC** of custom BlockEditor code
2. **Consolidate all content** in Sanity Studio
3. **Remove duplicate systems** (tags, help articles, changelog)
4. **Migrate analytics** to PostHog (better product analytics)
5. **Simplify architecture** - Single admin interface (Sanity Studio)

**Estimated Time:** 12-16 hours
**Risk Level:** Medium
**Dependencies:** None (can be done incrementally)

---

## Phase 1: Enhanced Sanity Configuration ✅ COMPLETE

**Goal:** Enhance Sanity Portable Text editor to match custom BlockEditor features.

### ✅ Completed Steps:

1. **Installed @sanity/code-input plugin**
   ```bash
   bun add @sanity/code-input
   ```

2. **Created custom block types:**
   - [sanity/schemas/objects/callout.ts](../sanity/schemas/objects/callout.ts) - Alert/callout blocks (info, success, warning, error, tip)
   - [sanity/schemas/objects/divider.ts](../sanity/schemas/objects/divider.ts) - Divider/separator blocks (solid, dashed, dotted, stars)

3. **Enhanced blockContent schema:**
   - Added code blocks with syntax highlighting (20+ languages)
   - Added callout blocks
   - Added divider blocks
   - Added checkbox lists
   - Added highlight mark
   - File: [sanity/schemas/objects/block-content.ts](../sanity/schemas/objects/block-content.ts)

4. **Registered new schemas:**
   - Updated [sanity/schemas/index.ts](../sanity/schemas/index.ts)
   - Registered callout and divider types

5. **Added code-input plugin:**
   - Updated [sanity/sanity.config.ts](../sanity/sanity.config.ts)
   - Enabled syntax highlighting

6. **Created frontend rendering components:**
   - Enhanced [src/lib/integrations/sanity/PortableText.tsx](../src/lib/integrations/sanity/PortableText.tsx)
   - Added callout renderer (5 types with color coding)
   - Added divider renderer (4 styles)
   - Added checkbox list renderer
   - Added highlight mark renderer

**Feature Parity:**

| Feature | Custom BlockEditor | Sanity Portable Text | Status |
|---------|-------------------|----------------------|--------|
| Headings (H1-H4) | ✅ | ✅ | ✅ Matches |
| Paragraph | ✅ | ✅ | ✅ Matches |
| Bold, Italic, Underline | ✅ | ✅ | ✅ Matches |
| Code (inline) | ✅ | ✅ | ✅ Matches |
| Code blocks | ✅ | ✅ | ✅ Matches (20+ languages) |
| Bullet/Numbered lists | ✅ | ✅ | ✅ Matches |
| Checkbox lists | ✅ | ✅ | ✅ Matches |
| Callouts/Alerts | ✅ | ✅ | ✅ Matches (5 types) |
| Dividers | ✅ | ✅ | ✅ Matches (4 styles) |
| Images | ✅ | ✅ | ✅ Matches + better (CDN) |
| Links | ✅ | ✅ | ✅ Matches + internal refs |
| Highlight | ✅ | ✅ | ✅ Matches |
| Real-time collab | ❌ | ✅ | ✅ Improvement |
| Version control | ❌ | ✅ | ✅ Improvement |
| Structured queries | ❌ | ✅ | ✅ Improvement |

**Result:** Sanity Portable Text now has **full feature parity** with the custom BlockEditor, plus additional benefits (real-time collaboration, built-in versioning, structured content).

---

## Phase 2: Migrate Help Article Tags

**Goal:** Consolidate tags from Supabase → Sanity

### Current State:

**Supabase:** `help_article_tags` table with 9 seed tags:
```sql
-- Seed data from migration 20251107220000_create_article_tags.sql
INSERT INTO help_article_tags (slug, name_en, name_es, color, description_en, description_es) VALUES
  ('getting-started', 'Getting Started', 'Primeros Pasos', '#3B82F6', 'Initial setup...', 'Configuración inicial...'),
  ('payment', 'Payment', 'Pago', '#10B981', 'Payment-related...', 'Temas de pago...'),
  ('troubleshooting', 'Troubleshooting', 'Solución de Problemas', '#EF4444', 'Common issues...', 'Problemas comunes...'),
  ('mobile', 'Mobile App', 'App Móvil', '#8B5CF6', 'Mobile app...', 'App móvil...'),
  ('verification', 'Verification', 'Verificación', '#F59E0B', 'Account and identity...', 'Verificación de cuenta...'),
  ('booking', 'Booking', 'Reservas', '#EC4899', 'Booking process...', 'Proceso de reserva...'),
  ('professional', 'For Professionals', 'Para Profesionales', '#14B8A6', 'Guides for professionals...', 'Guías para profesionales...'),
  ('customer', 'For Customers', 'Para Clientes', '#6366F1', 'Guides for customers...', 'Guías para clientes...'),
  ('account', 'Account', 'Cuenta', '#64748B', 'Account settings...', 'Configuración de cuenta...');
```

**Sanity:** `helpTag` schema already exists at [sanity/schemas/documents/help-tag.ts](../sanity/schemas/documents/help-tag.ts)

### Migration Steps:

1. **Create tags in Sanity Studio:**
   - Go to `/studio` → Help Tags
   - Create 9 tags matching Supabase data
   - Use same slugs, names, colors, descriptions

2. **Verify tags created:**
   ```bash
   # Query Sanity to verify tags exist
   curl -X POST https://7j0vrfmg.api.sanity.io/v2024-12-12/data/query/production \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"query": "*[_type == \"helpTag\"] { _id, slug, nameEn, nameEs, color }"}'
   ```

3. **Update help article components:**
   - File: [src/components/help/article-tags.tsx](../src/components/help/article-tags.tsx)
   - Change from Supabase query → Sanity query
   - Example:
   ```typescript
   // OLD: Supabase query
   const { data: tags } = await supabase
     .from('help_article_tags')
     .select('*')
     .in('id', articleTagIds);

   // NEW: Sanity query
   const tags = await sanityClient.fetch(`
     *[_type == "helpTag" && _id in $tagIds] {
       _id,
       slug,
       nameEn,
       nameEs,
       color,
       descriptionEn,
       descriptionEs
     }
   `, { tagIds: articleTagIds });
   ```

4. **Drop Supabase tables:**
   ```sql
   -- After confirming all tags migrated to Sanity
   DROP TABLE IF EXISTS help_article_tags_relation CASCADE;
   DROP TABLE IF EXISTS help_article_tags CASCADE;
   ```

---

## Phase 3: Migrate Help Center Content

**Goal:** Migrate help articles from Supabase + custom BlockEditor → Sanity

### Current State:

**Supabase:**
- Table: `help_articles` (schema not defined in migrations, likely created manually)
- Content stored as **markdown strings**
- Uses custom BlockEditor (1500 LOC)
- Admin UI: `/admin/help-center`

**Sanity:**
- Schema: `helpArticle` ([sanity/schemas/documents/help-article.ts](../sanity/schemas/documents/help-article.ts))
- Content stored as **Portable Text JSON**
- Uses Sanity Studio editor
- Admin UI: `/studio`

### Migration Steps:

#### Step 1: Export Existing Help Articles

```sql
-- Export all help articles from Supabase
COPY (
  SELECT
    id,
    title,
    slug,
    excerpt,
    content,  -- Markdown string
    category_id,
    is_published,
    display_order,
    locale,
    created_at,
    updated_at
  FROM help_articles
  ORDER BY created_at
) TO '/tmp/help_articles_export.csv' WITH CSV HEADER;
```

#### Step 2: Convert Markdown to Portable Text

Create a Node.js script to convert markdown → Portable Text:

```typescript
// scripts/migrate-help-articles.ts
import { createClient } from '@sanity/client';
import { marked } from 'marked';
import { blocksToPortableText } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import fs from 'fs';
import csv from 'csv-parser';

const sanityClient = createClient({
  projectId: '7j0vrfmg',
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-12-12',
  useCdn: false,
});

// Define Portable Text schema
const schema = Schema.compile({
  types: [/* your blockContent schema */]
});

async function convertMarkdownToPortableText(markdown: string) {
  // Parse markdown to HTML
  const html = marked(markdown);

  // Convert HTML to Portable Text blocks
  const blocks = blocksToPortableText(html, schema, {
    parseHtml: (html) => new DOMParser().parseFromString(html, 'text/html'),
  });

  return blocks;
}

async function migrateHelpArticles() {
  const articles: any[] = [];

  // Read CSV export
  fs.createReadStream('/tmp/help_articles_export.csv')
    .pipe(csv())
    .on('data', (row) => articles.push(row))
    .on('end', async () => {
      console.log(`Found ${articles.length} articles to migrate`);

      for (const article of articles) {
        console.log(`Migrating: ${article.title}`);

        // Convert markdown to Portable Text
        const portableTextContent = await convertMarkdownToPortableText(article.content);

        // Create document in Sanity
        await sanityClient.create({
          _type: 'helpArticle',
          title: article.title,
          slug: { current: article.slug },
          excerpt: article.excerpt,
          content: portableTextContent,
          category: {
            _type: 'reference',
            _ref: await getCategoryId(article.category_id),
          },
          isPublished: article.is_published,
          displayOrder: article.display_order,
          language: article.locale,
          publishedAt: article.created_at,
        });

        console.log(`✅ Migrated: ${article.title}`);
      }

      console.log('Migration complete!');
    });
}

migrateHelpArticles();
```

#### Step 3: Update Components to Use Sanity

Files to update:

1. **[src/components/help/article-viewer.tsx](../src/components/help/article-viewer.tsx)**
   ```typescript
   // OLD: Fetch from Supabase
   const { data: article } = await supabase
     .from('help_articles')
     .select('*')
     .eq('slug', slug)
     .single();

   // NEW: Fetch from Sanity
   const article = await sanityClient.fetch(`
     *[_type == "helpArticle" && slug.current == $slug][0] {
       _id,
       title,
       slug,
       excerpt,
       content,
       category->,
       tags[]->,
       isPublished,
       publishedAt
     }
   `, { slug });

   // Render with PortableText
   <SanityPortableText value={article.content} />
   ```

2. **[src/app/[locale]/help/[category]/[article]/page.tsx](../src/app/[locale]/help/[category]/[article]/page.tsx)**
   - Replace Supabase query with Sanity GROQ query
   - Use `SanityPortableText` component for rendering

3. **Remove admin help center routes:**
   - Delete `/admin/help-center` routes (replaced by `/studio`)
   - Delete `/admin/help/articles` routes

#### Step 4: Drop Supabase Tables

```sql
-- After confirming all content migrated successfully
DROP TABLE IF EXISTS help_articles CASCADE;
DROP TABLE IF EXISTS help_categories CASCADE;
```

---

## Phase 4: Migrate Changelog Content

**Goal:** Migrate changelog from Supabase + custom BlockEditor → Sanity

### Current State:

**Supabase:**
- Table: `changelog_entries` (not found in migrations)
- Content stored as **markdown strings**
- Uses custom BlockEditor (same 1500 LOC component)
- Admin UI: `/admin/changelog`

**Sanity:**
- Schema: `changelog` ([sanity/schemas/documents/changelog.ts](../sanity/schemas/documents/changelog.ts))
- Content stored as **Portable Text JSON**
- Uses Sanity Studio editor
- Admin UI: `/studio`

### Migration Steps:

#### Step 1: Export Existing Changelog Entries

```sql
-- Export all changelog entries from Supabase
COPY (
  SELECT
    id,
    sprint_number,
    title,
    slug,
    summary,
    content,  -- Markdown string
    categories,
    tags,
    target_audience,
    featured_image_url,
    language,
    published_at,
    created_at,
    updated_at
  FROM changelog_entries
  WHERE is_published = true
  ORDER BY created_at DESC
) TO '/tmp/changelog_export.csv' WITH CSV HEADER;
```

#### Step 2: Convert and Migrate

Similar to help articles, create a migration script:

```typescript
// scripts/migrate-changelog.ts
import { createClient } from '@sanity/client';
import { convertMarkdownToPortableText } from './lib/markdown-converter';
import fs from 'fs';
import csv from 'csv-parser';

const sanityClient = createClient({
  projectId: '7j0vrfmg',
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-12-12',
  useCdn: false,
});

async function migrateChangelog() {
  const entries: any[] = [];

  fs.createReadStream('/tmp/changelog_export.csv')
    .pipe(csv())
    .on('data', (row) => entries.push(row))
    .on('end', async () => {
      console.log(`Found ${entries.length} changelog entries to migrate`);

      for (const entry of entries) {
        console.log(`Migrating: ${entry.title}`);

        const portableTextContent = await convertMarkdownToPortableText(entry.content);

        await sanityClient.create({
          _type: 'changelog',
          sprintNumber: entry.sprint_number,
          title: entry.title,
          slug: { current: entry.slug },
          summary: entry.summary,
          content: portableTextContent,
          categories: JSON.parse(entry.categories || '[]'),
          tags: JSON.parse(entry.tags || '[]'),
          targetAudience: JSON.parse(entry.target_audience || '[]'),
          language: entry.language,
          publishedAt: entry.published_at,
        });

        console.log(`✅ Migrated: ${entry.title}`);
      }
    });
}

migrateChangelog();
```

#### Step 3: Update Components

Files to update:

1. **[src/components/changelog/changelog-modal.tsx](../src/components/changelog/changelog-modal.tsx)**
2. **[src/app/[locale]/changelog/page.tsx](../src/app/[locale]/changelog/page.tsx)**
3. **[src/app/api/changelog/latest/route.ts](../src/app/api/changelog/latest/route.ts)**
4. **[src/app/api/changelog/list/route.ts](../src/app/api/changelog/list/route.ts)**

Replace Supabase queries with Sanity GROQ queries:

```typescript
// OLD: Supabase
const { data } = await supabase
  .from('changelog_entries')
  .select('*')
  .order('published_at', { ascending: false })
  .limit(10);

// NEW: Sanity
const changelogs = await sanityClient.fetch(`
  *[_type == "changelog" && language == $language]
  | order(publishedAt desc) [0...10] {
    _id,
    sprintNumber,
    title,
    slug,
    summary,
    content,
    categories,
    tags,
    publishedAt
  }
`, { language: 'en' });
```

#### Step 4: Remove Admin Routes

```bash
# Delete these files/folders:
rm -rf src/app/[locale]/admin/changelog/
rm -rf src/components/admin/changelog/
rm src/app/api/admin/changelog/*.ts
```

#### Step 5: Drop Supabase Table

```sql
DROP TABLE IF EXISTS changelog_entries CASCADE;
```

---

## Phase 5: Migrate Search Analytics to PostHog

**Goal:** Replace Supabase search analytics with PostHog

### Current State:

**Supabase:**
- Table: `help_search_analytics`
- Functions: `get_top_searches()`, `get_no_result_searches()`
- Tracks: query, locale, result_count, clicked_article_id

**PostHog:** Already integrated ([src/lib/integrations/posthog](../src/lib/integrations/posthog))

### Migration Steps:

#### Step 1: Implement PostHog Search Tracking

Update [src/components/help/search-bar.tsx](../src/components/help/search-bar.tsx):

```typescript
import { trackEvent } from '@/lib/integrations/posthog';

const handleSearch = async (query: string) => {
  const results = await searchHelpArticles(query);

  // Track search event in PostHog
  trackEvent('Help Center Search', {
    query,
    locale: currentLocale,
    resultCount: results.length,
    source: 'help_center',
    hasResults: results.length > 0,
  });

  setSearchResults(results);
};

const handleArticleClick = (article: HelpArticle, index: number) => {
  // Track article click from search
  trackEvent('Help Article Viewed from Search', {
    articleId: article._id,
    articleTitle: article.title,
    searchQuery: currentSearchQuery,
    resultPosition: index,
    category: article.category?.slug,
  });

  router.push(`/help/${article.category.slug}/${article.slug}`);
};
```

#### Step 2: Create PostHog Analytics Dashboard

In PostHog UI:

1. **Top Searches Insight:**
   - Event: `Help Center Search`
   - Breakdown by: `query`
   - Metric: Event count
   - Filter: Last 30 days

2. **No Results Searches:**
   - Event: `Help Center Search`
   - Filter: `resultCount = 0`
   - Breakdown by: `query`

3. **Search → View Funnel:**
   - Step 1: `Help Center Search`
   - Step 2: `Help Article Viewed from Search`
   - Conversion rate shows search effectiveness

4. **Article Helpfulness:**
   - Event: `Help Article Feedback`
   - Filter by: `helpful = true/false`
   - Correlation with `searchQuery`

#### Step 3: Drop Supabase Analytics

```sql
-- Drop search analytics functions
DROP FUNCTION IF EXISTS get_top_searches();
DROP FUNCTION IF EXISTS get_no_result_searches();

-- Drop search analytics table
DROP TABLE IF EXISTS help_search_analytics CASCADE;
```

#### Step 4: Update Admin Analytics Views

Remove Supabase analytics queries from admin:
- File: [src/app/[locale]/admin/content/help-center/page.tsx](../src/app/[locale]/admin/content/help-center/page.tsx)
- Replace with PostHog dashboard embed or link

---

## Phase 6: Remove Custom BlockEditor

**Goal:** Delete 1,500 LOC custom BlockEditor component

### Files to Delete:

```bash
# Main BlockEditor component (1500 LOC)
rm src/components/admin/help/block-editor.tsx

# Associated components
rm src/components/admin/help-center/article-form.tsx  # Uses BlockEditor
rm src/components/admin/changelog/changelog-editor.tsx  # Uses BlockEditor

# Admin routes that use BlockEditor
rm -rf src/app/[locale]/admin/help-center/
rm -rf src/app/[locale]/admin/help/
rm -rf src/app/[locale]/admin/changelog/
```

### Verify No Remaining References:

```bash
# Search for BlockEditor imports
grep -r "block-editor" src/
grep -r "BlockEditor" src/

# Should return no results
```

---

## Phase 7: Final Cleanup

**Goal:** Drop all unused Supabase CMS tables and migrations

### Step 1: Drop Migrations

```bash
# Move to archive (don't delete, for rollback)
mkdir -p supabase/migrations/archive/
mv supabase/migrations/20251107220000_create_article_tags.sql supabase/migrations/archive/
mv supabase/migrations/20251107210000_create_search_analytics.sql supabase/migrations/archive/

# Add note
echo "Archived: Migrated to Sanity CMS on 2025-01-16" > supabase/migrations/archive/README.md
```

### Step 2: Drop All CMS Tables

```sql
-- Drop help article tags
DROP TABLE IF EXISTS help_article_tags_relation CASCADE;
DROP TABLE IF EXISTS help_article_tags CASCADE;

-- Drop search analytics
DROP FUNCTION IF EXISTS get_top_searches();
DROP FUNCTION IF EXISTS get_no_result_searches();
DROP TABLE IF EXISTS help_search_analytics CASCADE;

-- Drop help articles (if still exists)
DROP TABLE IF EXISTS help_articles CASCADE;
DROP TABLE IF EXISTS help_categories CASCADE;

-- Drop changelog (if still exists)
DROP TABLE IF EXISTS changelog_entries CASCADE;
```

### Step 3: Update Documentation

Update [CLAUDE.md](../CLAUDE.md):

```markdown
## Content Management

**CMS:** Sanity CMS (fully managed)
- **Admin:** `/studio` - Sanity Studio (all content types)
- **Content Types:**
  - Blog Posts (`blogPost`)
  - Help Articles (`helpArticle`)
  - Help Categories (`helpCategory`)
  - Help Tags (`helpTag`)
  - Changelog (`changelog`)
  - Roadmap Items (`roadmapItem`)
  - Marketing Pages (`page`, `cityPage`)

**Analytics:** PostHog
- Search analytics
- Content engagement
- User behavior tracking

**Removed:**
- ❌ Custom BlockEditor (1500 LOC) → Replaced with Sanity Studio
- ❌ Supabase CMS tables → Migrated to Sanity Content Lake
- ❌ Custom admin routes → Replaced with `/studio`
```

### Step 4: Run Final Build

```bash
# Ensure everything compiles
bun run check
bun run build

# Test in development
bun dev

# Verify Sanity Studio works
open http://localhost:3000/studio
```

---

## Rollback Plan

If migration fails, rollback steps:

### 1. Restore Supabase Database

```bash
# From backup taken before migration
psql -U postgres -d maidconnect < backup_pre_migration.sql
```

### 2. Revert Code Changes

```bash
git revert <migration-commit-hash>
```

### 3. Verify Systems Operational

```bash
bun dev
# Test help center, changelog, admin routes
```

---

## Success Metrics

Track these metrics post-migration:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Code reduction | -1,500 LOC | `git diff --stat` |
| Admin simplification | 1 UI (down from 3) | `/studio` vs `/admin/help-center` + `/admin/changelog` |
| Content creation time | -30% | Time to publish new help article |
| Search analytics richness | +5 insights | PostHog dashboard vs Supabase queries |
| Build time | No regression | `next build` time |
| Page load time | No regression | Lighthouse score |
| Editor collaboration | Enabled | Real-time editing works |

---

## Post-Migration Tasks

1. **Train team on Sanity Studio:**
   - Schedule 1-hour training session
   - Create video walkthrough
   - Document common workflows

2. **Set up PostHog dashboards:**
   - Top searches
   - No-result searches
   - Search → view funnel
   - Article helpfulness

3. **Monitor for issues:**
   - First 48 hours: Check every 6 hours
   - First week: Daily checks
   - First month: Weekly checks

4. **Performance baseline:**
   - Measure page load times
   - Measure content query times
   - Compare to pre-migration

---

## Contact & Support

**Questions during migration?**
- Review this guide
- Check Sanity docs: https://www.sanity.io/docs
- Check PostHog docs: https://posthog.com/docs

**Rollback needed?**
- Follow rollback plan above
- Document issues encountered
- Plan remediation

---

**Last Updated:** 2025-01-16
**Version:** 1.0
**Next Review:** Post-migration (2025-01-17+)
