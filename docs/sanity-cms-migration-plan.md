# Sanity CMS Migration Plan

## Executive Summary

**Current State:** Casaora uses a **hybrid CMS architecture**:
- ✅ **Sanity CMS** - Content authoring (roadmap, changelog, blog, help articles)
- 🔄 **Supabase** - Interactive features (voting, analytics, tagging)

**Goal:** Fully migrate to Sanity CMS for all content management and remove redundant Supabase CMS code.

**Key Insight:** Your content is **already in Sanity!** The migration focuses on:
1. Consolidating duplicate systems (tags, help articles)
2. Moving analytics to PostHog (better product analytics)
3. Keeping interactive features in Supabase (voting is relational data, not content)

---

## Migration Strategy

### Phase 1: Help Article Tags Migration ✅

**Current State:**
- **Supabase:** `help_article_tags` table with 9 seed tags
- **Sanity:** `helpTag.ts` schema already exists

**Action:**
1. ✅ **Use Sanity tags exclusively** - Already have `helpTag` schema in Sanity
2. ❌ **Remove Supabase tags** - Delete `help_article_tags` and `help_article_tags_relation` tables
3. 🔄 **Update components** - Modify help article components to fetch tags from Sanity

**Files to Update:**
- [src/components/help/article-tags.tsx](src/components/help/article-tags.tsx) - Use Sanity tags
- [src/lib/services/search/](src/lib/services/search/) - Update tag queries

**Migration SQL:**
```sql
-- Drop Supabase tag tables (after confirming all tags migrated to Sanity)
DROP TABLE IF EXISTS help_article_tags_relation;
DROP TABLE IF EXISTS help_article_tags;
```

---

### Phase 2: Search Analytics Migration 📊

**Current State:**
- **Supabase:** `help_search_analytics` table tracking search queries
- **Functions:** `get_top_searches()`, `get_no_result_searches()`

**Recommendation:** **Migrate to PostHog** (already integrated!)

**Why PostHog?**
- ✅ Already integrated for product analytics
- ✅ Better search tracking with user journey context
- ✅ Funnel analysis (search → view article → helpful/not helpful)
- ✅ Automatic session replay for debugging poor searches
- ✅ No additional database maintenance

**Action:**
1. 🔄 **Implement PostHog search tracking:**
```typescript
import { trackEvent } from '@/lib/integrations/posthog';

// When user searches help center
trackEvent('Help Center Search', {
  query: searchQuery,
  locale: currentLocale,
  resultCount: results.length,
  source: 'help_center',
});

// When user clicks search result
trackEvent('Help Article Viewed from Search', {
  articleId: article.id,
  articleTitle: article.title,
  searchQuery: originalQuery,
  resultPosition: index,
});
```

2. ❌ **Remove Supabase search analytics:**
```sql
-- Drop search analytics table
DROP FUNCTION IF EXISTS get_top_searches();
DROP FUNCTION IF EXISTS get_no_result_searches();
DROP TABLE IF EXISTS help_search_analytics;
```

**Benefits:**
- Unified analytics in one platform
- Richer user behavior insights
- Less database complexity
- Better search optimization with funnel analysis

---

### Phase 3: Roadmap Voting (Keep in Supabase) ✅

**Current State:**
- **Supabase:** `roadmap_votes`, `roadmap_votes_summary`
- **Sanity:** `roadmapItem.ts` for content

**Decision:** **Keep voting in Supabase**

**Why?**
- ✅ Voting is **relational user data**, not content
- ✅ Sanity is for content authoring, not user interactions
- ✅ Efficient aggregation with `roadmap_votes_summary`
- ✅ Already optimized with proper architecture

**Current Architecture (Correct):**
- **Sanity:** Roadmap content (title, description, status, category)
- **Supabase:** User votes (user_id, roadmap_item_id, timestamp)
- **Service Layer:** Merges Sanity content + Supabase votes

**No Changes Needed** - This is the correct hybrid approach!

