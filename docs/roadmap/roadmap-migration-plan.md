# Roadmap Migration Plan 🗺️

**Created:** 2025-01-14
**Status:** 📋 Planning
**Complexity:** Low (CTA + active state migrations only)
**Estimated Duration:** Single sprint

---

## Overview

Migrate Roadmap management section to Precision design system by replacing neutral-900 CTAs and active states with orange-500/600 accent colors.

### Key Insights

- **No hex colors detected** - All components already use Tailwind tokens ✅
- **Simpler than Feedback** - Only CTA and active state migrations needed
- **Similar to Feedback Sprint 1** - Pattern: `bg-neutral-900` → `bg-orange-500`
- **Single sprint migration** - No need for 2 sprints (no hex color cleanup needed)

---

## Files Analysis

### 1. `/app/[locale]/admin/roadmap/page.tsx` (56 lines)

**Current State:**
- ✅ Already uses Precision neutral palette
- ❌ CTA button uses `bg-neutral-900` (needs orange migration)
- ℹ️ Loading spinner uses `border-neutral-900` (optional change)

**Changes Needed:**
```typescript
// Line 35: "New Roadmap Item" button
// BEFORE: bg-neutral-900 px-6 py-3 font-medium text-white transition hover:bg-neutral-800
// AFTER:  bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600
```

**Edit Count:** 1 edit

---

### 2. `/components/roadmap/roadmap-admin-list.tsx` (236 lines)

**Current State:**
- ✅ Status badges use semantic colors (green, amber, neutral) via config objects
- ✅ Category badges use neutral-100 (appropriate for informational badges)
- ❌ Filter tabs active state uses `border-neutral-900 text-neutral-900` (needs orange)
- ❌ Empty state "Create Roadmap Item" button uses `bg-neutral-900` (needs orange)
- ℹ️ Loading spinner uses `border-neutral-900` (optional change)
- ℹ️ Icon button hover states use `hover:bg-neutral-50` (appropriate)

**Changes Needed:**

```typescript
// Lines 109-113: Filter tabs active state
// BEFORE:
activeFilter === filter
  ? "border-neutral-900 text-neutral-900"
  : "border-transparent text-neutral-600 hover:text-neutral-900"

// AFTER:
activeFilter === filter
  ? "border-orange-500 text-orange-600"
  : "border-transparent text-neutral-600 hover:border-orange-500 hover:text-orange-600"

// Line 139: Empty state "Create Roadmap Item" button
// BEFORE: bg-neutral-900 px-6 py-3 font-medium text-white transition-all hover:bg-neutral-800
// AFTER:  bg-orange-500 px-6 py-3 font-medium text-white transition-all hover:bg-orange-600
```

**Edit Count:** 2 edits

---

## Migration Strategy

### Single Sprint Approach ✅

**Why single sprint?**
- No hex colors to migrate (unlike Feedback Sprint 2)
- Only 3 CTA/active state elements to migrate
- Simple, straightforward pattern matching

**Sprint Breakdown:**
1. **Edit 1:** Page.tsx - "New Roadmap Item" button (line 35)
2. **Edit 2:** RoadmapAdminList.tsx - Filter tabs active state (lines 111-112)
3. **Edit 3:** RoadmapAdminList.tsx - Empty state button (line 139)

**Optional Edit:**
4. Loading spinners (page.tsx line 47, roadmap-admin-list.tsx line 129) - Could change `border-neutral-900` → `border-orange-500` for brand consistency, but neutral is acceptable for loading states.

---

## Color Token Mapping

| Element | Current | Target | Rationale |
|---------|---------|--------|-----------|
| **CTA Buttons** | `bg-neutral-900` | `bg-orange-500` | Primary actions use orange accent |
| **CTA Hover** | `hover:bg-neutral-800` | `hover:bg-orange-600` | Darker orange for interaction |
| **Tab Active Border** | `border-neutral-900` | `border-orange-500` | Orange indicates active/selected state |
| **Tab Active Text** | `text-neutral-900` | `text-orange-600` | WCAG AA compliant orange for text |
| **Tab Inactive Hover Text** | `hover:text-neutral-900` | `hover:text-orange-600` | Orange hover for actionable elements |
| **Tab Inactive Hover Border** | (none) | `hover:border-orange-500` | Add border hover for better feedback |

---

## Elements to Preserve (Already Precision Compliant)

✅ **Status Badges** (lines 84-87):
- Draft: `bg-neutral-100 text-neutral-700 border-neutral-200` (neutral = draft/unfinished)
- Published: `bg-green-100 text-green-700 border-green-200` (green = live/active)
- Archived: `bg-amber-100 text-amber-700 border-amber-200` (amber = archived/warning)

✅ **Category Badge** (line 175):
- Uses `bg-neutral-100 text-neutral-600` (neutral = informational, non-actionable)

