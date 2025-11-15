# Feedback Migration to Precision Design - Migration Plan

**Created:** 2025-01-14
**Status:** Ready to Execute
**Pattern:** Following Changelog migration approach (2-sprint model)

---

## Overview

Migrate the entire Feedback section to Precision design system, focusing on:
1. **Sprint 1:** Main page CTA migration (neutral-900 → orange-500)
2. **Sprint 2:** Detail page hex color migration (hardcoded hex → Precision tokens)

**Goal:** 100% Precision compliance across all Feedback pages with clean git history

---

## Files to Migrate

### 1. Main Feedback Page
**Path:** `/app/[locale]/admin/feedback/page.tsx`
**Lines:** 248
**Complexity:** Low (simple CTA color replacements)
**Sprint:** Sprint 1

**Current Issues:**
- ❌ 5 status filter tabs use `bg-neutral-900` (All, New, In Review, Resolved)
- ❌ 1 "View" button uses `bg-neutral-900`
- ❌ Tab hover states use `hover:text-neutral-900`
- ✅ Red tokens intentional (bug/spam/critical priority) - keep as-is

**Pattern:** Identical to Changelog Sprint 2 (CTA migration)

---

### 2. Feedback Detail Page
**Path:** `/app/[locale]/admin/feedback/[id]/page.tsx`
**Lines:** 234
**Complexity:** Medium (systematic hex color replacement)
**Sprint:** Sprint 2

**Current Issues:**
- ❌ Many hardcoded hex colors in typeConfig, statusBadge, priorityBadge
- ❌ Hex colors: `#FF4444A22`, `#FFEEFF8E8`, `#EE44EE2E3`, `#AA88AAAAC`, `#116611616`
- ❌ Card backgrounds, borders, text colors all use hex values

**Pattern:** Identical to Changelog Sprint 3 (hex color migration)

---

## Sprint 1: Main Page CTA Migration

### Scope
Migrate all CTAs (buttons and status tabs) from neutral-900 to orange-500 on the main feedback list page.

### Changes Required

#### 1. Status Filter Tabs (Lines 116-156)
**Current Pattern (4 tabs):**
```typescript
className={`px-4 py-2 font-medium text-sm transition ${
  status === "value"
    ? "bg-neutral-900 text-white"
    : "border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
}`}
```

**Target Pattern:**
```typescript
className={`px-4 py-2 font-medium text-sm transition ${
  status === "value"
    ? "bg-orange-500 text-white"
    : "border border-neutral-200 text-neutral-600 hover:border-orange-500 hover:text-orange-600"
}`}
```

**Affected Tabs:**
1. Line 117-125: "All" tab
2. Line 127-135: "New" tab
3. Line 137-145: "In Review" tab
4. Line 147-155: "Resolved" tab

#### 2. "View" Button (Line 233-238)
**Before:**
```typescript
className="flex items-center gap-2 bg-neutral-900 px-4 py-2 font-medium text-sm text-white transition hover:bg-neutral-800"
```

**After:**
```typescript
className="flex items-center gap-2 bg-orange-500 px-4 py-2 font-medium text-sm text-white transition hover:bg-orange-600"
```

### Edits Summary
- **5 edits total** - 4 status tabs + 1 View button
- **0 lines added/removed** - Pure color token replacement
- **Pattern:** Identical to Changelog Sprint 2

### Verification
```bash
# Check for remaining neutral-900 CTAs
grep -n "bg-neutral-900" src/app/[locale]/admin/feedback/page.tsx
# Expected: No matches found (except intentional admin notes, if any)

# Biome check
bunx biome check src/app/[locale]/admin/feedback/page.tsx
# Expected: No new errors
```

---

## Sprint 2: Detail Page Hex Color Migration

### Scope
Replace all hardcoded hex colors with Precision design tokens in the feedback detail page.

### Hex Colors to Replace

#### Color Mapping Table

| Hex Color | Precision Token | Usage |
|-----------|-----------------|-------|
| `#FF4444A22` | `orange-600` or appropriate semantic color | Links, accents |
| `#FFEEFF8E8` | `bg-white` | Card backgrounds |
| `#EE44EE2E3` | `border-neutral-200` | Soft borders |
| `#AA88AAAAC` | `text-neutral-600` | Secondary/muted text |
| `#116611616` | `text-neutral-900` | Primary text/headings |

### Areas to Migrate

#### 1. typeConfig (Lines 18-49)
Replace hex colors in type badges with semantic Tailwind classes.

#### 2. statusBadge (Lines 51-57)
Replace hex colors in status badges with semantic Tailwind classes.