---

### Phase 4: Help Articles Consolidation 🧹

**Current State:**
- **Duplicate systems:** `help_articles` table in Supabase + `helpArticle` schema in Sanity

**Action:**
1. ✅ **Use Sanity exclusively** for help articles
2. ❌ **Remove Supabase tables:**
```sql
DROP TABLE IF EXISTS help_articles;
DROP TABLE IF EXISTS help_categories;
```

3. 🔄 **Update components:**
- Remove any queries to Supabase `help_articles` table
- Use Sanity client for all help article fetching

**Files to Check:**
- [src/components/help/](src/components/help/) - Ensure all components use Sanity
- [src/lib/services/search/](src/lib/services/search/) - Update search queries
- [src/app/api/help/](src/app/api/help/) - Remove any Supabase help article API routes

---

### Phase 5: Code Cleanup 🧹

**Files to Remove:**

1. **API Routes (Supabase help articles):**
   - `/api/help/articles/route.ts` (if exists)
   - `/api/help/categories/route.ts` (if exists)
   - `/api/help/tags/route.ts` (if exists)

2. **Migrations (after backup):**
   - `20251107220000_create_article_tags.sql`
   - `20251107210000_create_search_analytics.sql`
   - Any help article table migrations

3. **Server Actions (if Supabase-based):**
   - Consolidate `help-articles-actions.ts` to use Sanity exclusively

**Files to Update:**

1. **Sanity Schemas (consolidate):**
   - Merge duplicate schemas (e.g., `help-article.ts` and `helpArticle.ts`)
   - Merge duplicate schemas (e.g., `help-tag.ts` and `helpTag.ts`)

2. **Components:**
   - Update all help article components to fetch from Sanity
   - Remove Supabase tag references

3. **Services:**
   - Update search service to use PostHog analytics
   - Ensure all help article services use Sanity client

---

## Migration Checklist

### Pre-Migration
- [ ] **Backup Supabase database** (full dump)
- [ ] **Export all help article tags** from Supabase
- [ ] **Verify all content exists in Sanity** (help articles, categories, tags)
- [ ] **Review PostHog setup** for analytics migration

### Help Article Tags Migration
- [ ] Create missing tags in Sanity (match Supabase seed data)
- [ ] Update help article components to use Sanity tags
- [ ] Test tag filtering and display
- [ ] Drop Supabase tag tables

### Search Analytics Migration
- [ ] Implement PostHog search tracking events
- [ ] Test search tracking in development
- [ ] Verify analytics appear in PostHog dashboard
- [ ] Drop Supabase search analytics table

### Help Articles Consolidation
- [ ] Verify all help articles in Sanity
- [ ] Update all components to use Sanity exclusively
- [ ] Remove Supabase help article queries
- [ ] Drop Supabase help article tables

### Code Cleanup
- [ ] Remove duplicate API routes
- [ ] Consolidate duplicate Sanity schemas
- [ ] Update server actions to use Sanity
- [ ] Remove unused migrations
- [ ] Run `bun run check` for linting
- [ ] Run `bun run build` to verify build
- [ ] Test all help center functionality

### Post-Migration
- [ ] Monitor PostHog analytics for search tracking
- [ ] Verify roadmap voting still works
- [ ] Test help article viewing and searching
- [ ] Update documentation (README, CLAUDE.md)
- [ ] Create rollback plan (database backup + code revert)

---

## SQL Migration Scripts

### 1. Drop Help Article Tags

```sql
-- Drop help article tags (after migrating to Sanity)
DROP TABLE IF EXISTS help_article_tags_relation CASCADE;
DROP TABLE IF EXISTS help_article_tags CASCADE;
```

### 2. Drop Search Analytics

```sql
-- Drop search analytics functions
DROP FUNCTION IF EXISTS get_top_searches();
DROP FUNCTION IF EXISTS get_no_result_searches();

-- Drop search analytics table
DROP TABLE IF EXISTS help_search_analytics CASCADE;
```

