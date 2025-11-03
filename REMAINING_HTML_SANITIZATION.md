# Remaining HTML Sanitization Tasks

## ✅ Completed (2/13)
1. ✅ `/src/components/help/article-viewer.tsx` - Help article content
2. ✅ `/src/app/[locale]/changelog/[slug]/page.tsx` - Changelog detail page

## 🔄 Remaining Files (11/13)

### Pattern to Follow

For **Client Components** (use client):
```typescript
import { useMemo } from "react";
import { sanitizeRichContent } from "@/lib/sanitize";

// Inside component
const sanitizedContent = useMemo(
  () => sanitizeRichContent(rawContent),
  [rawContent]
);

// In JSX
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

For **Server Components** (async):
```typescript
import { sanitizeRichContent } from "@/lib/sanitize";

// Before return
const sanitizedContent = sanitizeRichContent(rawContent);

// In JSX
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

---

### Files to Update

#### High Priority - Admin Content
These render admin-created content and should use `sanitizeRichContent`:

3. `/src/components/admin/changelog/changelog-editor.tsx`
   - Editor preview
   - Use: `sanitizeRichContent`

4. `/src/app/[locale]/changelog/page.tsx`
   - Changelog list with summaries
   - Use: `sanitizeRichContent`

5. `/src/components/roadmap/roadmap-item-card.tsx`
   - Roadmap item descriptions
   - Use: `sanitizeRichContent`

6. `/src/components/roadmap/roadmap-editor.tsx`
   - Editor preview
   - Use: `sanitizeRichContent`

#### Medium Priority - Product Pages
These render marketing content (likely admin-controlled):

7. `/src/app/[locale]/product/admin-dashboard/page.tsx`
8. `/src/app/[locale]/product/booking-platform/page.tsx`
9. `/src/app/[locale]/product/payment-processing/page.tsx`
10. `/src/app/[locale]/product/professional-profiles/page.tsx`
11. `/src/app/[locale]/product/reviews-ratings/page.tsx`
12. `/src/app/[locale]/product/secure-messaging/page.tsx`
   - All these files likely have similar patterns
   - Use: `sanitizeRichContent` for admin content
   - Or consider migrating to MDX/markdown instead of HTML

#### Low Priority
13. Other file (check Grep results for exact location)

---

## Quick Update Script

Use this bash command to find all remaining instances:

```bash
grep -r "dangerouslySetInnerHTML" src/ \
  --include="*.tsx" \
  --include="*.ts" \
  -n
```

---

## Testing Checklist

After updating each file:
- [ ] Import sanitization function
- [ ] Sanitize content before rendering
- [ ] Test that HTML formatting is preserved
- [ ] Verify no XSS vulnerabilities
- [ ] Check console for any errors

---

## Alternative: Migrate to MDX

For product pages, consider migrating from HTML to MDX:

1. Install dependencies:
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
```

2. Create MDX files:
```mdx
# Admin Dashboard

Our powerful admin dashboard lets you...

<FeatureCard title="Analytics" />
```

3. Update next.config.ts to handle MDX

This is more secure as MDX is compiled at build time and doesn't use dangerouslySetInnerHTML.

---

## Priority

Focus on completing:
1. Payment validation (CRITICAL)
2. Review verification (CRITICAL)
3. Stripe webhook error handling (CRITICAL)
4. Then return to remaining HTML sanitization files

The 2 most critical files (help articles and changelog detail) are already fixed.