#### 3. priorityBadge (Lines 59-64)
Replace hex colors in priority badges with semantic Tailwind classes.

#### 4. Metadata Cards (Lines 118-154)
- User Information card background/border
- Submission Time card background/border
- Text colors for labels and values

#### 5. Message Section (Lines 157-160)
- Card background/border
- Heading and text colors

#### 6. Technical Context Section (Lines 163-215)
- Card background/border
- Icon and heading colors
- Label and value text colors

#### 7. Admin Notes Section (Lines 218-223, if present)
- Card background/border
- Heading and text colors

### Edits Summary
- **10-15 edits estimated** - Systematic hex color replacement
- **0 lines added/removed** - Pure color token replacement
- **Pattern:** Identical to Changelog Sprint 3

### Verification
```bash
# Check for hex colors
grep -n "#[0-9A-Fa-f]" src/app/[locale]/admin/feedback/[id]/page.tsx
# Expected: No matches found

# Biome check
bunx biome check src/app/[locale]/admin/feedback/[id]/page.tsx
# Expected: No new errors
```

---

## Git Commit Strategy

### Sprint 1 Commit
```
feat(feedback): migrate main page CTAs to Precision orange - Sprint 1

Migrated all call-to-action buttons and status filter tabs on the main
feedback management page from neutral-900 to orange-500.

- 5 edits total (248 lines, no change)
- 4 status filter tabs to orange
- "View" button to orange
- Tab hover states to orange
- Red tokens preserved (bug/spam/critical)
```

### Sprint 2 Commit
```
feat(feedback): migrate detail page to Precision tokens - Sprint 2

Replaced all hardcoded hex colors with Precision design tokens in the
feedback detail page.

- 10-15 edits total (234 lines, no change)
- typeConfig, statusBadge, priorityBadge migrated
- All card backgrounds/borders migrated
- All text colors migrated
- Zero hex colors remaining
```

### Summary Doc Commit
```
docs(feedback): add comprehensive migration summary

Documented complete 2-sprint Feedback migration with before/after
examples, metrics, and verification steps.
```

---

## Comparison with Changelog Migration

| Metric | Changelog | Feedback (Estimated) |
|--------|-----------|---------------------|
| **Files** | 3 | 2 |
| **Sprints** | 3 | 2 |
| **Total Lines** | 785 | 482 (248 + 234) |
| **Sprint 1** | BlockEditor integration (complex) | CTA migration (simple) |
| **Sprint 2** | CTA migration (simple) | Hex color migration (medium) |
| **Sprint 3** | Hex color migration (simple) | N/A |
| **Pattern** | Multi-sprint incremental | Multi-sprint incremental |

**Key Difference:** Feedback doesn't need BlockEditor integration (no rich text editing), so it's simpler - just 2 sprints instead of 3.

---

## Timeline

1. **Sprint 1:** Main page CTA migration (~30 minutes)
   - Read main page
   - Make 5 edits (tabs + button)
   - Verify with grep
   - Run Biome check
   - Create Sprint 1 completion doc
   - Commit Sprint 1

2. **Sprint 2:** Detail page hex color migration (~45 minutes)
   - Read detail page
   - Make 10-15 edits (systematic hex replacement)
   - Verify with grep (zero hex colors)
   - Run Biome check
   - Create Sprint 2 completion doc
   - Commit Sprint 2

3. **Summary Documentation:** (~15 minutes)
   - Create comprehensive summary doc
   - Commit summary
   - Update todo list

**Total Estimated Time:** ~90 minutes

---

## Benefits

### 1. Design System Compliance
- 100% Precision tokens across all Feedback pages
- Consistent orange accent for actionable elements
- WCAG AA compliant color combinations
- Dark mode support with proper color tints

### 2. Code Quality
- Zero hardcoded hex colors
- Clean, maintainable color system
- Matching other admin pages (Changelog, Users, Disputes)
- Proper semantic color usage

### 3. User Experience
- Clear visual hierarchy (orange = actionable)
- Consistent interaction patterns
- Accessible color combinations
- Professional, cohesive design

---

## Next Steps After Feedback

**Recommended:** Migrate Roadmap section next

**Files to Migrate:**
1. `/app/[locale]/admin/roadmap/page.tsx` - Main roadmap list
2. Other roadmap-related pages (if any)

**Expected Pattern:** Similar to Feedback (CTA + hex color migration)

---

**Plan Status:** ✅ Ready to Execute
**Next Action:** Execute Sprint 1 (Main Page CTA Migration)
**Documentation:** Complete migration plan created