✅ **Count Badges** (line 119):
- Uses `bg-neutral-100` (neutral = informational count indicator)

✅ **Icon Button Hovers** (lines 201, 211, 219):
- Preview/Edit: `hover:bg-neutral-50` (subtle hover for secondary actions)
- Archive: `hover:bg-red-50` (red = destructive action)

✅ **Status Config Colors** (lines 166-169):
- Uses `ROADMAP_STATUS_CONFIG` with semantic colors (kept as-is)

---

## Verification Steps

### After Sprint Completion

1. **Check for neutral-900 CTAs:**
   ```bash
   grep -n "bg-neutral-900" src/app/[locale]/admin/roadmap/page.tsx
   grep -n "bg-neutral-900" src/components/roadmap/roadmap-admin-list.tsx
   # Expected: No matches ✅
   ```

2. **Check for neutral-900 active states:**
   ```bash
   grep -n "border-neutral-900\|text-neutral-900" src/components/roadmap/roadmap-admin-list.tsx
   # Expected: No matches in filter tabs context ✅
   ```

3. **Biome check:**
   ```bash
   bunx biome check src/app/[locale]/admin/roadmap/page.tsx
   bunx biome check src/components/roadmap/roadmap-admin-list.tsx
   # Expected: No fixes applied ✅
   ```

4. **Visual testing checklist:**
   - [ ] "New Roadmap Item" button (page header) uses orange-500
   - [ ] "New Roadmap Item" button hover uses orange-600
   - [ ] Active filter tab uses orange-500 border and orange-600 text
   - [ ] Inactive filter tabs hover shows orange-500 border and orange-600 text
   - [ ] Empty state "Create Roadmap Item" button uses orange-500
   - [ ] Status badges retain semantic colors (draft=neutral, published=green, archived=amber)
   - [ ] Category badge retains neutral-100 background
   - [ ] Icon button hovers work correctly (neutral-50 for edit/preview, red-50 for archive)

---

## Success Criteria

- ✅ All CTAs use orange-500/600 accent colors
- ✅ Active states use orange-500/600
- ✅ Semantic badges preserved (status, category)
- ✅ No neutral-900 CTAs remaining (verified with grep)
- ✅ Biome check passes with no errors
- ✅ Visual consistency with Feedback and Changelog pages

---

## Metrics

### Before Migration
- **Files:** 2 (page.tsx + roadmap-admin-list.tsx)
- **Total Lines:** 292 (56 + 236)
- **Neutral CTAs:** 3 buttons (1 page header, 1 empty state, 1 filter tabs)
- **Design Compliance:** Mixed (neutral + semantic colors)

### Expected After Migration
- **Files:** 2 (no change)
- **Total Lines:** 292 (pure token replacement)
- **Orange CTAs:** 3 buttons
- **Edits Made:** 3-4 edits
- **Design Compliance:** 100% Precision (orange accent + semantic badges)

---

## Comparison with Previous Migrations

| Migration | Files | Sprints | Lines Changed | Primary Focus | Complexity |
|-----------|-------|---------|---------------|---------------|------------|
| **Changelog** | 3 | 3 | -22 (785 → 763) | BlockEditor + CTA + hex | Medium |
| **Feedback** | 2 | 2 | 0 (482 → 482) | CTA + hex colors | Medium |
| **Roadmap** | 2 | 1 | 0 (292 → 292) | CTA + active states | Low |

**Key Insight:** Roadmap is the simplest migration yet - no hex colors, no BlockEditor, just straightforward CTA migrations.

---

## Git Commit Strategy

**Single Commit** (after sprint completion):

```
feat(roadmap): migrate to Precision design with orange accent

Migrated all CTA buttons and active states from neutral-900 to
orange-500/600, achieving Precision design system compliance.

- 3 edits total (292 lines, no change)
- "New Roadmap Item" buttons to orange (page + empty state)
- Filter tabs active state to orange
- Semantic badges preserved (status, category)
- Zero neutral-900 CTAs remaining (grep verified)
- Clean Biome check (no errors)
```

---

## Timeline

**Estimated Duration:** Single session
- ⏱️ **Sprint Execution:** ~15 minutes (3-4 edits)
- ⏱️ **Verification:** ~5 minutes (grep + Biome)
- ⏱️ **Documentation:** ~10 minutes (completion doc)
- ⏱️ **Git Commit:** ~2 minutes

**Total:** ~30 minutes

---

## Next Steps

1. ✅ **Planning complete** (this document)
2. ⏳ **Execute sprint** (3-4 edits)
3. ⏳ **Verify changes** (grep + Biome)
4. ⏳ **Create completion doc** (sprint summary)
5. ⏳ **Git commit** (detailed message)

---

**Migration Pattern:** Following proven Feedback Sprint 1 approach
**Design System:** 100% Precision compliance target
**Quality Assurance:** Grep verification + Biome checks
**Documentation:** Comprehensive before/after examples
