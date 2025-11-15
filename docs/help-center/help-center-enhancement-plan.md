# Help Center Enhancement Plan

## Overview

Enhance the Help Center article editing experience by integrating the existing `BlockEditor` component and migrating to Precision design tokens.

## Current State Analysis

### ArticleForm (`/admin/help-center/article-form.tsx`)
- **456 lines** - Monolithic component with basic Markdown editing
- **Basic textarea editor** - No rich text formatting, just plain Markdown
- **Simple preview** - Uses `marked` library to render Markdown
- **Outdated colors** - Uses `text-red-700`, `dark:text-red-200` instead of Precision tokens
- **Limited UX** - No autosave, word count, or advanced features

### BlockEditor (`/admin/help/block-editor.tsx`)
- **1500 lines** - Sophisticated Notion-style block editor
- **Rich editing** - Headings, lists, code blocks, images, callouts, checkboxes
- **Advanced features** - Drag-and-drop, selection toolbar, slash commands
- **Markdown conversion** - Converts to/from Markdown via `blocksToMarkdown()` and `markdownToBlocks()`
- **Already exists** - Just needs integration!

### Help Center Admin Page (`/admin/help-center/page.tsx`)
- **407 lines** - Table-based article listing
- **Outdated colors** - Uses hex codes like `#116611616`, `#AA88AAAAC`, `#FF4444A22`
- **Needs refactoring** - Should use Precision design tokens

---

## Enhancement Strategy

### Sprint 1: Integrate BlockEditor into ArticleForm ✅
**Goal:** Replace textarea editor with rich BlockEditor, add side-by-side preview, migrate to Precision design.

**Files to Modify:**
1. `/components/admin/help-center/article-form.tsx` - Integrate BlockEditor
2. `/components/admin/help/block-editor.tsx` - Export for reuse if needed

**Changes:**
- Replace `<textarea>` with `<BlockEditor>` component
- Add side-by-side edit/preview layout
- Use BlockEditor's built-in Markdown conversion
- Migrate all color tokens to Precision design:
  - `text-red-700` → `text-orange-600`
  - `border-neutral-200` → Precision neutral borders
  - `bg-white` → Precision backgrounds
- Remove `marked` dependency (BlockEditor handles this)
- Add autosave indicator

**Expected Outcome:**
- Rich Notion-style editing experience
- Live preview with proper formatting
- Precision design compliance
- Better UX with autosave

---

### Sprint 2: Enhance ArticleForm UX
**Goal:** Add advanced features for better content creation experience.

**Enhancements:**
1. **Autosave Indicator** - Show "Saving..." / "Saved" status
2. **Word/Character Count** - Display content metrics
3. **Better Layout** - Improved spacing and organization
4. **Keyboard Shortcuts** - Document shortcuts for users
5. **Image Upload** - Integrate with Supabase storage

**Files to Modify:**
- `/components/admin/help-center/article-form.tsx`
- Create `/components/admin/help-center/article-form-metadata.tsx` (extract meta fields)

---

### Sprint 3: Refactor Help Center Admin Page (Optional)
**Goal:** Migrate admin page to Precision design and reduce complexity.

**Files to Modify:**
1. `/app/[locale]/admin/help-center/page.tsx` - Main page
2. Create `/components/admin/help-center/help-center-stats.tsx` - Stats cards
3. Create `/components/admin/help-center/help-center-filters.tsx` - Filters
4. Create `/components/admin/help-center/help-center-table.tsx` - Articles table

**Changes:**
- Migrate all hex colors to Precision tokens:
  - `#116611616` → `text-neutral-900`
  - `#AA88AAAAC` → `text-neutral-600`
  - `#FF4444A22` → `bg-orange-500`
  - `#EE44EE2E3` → `border-neutral-200`
  - `#FFEEFF8E8` → `bg-white`
- Extract stats cards component
- Extract filters component
- Extract table component
- Reduce main page from 407 → ~150 lines

---

## Design System Migration

### Color Token Mapping

| Old Token | Precision Token | Usage |
|-----------|----------------|--------|
| `text-red-700` | `text-orange-600` | Links, labels |
| `dark:text-red-200` | `dark:text-orange-400` | Dark mode links |
| `#116611616` | `text-neutral-900` | Primary headings |
| `#AA88AAAAC` | `text-neutral-600` | Secondary text |
| `#FF4444A22` | `bg-orange-500` | Primary CTA buttons |
| `#EE44EE2E3` | `border-neutral-200` | Borders |
| `#FFEEFF8E8` | `bg-white` | Card backgrounds |
| `bg-neutral-900` | `bg-orange-500` | Active states |

---

## Implementation Sequence

### Phase 1: Rich Editor Integration (Sprint 1)
1. Read current `ArticleForm.tsx` structure
2. Import `BlockEditor` component
3. Replace textarea with `<BlockEditor>`
4. Update layout for side-by-side editing
5. Migrate all color tokens to Precision design
6. Remove `marked` dependency
7. Test Markdown conversion

### Phase 2: UX Enhancements (Sprint 2)
1. Add autosave indicator
2. Add word/character count
3. Improve meta fields layout
4. Document keyboard shortcuts
5. Add image upload integration

### Phase 3: Admin Page Refactor (Sprint 3 - Optional)
1. Create stats component
2. Create filters component
3. Create table component
4. Migrate main page to Precision design
5. Reduce complexity to <200 lines

---

## Success Metrics

### Before (ArticleForm):
- **456 lines** - Monolithic component
- **Basic textarea** - Plain Markdown editing
- **Simple preview** - Static HTML render
- **Outdated design** - Red/neutral colors
- **No autosave** - Manual save only

### After (ArticleForm):
- **~250-300 lines** - With BlockEditor integration
- **Rich editor** - Notion-style block editing
- **Live preview** - Side-by-side editing
- **Precision design** - Orange/neutral tokens
- **Autosave** - Silent background saves

### Before (Admin Page):
- **407 lines** - Monolithic page
- **Hex colors** - `#116611616` hardcoded
- **Complex structure** - Everything inline

### After (Admin Page):
- **~150 lines** - Modular components
- **Precision tokens** - `text-neutral-900`
- **Clean structure** - Extracted components

---

## Technical Notes

### BlockEditor Features
- **Markdown compatible** - Converts to/from Markdown seamlessly
- **Autosave** - Built-in debounced onChange (500ms)
- **Rich formatting** - Bold, italic, underline, strikethrough, highlight, code
- **Block types** - 10+ block types (paragraph, headings, lists, code, images, callouts, checkboxes)
- **Keyboard shortcuts** - Slash commands, drag-and-drop
- **Selection toolbar** - Floating toolbar for text formatting
- **Bilingual** - Supports `locale` prop for English/Spanish

### Integration Points
```typescript
// ArticleForm integration example
import { BlockEditor } from "@/components/admin/help/block-editor";

<BlockEditor
  initialContent={contentEn}
  onChange={(markdown) => setContentEn(markdown)}
  locale={activeTab}
  placeholder="Start writing your article..."
/>
```

### Preview Mode
- **Side-by-side layout** - Edit on left, preview on right
- **Toggle preview** - Show/hide preview panel
- **Live sync** - Preview updates as you type

---

## Next Steps

1. ✅ Create this plan document
2. ✅ Sprint 1: Integrate BlockEditor into ArticleForm
3. ⏳ Sprint 2: Add UX enhancements (optional)
4. ⏳ Sprint 3: Refactor admin page (optional)

---

**Created:** 2025-01-14
**Updated:** 2025-01-14
**Status:** Sprint 1 Complete → Sprint 2 Optional → Sprint 3 Optional