### 3. Drop Help Articles (if still in Supabase)

```sql
-- Drop help articles (after confirming all in Sanity)
DROP TABLE IF EXISTS help_articles CASCADE;
DROP TABLE IF EXISTS help_categories CASCADE;
```

---

## PostHog Search Tracking Implementation

### Event Schema

```typescript
// When user performs search
trackEvent('Help Center Search', {
  query: string,              // Search query
  locale: 'en' | 'es',        // Language
  resultCount: number,        // Number of results
  source: 'help_center',      // Search source
});

// When user clicks search result
trackEvent('Help Article Viewed from Search', {
  articleId: string,          // Article ID
  articleTitle: string,       // Article title
  searchQuery: string,        // Original search query
  resultPosition: number,     // Position in search results (0-based)
});

// When user rates article helpfulness
trackEvent('Help Article Feedback', {
  articleId: string,
  articleTitle: string,
  helpful: boolean,
  searchQuery?: string,       // If viewed from search
});
```

### Implementation Example

```typescript
// src/components/help/search-bar.tsx
import { trackEvent } from '@/lib/integrations/posthog';

const handleSearch = async (query: string) => {
  const results = await searchHelpArticles(query);

  // Track search event
  trackEvent('Help Center Search', {
    query,
    locale: currentLocale,
    resultCount: results.length,
    source: 'help_center',
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
  });

  router.push(`/help/${article.category.slug}/${article.slug}`);
};
```

---

## Benefits After Migration

### 1. **Simplified Architecture**
- ✅ Single source of truth for content (Sanity)
- ✅ Unified analytics platform (PostHog)
- ✅ Less database maintenance

### 2. **Better Analytics**
- ✅ Search behavior + user journey context
- ✅ Funnel analysis (search → view → helpful)
- ✅ Session replay for debugging

### 3. **Reduced Complexity**
- ✅ Fewer API routes to maintain
- ✅ Fewer database tables
- ✅ Less duplicate code

### 4. **Better Developer Experience**
- ✅ Clearer separation of concerns
- ✅ Sanity Studio for content editing
- ✅ PostHog dashboard for analytics
- ✅ Faster development cycles

---

## Rollback Plan

If migration fails, rollback steps:

1. **Restore Supabase database** from backup:
```bash
psql -U postgres -d maidconnect < backup_pre_migration.sql
```

2. **Revert code changes:**
```bash
git revert <migration-commit-hash>
```

3. **Verify all systems operational**

---

## Timeline Estimate

| Phase | Duration | Risk |
|-------|----------|------|
| Phase 1: Tags Migration | 2 hours | Low |
| Phase 2: Search Analytics | 3 hours | Medium |
| Phase 3: Roadmap Voting | No changes | None |
| Phase 4: Help Articles | 4 hours | Medium |
| Phase 5: Code Cleanup | 3 hours | Low |
| **Total** | **12 hours** | **Medium** |

---

## Next Steps

1. **Review this migration plan** and approve
2. **Backup Supabase database** (critical!)
3. **Start with Phase 1** (tags migration - lowest risk)
4. **Test thoroughly** after each phase
5. **Monitor PostHog analytics** post-migration

---

## Questions to Answer Before Migration

1. **Are all help articles already in Sanity?**
   - [ ] Yes, migrate now
   - [ ] No, need to migrate content first

2. **Are we comfortable with PostHog for search analytics?**
   - [ ] Yes, migrate to PostHog
   - [ ] No, keep Supabase search analytics

3. **Do we have a database backup strategy?**
   - [ ] Yes, automated backups enabled
   - [ ] No, need to set up backups first

4. **Timeline:**
   - [ ] Migrate immediately
   - [ ] Migrate next sprint
   - [ ] Migrate in Q2

---

**Last Updated:** 2025-01-16
**Author:** Claude Code
**Status:** Pending Review
