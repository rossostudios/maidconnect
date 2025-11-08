# Help Center Troubleshooting Guide

> **Quick Diagnostic**: If help articles aren't displaying, run through this checklist in order. Most issues are RLS-related or locale-related.

---

## 🚨 Most Common Issues (Check These First)

### Issue #1: Missing RLS Policies (MOST COMMON)

**Symptom:** Articles don't load for anonymous (non-logged-in) users, but work when logged in as admin.

**Why it happens:** Row-Level Security (RLS) is enabled on `help_articles` table, but there's no policy allowing the `anon` role (anonymous users) to SELECT published articles.

**Fix:**
```bash
# Run the diagnostic migration
supabase db push

# Or manually run in Supabase SQL Editor:
SELECT * FROM public.diagnose_help_center();
```

**Expected output:**
```
check_name              | status  | details
------------------------|---------|---------------------------
Total Articles          | INFO    | 5
Published Articles      | OK      | 5 articles
Total Categories        | INFO    | 3
RLS on Articles         | OK      | Enabled
RLS on Categories       | OK      | Enabled
Orphaned Articles       | OK      | All articles have valid categories
```

If you see `WARNING` or `ERROR`, the migration `20251108120000_help_center_diagnostic_fix.sql` will fix it.

---

### Issue #2: Locale Fallback Missing

**Symptom:** `/en/help` shows articles, but `/es/help` shows empty page (or vice versa).

**Why it happens:** Proxy auto-detects visitor's locale and redirects them, but that locale has no published content yet.

