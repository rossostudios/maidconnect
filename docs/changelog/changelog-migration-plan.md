# Changelog Migration Plan

## Overview

Migrate Changelog management to Precision design system with enhanced Git-style commit view and rich editing experience.

## Current State Analysis

### 1. Main Changelog Page (`/admin/changelog/page.tsx`)

- **253 lines** - List view with status filter tabs
- **Good Precision foundation** - Already uses neutral colors
- **Needs orange migration** - CTA buttons use `bg-neutral-900` (should be `bg-orange-500`)
- **Rainbow categories** - Uses purple, blue, red, orange, pink (inconsistent)
- **Card-based layout** - Could benefit from Git-style timeline view

### 2. ChangelogEditor Component (`/components/admin/changelog/changelog-editor.tsx`)

- **492 lines** - Similar to old ArticleForm
- **Basic textarea** - No rich text editing, just plain HTML/text
- **Outdated red tokens** - Uses `text-red-700`, `dark:text-red-200`
- **Preview mode** - Toggle between edit/preview (could use BlockEditor)
- **Needs BlockEditor integration** - Same pattern as Help Center Sprint 1

### 3. Content Changelog Page (`/admin/content/changelog/page.tsx`)

- **40 lines** - Embedded Sanity Studio iframe
- **Outdated hex colors** - `#EE44EE2E3`, `#FFEEFF8E8`, `#116611616`, `#AA88AAAAC`
- **Simple structure** - Easy migration to Precision tokens

---

## Enhancement Strategy

### Sprint 1: Integrate BlockEditor into ChangelogEditor ✅

**Goal:** Replace textarea editor with rich BlockEditor, migrate to Precision design (same pattern as Help Center Sprint 1).

**Files to Modify:**
1. `/components/admin/changelog/changelog-editor.tsx` - Integrate BlockEditor

**Changes:**
- Replace `<textarea>` with `<BlockEditor>` component
- Migrate all color tokens to Precision design:
  - Labels: `text-red-700` → `text-orange-600`
  - Content textarea: `text-red-700` → use BlockEditor
  - CTA buttons: `bg-neutral-900` → `bg-orange-500`
  - Category buttons: Keep neutral-900 for selected state
- Remove preview mode logic (BlockEditor handles this)
- Update content guide to show editor shortcuts
- Add autosave indicator

**Expected Outcome:**
- Rich Notion-style editing experience
- Live preview with proper formatting
- Precision design compliance
- Reduced component size (remove preview logic)

---

### Sprint 2: Migrate Main Changelog Page to Precision + Git-style View

**Goal:** Migrate CTA buttons to orange, enhance layout with Git-style timeline view.

**Files to Modify:**
1. `/app/[locale]/admin/changelog/page.tsx` - Main list page

**Changes:**
- **CTA Buttons Migration:**
  - "New Changelog": `bg-neutral-900` → `bg-orange-500 hover:bg-orange-600`
  - "Edit" button: `bg-neutral-900` → `bg-orange-500 hover:bg-orange-600`
  - Active tab: `bg-neutral-900` → `bg-orange-500`
  - Inactive tab hover: `hover:border-neutral-300` → `hover:border-orange-500 hover:text-orange-600`

- **Git-style Timeline Enhancements (Optional):**
  - Add commit-style timeline view with connecting lines
  - Show sprint badges as commit hashes
  - Display category icons inline with titles
  - Add diff-style status indicators (+ for new, ~ for updated)

**Expected Outcome:**
- Consistent orange accent for all CTAs
- Clean, professional Git-inspired timeline
- Better visual hierarchy

---

### Sprint 3: Migrate Content Changelog Page (Simple)

**Goal:** Replace hex colors with Precision tokens.

**Files to Modify:**
1. `/app/[locale]/admin/content/changelog/page.tsx` - Sanity Studio embed page

**Changes:**
- Header card: `#FFEEFF8E8` → `bg-white`, `#EE44EE2E3` → `border-neutral-200`
- Title: `#116611616` → `text-neutral-900`
- Description: `#AA88AAAAC` → `text-neutral-600`
- Studio iframe border: `#EE44EE2E3` → `border-neutral-200`

**Expected Outcome:**
- Precision design compliance
- Consistent with other admin pages

---

## Design System Migration

### Color Token Mapping

| Element | Before | After |
|---------|--------|-------|
| **ChangelogEditor Labels** | `text-red-700`, `dark:text-red-200` | `text-orange-600`, `dark:text-orange-400` |
| **ChangelogEditor Textarea** | `text-red-700`, `dark:text-red-200` | BlockEditor component |
| **ChangelogEditor Publish Button** | `bg-neutral-900`, `dark:bg-neutral-100` | `bg-orange-500`, `dark:bg-orange-600` |
| **Main Page New Button** | `bg-neutral-900` | `bg-orange-500`, `hover:bg-orange-600` |
| **Main Page Edit Button** | `bg-neutral-900` | `bg-orange-500`, `hover:bg-orange-600` |
| **Main Page Active Tab** | `bg-neutral-900` | `bg-orange-500` |
| **Content Page Header BG** | `#FFEEFF8E8` | `bg-white` |
| **Content Page Header Border** | `#EE44EE2E3` | `border-neutral-200` |
| **Content Page Title** | `#116611616` | `text-neutral-900` |
| **Content Page Description** | `#AA88AAAAC` | `text-neutral-600` |

---

## Implementation Sequence

### Phase 1: ChangelogEditor (Sprint 1)

1. Read current `ChangelogEditor` structure
2. Import `BlockEditor` component
3. Replace textarea with `<BlockEditor>`
4. Migrate all color tokens to Precision design
5. Remove preview mode logic
6. Update editor guide
7. Test and verify

**Similar to Help Center Sprint 1** - Same pattern, same benefits.

---

### Phase 2: Main Page (Sprint 2)

1. Read current main page structure
2. Migrate CTA button colors to orange
3. Migrate tab active states to orange
4. (Optional) Add Git-style timeline enhancements
5. Test responsive design
6. Verify accessibility

---

### Phase 3: Content Page (Sprint 3)

1. Read current content page
2. Replace all hex colors with Precision tokens
3. Test Sanity Studio embed still works
4. Verify dark mode compatibility

---

## Success Metrics

### Before (ChangelogEditor):
- **492 lines** - Monolithic component
- **Basic textarea** - Plain HTML/text editing
- **Preview mode** - Toggle between edit/preview
- **Outdated design** - Red/neutral colors

### After (ChangelogEditor):
- **~400 lines** - BlockEditor integration
- **Rich editor** - Notion-style block editing
- **Live editing** - BlockEditor handles preview
- **Precision design** - Orange/neutral tokens
- **Autosave** - Silent background saves

### Before (Main Page):
- **Neutral CTAs** - `bg-neutral-900` buttons
- **Inconsistent** - Mixed color usage

### After (Main Page):
- **Orange CTAs** - `bg-orange-500` for all actions
- **Consistent** - Precision design throughout

### Before (Content Page):
- **Hex colors** - `#FFEEFF8E8`, `#EE44EE2E3`, etc.

### After (Content Page):
- **Precision tokens** - `bg-white`, `border-neutral-200`

---

## Next Steps

1. ✅ Create this migration plan
2. ⏳ Sprint 1: Integrate BlockEditor into ChangelogEditor
3. ⏳ Sprint 2: Migrate main page to Precision design
4. ⏳ Sprint 3: Migrate content page to Precision design

---

**Created:** 2025-01-14
**Status:** Planning Complete → Ready for Sprint 1