**Current code behavior:**
- [src/app/[locale]/help/page.tsx:92-105](src/app/[locale]/help/page.tsx#L92-L105) - Fetches articles filtered by `is_published = true`
- **No fallback** to English if locale has zero articles

**Fix Option A (Quick): Add fallback in page component**

Edit `src/app/[locale]/help/page.tsx`:

```typescript
async function getPopularArticles(locale: string): Promise<PopularArticle[]> {
  const supabase = createSupabaseAnonClient();

  const titleField = locale === "es" ? "title_es" : "title_en";
  const excerptField = locale === "es" ? "excerpt_es" : "excerpt_en";

  const { data: rawArticles } = await supabase
    .from("help_articles")
    .select(
      `id, slug, ${titleField} as title, ${excerptField} as excerpt, view_count, category:help_categories!inner(slug)`
    )
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .limit(6);

  // ✅ ADD THIS: Fallback to English if no articles in current locale
  if (!rawArticles || rawArticles.length === 0) {
    if (locale !== 'en') {
      const { data: fallbackArticles } = await supabase
        .from("help_articles")
        .select(
          `id, slug, title_en as title, excerpt_en as excerpt, view_count, category:help_categories!inner(slug)`
        )
        .eq("is_published", true)
        .order("view_count", { ascending: false })
        .limit(6);

      if (fallbackArticles) {
        return fallbackArticles.map((article) => ({
          ...article,
          category_slug: article.category.slug,
        })) as PopularArticle[];
      }
    }
    return [];
  }

  // Rest of function...
}
```

**Fix Option B (Better): Show locale toggle + message**

Add a banner when viewing English content in Spanish locale:
```typescript
// In page component
const articlesInThisLocale = await getArticleCount(locale);
const showLocaleFallbackMessage = locale === 'es' && articlesInThisLocale === 0;
```

---

### Issue #3: X-Frame-Options Blocking Embeds

**Symptom:** Help articles don't render inside an iframe/widget. Browser console shows:

```
Refused to display 'https://yourapp.com/en/help/...' in a frame because
it set 'X-Frame-Options' to 'DENY'.
```

**Why it happens:** [proxy.ts:47-57](proxy.ts#L47-L57) adds `X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'` to ALL responses, which blocks embedding anywhere.

**Fix:** Relax headers for Help Center routes only

Edit `proxy.ts`:

```typescript
function addSecurityHeaders(response: NextResponse, pathname: string): NextResponse {
  // Default: block framing everywhere
  let xfo = 'DENY';
  let csp = "frame-ancestors 'none';";

  // ✅ ADD THIS: Allow Help Center to be embedded (if needed)
  const isHelpCenter = pathname.match(/^\/(en|es)\/help/);
  if (isHelpCenter) {
    xfo = 'SAMEORIGIN'; // or remove XFO entirely
    csp = "frame-ancestors 'self' https://your-portal.example.com;"; // allowlist your domains
  }

  response.headers.set('X-Frame-Options', xfo);
  response.headers.set('Content-Security-Policy', csp);
  // ... rest of headers
  return response;
}

// Then in proxy function:
response = addSecurityHeaders(response, request.nextUrl.pathname);
```

**⚠️ Security Note:** Only do this if you actually need to embed help articles. Otherwise, leave the strict default.

---

### Issue #4: Environment Variables Missing

**Symptom:** Articles never load in any locale. Server logs may show Supabase client errors.

**Why it happens:** [proxy.ts:54-59](proxy.ts#L54-L59) requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If missing, all Supabase queries fail silently.

**Fix:** Verify environment variables

```bash
# Check .env.local (development)
cat .env.local | grep SUPABASE

# Should show:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

For production (Vercel), check: Dashboard → Settings → Environment Variables

**Required variables** (from [.env.example](.env.example:40-44)):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Issue #5: Stale Cache / Service Worker

**Symptom:** Articles don't appear until hard reload. Differs across devices.

**Why it happens:**
1. Next.js ISR/caching hasn't revalidated after publishing
2. Service worker serving offline version

**Fix A: Revalidate after publishing**

When you mark an article as `is_published = true`, call:

```typescript
import { revalidatePath } from 'next/cache';

// After updating article
revalidatePath('/en/help');
revalidatePath('/es/help');
revalidatePath(`/en/help/${category.slug}`);
revalidatePath(`/en/help/${category.slug}/${article.slug}`);
```

**Fix B: Exclude Help Center from Service Worker**

If using a service worker, ensure `/help` routes aren't aggressively cached:

```javascript
// service-worker.js
const CACHE_EXCLUDE_PATTERNS = [
  /\/api\//,
  /\/dashboard\//,
  /\/help\//, // ✅ Add this
];
```

**Quick test:** Open in incognito mode (bypasses cache) or:

```bash
# Chrome DevTools
Cmd+Shift+Delete → Clear cache → Reload
```

---

## 🔍 Advanced Diagnostics

### Check Database Directly

Run in Supabase SQL Editor:

```sql
-- 1. Check if articles exist
SELECT
  id,
  slug,
  title_en,
  title_es,
  is_published,
  created_at
FROM public.help_articles
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if categories exist and are active
SELECT
  id,
  slug,
  name_en,
  name_es,
  is_active
FROM public.help_categories
ORDER BY display_order;

-- 3. Test anonymous access (toggle RLS OFF in SQL Editor)
-- This simulates what unauthenticated users see
SELECT * FROM help_articles WHERE is_published = true;
-- If this returns 0 rows with RLS OFF, no published articles exist
-- If this returns rows with RLS OFF but 0 with RLS ON, it's a policy issue
```

### Check RLS Policies

```sql
-- View current policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('help_articles', 'help_categories');

-- Expected policies:
-- help_articles: "Public can view published articles" (roles: {public})
-- help_categories: "Public can view active categories" (roles: {public})
```

### Test API Routes

```bash
# Test from command line (simulates anonymous user)
curl https://your-app.com/api/help/articles?locale=en

# Should return JSON with published articles
# If returns 401/403, it's an auth issue
# If returns empty array but articles exist, it's RLS
```

---

## 📋 Quick Checklist

Run through this in order:

- [ ] **Database exists**: Articles and categories tables created
- [ ] **Data exists**: At least 1 published article in database
- [ ] **RLS enabled**: Both tables have RLS turned on
- [ ] **Anon policies exist**: `public` role can SELECT published content
- [ ] **Permissions granted**: `GRANT SELECT TO anon`
- [ ] **Env vars set**: Supabase URL and anon key in production
- [ ] **Locale fallback**: Spanish shows English content if no ES articles
- [ ] **Security headers**: Not blocking iframe embeds (if needed)
- [ ] **Cache cleared**: Hard reload or incognito test

---

## 🛠️ Automated Fix

Run the diagnostic migration:

```bash
# This migration will:
# 1. Verify tables exist
# 2. Enable RLS
# 3. Create/fix public SELECT policies
# 4. Grant permissions to anon role
# 5. Provide diagnostic function

supabase db push
```

Then verify:

```sql
SELECT * FROM public.diagnose_help_center();
```

---

## 📞 Still Not Working?

If articles still don't appear after running through this checklist:

1. **Check browser console** for errors:
   - Open DevTools → Console tab
   - Look for fetch errors, CORS errors, or CSP violations

2. **Check Supabase logs**:
   - Supabase Dashboard → Logs
   - Filter by "error" or search for "help_articles"

3. **Enable debug mode**:
   ```typescript
   // Add to page component temporarily
   console.log('Categories:', categories);
   console.log('Popular articles:', popularArticles);
   ```

4. **Test with direct link**:
   - Try accessing a specific article: `/en/help/getting-started/first-booking`
   - If 404, article doesn't exist
   - If loads but list is empty, it's a query issue

---

## 🎯 Root Cause Summary

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| No articles for anyone | No published articles in DB | Publish articles via admin |
| Works logged in, not logged out | Missing anon SELECT policy | Run diagnostic migration |
| `/en/help` works, `/es/help` empty | No Spanish content + no fallback | Add locale fallback code |
| Iframe doesn't load | `X-Frame-Options: DENY` | Relax headers for `/help` |
| Random devices see empty | Service worker cache | Exclude `/help` from SW |
| Changes don't appear | No revalidation | Call `revalidatePath()` |

---

## 📚 Related Files

- **Frontend**: [src/app/[locale]/help/page.tsx](src/app/[locale]/help/page.tsx)
- **Proxy**: [proxy.ts](proxy.ts)
- **Migration**: [supabase/migrations/20251108120000_help_center_diagnostic_fix.sql](supabase/migrations/20251108120000_help_center_diagnostic_fix.sql)
- **Tags Migration**: [supabase/migrations/20251107220000_create_article_tags.sql](supabase/migrations/20251107220000_create_article_tags.sql)

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
