# Radix UI → React Aria Migration Audit Report

**Date:** 2025-11-11
**Phase:** Phase 1 - Preparation & Analysis
**Status:** Complete

---

## Executive Summary

This audit analyzed Radix UI usage across the MaidConnect codebase to plan migration to React Aria. The migration will reduce bundle size by ~4.7MB (unminified) or ~30-40KB (minified/gzipped), improve accessibility scores, and modernize the component architecture.

**Key Findings:**
- 10 Radix UI packages installed
- 10 component wrappers in `src/components/ui/`
- 3 high-priority components requiring migration (Select, Tabs, Dialog)
- All Radix usage is isolated to shadcn/ui pattern, simplifying migration
- React Aria packages successfully installed

---

## 1. Radix UI Component Inventory

### 1.1 Installed Packages (10 total)

```json
{
  "@radix-ui/react-avatar": "1.1.11",
  "@radix-ui/react-checkbox": "1.3.3",
  "@radix-ui/react-collapsible": "1.1.12",
  "@radix-ui/react-dialog": "1.1.15",
  "@radix-ui/react-label": "2.1.8",
  "@radix-ui/react-radio-group": "1.3.8",
  "@radix-ui/react-select": "2.2.6",
  "@radix-ui/react-separator": "1.1.8",
  "@radix-ui/react-slot": "1.2.4",
  "@radix-ui/react-tabs": "1.1.13"
}
```

### 1.2 Component Wrappers

All Radix components are wrapped in shadcn/ui pattern at [src/components/ui/](../src/components/ui/):

| Component | File | Lines of Code | Complexity |
|-----------|------|---------------|------------|
| Avatar | [avatar.tsx](../src/components/ui/avatar.tsx) | ~40 | Low |
| Button (Slot) | [button.tsx](../src/components/ui/button.tsx) | ~60 | Low |
| Checkbox | [checkbox.tsx](../src/components/ui/checkbox.tsx) | ~30 | Low |
| Dialog | [dialog.tsx](../src/components/ui/dialog.tsx) | 117 | High |
| Label | [label.tsx](../src/components/ui/label.tsx) | ~20 | Low |
| Radio Group | [radio-group.tsx](../src/components/ui/radio-group.tsx) | ~50 | Low |
| Select | [select.tsx](../src/components/ui/select.tsx) | 195 | High |
| Separator | [separator.tsx](../src/components/ui/separator.tsx) | ~20 | Low |
| Tabs | [tabs.tsx](../src/components/ui/tabs.tsx) | 74 | Medium |

---

## 2. Usage Analysis

### 2.1 Component Usage Frequency

| Component | Import Count | Priority | Migration Effort |
|-----------|--------------|----------|------------------|
| **Select** | 8 | 🔴 High | High (complex API) |
| **Tabs** | 7 | 🔴 High | Medium (simpler API) |
| **Button** (Slot) | 7 | 🟡 Medium | Low (simple slot pattern) |
| **Dialog** | 1 | 🔴 High | High (critical modals) |
| **Separator** | 2 | 🟢 Low | Low (simple divider) |
| **Label** | 2 | 🟢 Low | Low (simple text) |
| **Avatar** | 1 | 🟢 Low | Low (image display) |
| **Checkbox** | 0* | 🟢 Low | Low (form input) |
| **Radio Group** | 0* | 🟢 Low | Low (form input) |
| **Collapsible** | 0* | 🟢 Low | Low (accordion-like) |

*Defined but not directly imported (used within forms)

### 2.2 Select Component Usage (8 files)

**Locations:**
1. [background-check-dashboard.tsx](../src/components/admin/background-check-dashboard.tsx) - Status filters
2. [background-check-provider-settings.tsx](../src/components/admin/background-check-provider-settings.tsx) - Provider selection
3. [interview-calendar.tsx](../src/components/admin/interview-calendar.tsx) - Time slot selection
4. [professional-vetting-dashboard.tsx](../src/components/admin/professional-vetting-dashboard.tsx) - Queue filters
5. [form-fields.tsx](../src/components/auth/form-fields.tsx) - Country/city selection
6. [booking-pipeline.tsx](../src/components/dashboard/booking-pipeline.tsx) - Pipeline filters
7. [executive-dashboard.tsx](../src/components/dashboard/executive-dashboard.tsx) - Dashboard filters
8. [hero-search-bar.tsx](../src/components/ui/hero-search-bar.tsx) - Service search

**Pattern:** All Select components use the same compound API:
```tsx
<Select value={value} onValueChange={onChange}>
  <SelectTrigger>
    <SelectValue placeholder="..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="...">...</SelectItem>
  </SelectContent>
</Select>
```

### 2.3 Tabs Component Usage (7 files)

**Locations:**
1. [admin-settings-tabs.tsx](../src/components/admin/admin-settings-tabs.tsx)
2. [background-check-dashboard.tsx](../src/components/admin/background-check-dashboard.tsx)
3. [help/article-form.tsx](../src/components/admin/help/article-form.tsx)
4. [interview-calendar.tsx](../src/components/admin/interview-calendar.tsx)
5. [professional-vetting-dashboard.tsx](../src/components/admin/professional-vetting-dashboard.tsx)
6. [booking-pipeline.tsx](../src/components/dashboard/booking-pipeline.tsx)
7. [executive-dashboard.tsx](../src/components/dashboard/executive-dashboard.tsx)

**Pattern:** Standard tab navigation for dashboards and admin panels

### 2.4 Dialog Component Usage (1 file)

**Location:**
- [base-modal.tsx](../src/components/shared/base-modal.tsx) - Wrapper for all modals

**Critical:** This single component is used throughout the app for modals. Migration impact is high but centralized.

---

## 3. Bundle Size Metrics

### 3.1 Package Size Comparison

| Metric | Radix UI | React Aria + Stately | Savings |
|--------|----------|---------------------|---------|
| **Total package size** | 5.8 MB | 712 KB (668 + 44) | **5.1 MB (88%)** |
| **Dist folder size** | 4,780 KB | 64 KB | **4,716 KB (99%)** |
| **Estimated bundle impact** | ~50 KB* | ~20 KB* | **~30 KB (60%)** |

*After tree-shaking and minification/gzip

### 3.2 Build Metrics (Baseline)

```
Build completed: 2025-11-11
Build tool: Next.js 16.0.1 (Turbopack)
Total routes: 217
Build time: 17.8s
Static generation time: 836.4ms
.next directory size: 325 MB
```

**Largest chunks:**
- Main chunk: 3.9 MB
- Secondary chunks: 989 KB, 986 KB, 762 KB

### 3.3 React Aria Packages Installed

```json
{
  "react-aria": "3.44.0",
  "react-stately": "3.42.0",
  "@react-aria/utils": "3.31.0",
  "@react-types/shared": "3.32.1"
}
```

---

## 4. Migration Strategy

### 4.1 Priority Order (Recommended)

**Phase 2A - High Priority (Week 1):**
1. **Select** → React Aria `useSelect` + `useListBox`
   - 8 usages across dashboards and forms
   - Most complex API, highest bundle impact
   - Estimated: 3-4 hours

2. **Tabs** → React Aria `useTabs`
   - 7 usages across admin and dashboard pages
   - Simpler API, moderate impact
   - Estimated: 2-3 hours

**Phase 2B - Critical Infrastructure (Week 1):**
3. **Dialog** → React Aria `useDialog` + `useModal`
   - 1 usage but powers all modals via base-modal
   - Critical component, requires careful testing
   - Estimated: 2-3 hours

**Phase 2C - Low Priority (Week 2):**
4. **Button (Slot)** → React Aria `useButton`
   - 7 usages, simple migration
   - Estimated: 1 hour

5. **Separator, Label, Avatar** → CSS/Tailwind alternatives
   - Minimal logic, can use simple HTML + styles
   - Estimated: 30 mins each

6. **Checkbox, Radio, Collapsible** → React Aria equivalents
   - Low usage, migrate as needed
   - Estimated: 1 hour each

### 4.2 Migration Approach

**Pattern for each component:**

1. **Create new React Aria wrapper** in `src/components/ui/`
2. **Maintain same exported API** (minimize breaking changes)
3. **Update one usage at a time** (incremental migration)
4. **Test in Storybook** before production deployment
5. **Remove Radix package** only after all usages migrated

**Example - Select migration:**
```tsx
// Before (Radix)
import * as SelectPrimitive from "@radix-ui/react-select";

// After (React Aria)
import { useSelect, useListBox } from "react-aria";
import { useSelectState } from "react-stately";

// Export same API
export { Select, SelectTrigger, SelectContent, SelectItem };
```

---

## 5. Risk Assessment

### 5.1 Migration Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Breaking API changes** | 🟡 Medium | Maintain same export API, update internals only |
| **Accessibility regressions** | 🔴 High | Run Lighthouse audits before/after, test with screen readers |
| **Bundle size increase** | 🟢 Low | React Aria is smaller, verify with bundle analyzer |
| **Runtime errors** | 🟡 Medium | Test each component in Storybook, E2E tests with Playwright |
| **User experience changes** | 🟡 Medium | Match visual styling exactly, test keyboard navigation |

### 5.2 Testing Strategy

**Pre-migration:**
- ✅ Baseline bundle size established (325 MB build)
- ✅ Component inventory complete
- ✅ Usage patterns documented

**During migration:**
- [ ] Storybook stories for each migrated component
- [ ] Visual regression testing (Percy/Chromatic)
- [ ] Keyboard navigation testing
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] E2E tests for critical flows (booking, auth)

**Post-migration:**
- [ ] Bundle size analysis (target: 30-40KB reduction)
- [ ] Lighthouse accessibility audit (target: +15% score)
- [ ] Performance metrics (LCP, FID, CLS)

---

## 6. Timeline Estimate

**Phase 1 - Preparation (Complete):** 2-3 hours ✅
- Component audit ✅
- Package installation ✅
- Baseline metrics ✅

**Phase 2 - Core Migration:** 8-10 hours
- Select migration: 3-4 hours
- Tabs migration: 2-3 hours
- Dialog migration: 2-3 hours

**Phase 3 - Secondary Components:** 3-4 hours
- Button, Separator, Label: 2 hours
- Checkbox, Radio, Avatar: 1-2 hours

**Phase 4 - Testing & Validation:** 3-4 hours
- Storybook stories: 2 hours
- E2E testing: 1-2 hours

**Phase 5 - Cleanup:** 1-2 hours
- Remove Radix packages
- Update documentation
- Bundle analysis

**Total:** 17-23 hours

---

## 7. Next Steps

### Immediate (Phase 2 Start)

1. **Create Select migration branch**
   ```bash
   git checkout -b feat/migrate-select-to-react-aria
   ```

2. **Create new Select component** using React Aria
   - File: `src/components/ui/select-aria.tsx`
   - Use `useSelect` + `useListBox` hooks
   - Match existing Tailwind styles

3. **Create Storybook story**
   - Test all Select variants
   - Document keyboard shortcuts
   - Add accessibility notes

4. **Migrate first usage** (lowest risk)
   - Recommended: [form-fields.tsx](../src/components/auth/form-fields.tsx:33)
   - Simple country/city selection
   - Low traffic page

5. **Run tests**
   - Visual regression
   - Accessibility audit
   - Bundle size comparison

### Follow-up (Phase 2B-C)

- Repeat process for Tabs component
- Migrate Dialog (base-modal)
- Handle edge cases
- Update documentation

---

## 8. Resources

**React Aria Documentation:**
- [Select](https://react-spectrum.adobe.com/react-aria/useSelect.html)
- [Tabs](https://react-spectrum.adobe.com/react-aria/useTabs.html)
- [Dialog](https://react-spectrum.adobe.com/react-aria/useDialog.html)

**Migration Guides:**
- [Radix to React Aria comparison](https://react-spectrum.adobe.com/react-aria/forms.html)
- [Tailwind CSS integration](https://react-spectrum.adobe.com/react-aria/styling.html)

**Testing:**
- [Accessibility testing](https://react-spectrum.adobe.com/react-aria/accessibility.html)
- [Keyboard interactions](https://react-spectrum.adobe.com/react-aria/interactions.html)

---

## Appendix A: File Paths Reference

**Components using Select:**
1. [src/components/admin/background-check-dashboard.tsx](../src/components/admin/background-check-dashboard.tsx)
2. [src/components/admin/background-check-provider-settings.tsx](../src/components/admin/background-check-provider-settings.tsx)
3. [src/components/admin/interview-calendar.tsx](../src/components/admin/interview-calendar.tsx)
4. [src/components/admin/professional-vetting-dashboard.tsx](../src/components/admin/professional-vetting-dashboard.tsx)
5. [src/components/auth/form-fields.tsx](../src/components/auth/form-fields.tsx)
6. [src/components/dashboard/booking-pipeline.tsx](../src/components/dashboard/booking-pipeline.tsx)
7. [src/components/dashboard/executive-dashboard.tsx](../src/components/dashboard/executive-dashboard.tsx)
8. [src/components/ui/hero-search-bar.tsx](../src/components/ui/hero-search-bar.tsx)

**Components using Tabs:**
1. [src/components/admin/admin-settings-tabs.tsx](../src/components/admin/admin-settings-tabs.tsx)
2. [src/components/admin/background-check-dashboard.tsx](../src/components/admin/background-check-dashboard.tsx)
3. [src/components/admin/help/article-form.tsx](../src/components/admin/help/article-form.tsx)
4. [src/components/admin/interview-calendar.tsx](../src/components/admin/interview-calendar.tsx)
5. [src/components/admin/professional-vetting-dashboard.tsx](../src/components/admin/professional-vetting-dashboard.tsx)
6. [src/components/dashboard/booking-pipeline.tsx](../src/components/dashboard/booking-pipeline.tsx)
7. [src/components/dashboard/executive-dashboard.tsx](../src/components/dashboard/executive-dashboard.tsx)

**Components using Dialog:**
1. [src/components/shared/base-modal.tsx](../src/components/shared/base-modal.tsx)

---

**Generated:** 2025-11-11
**Author:** Claude Code
**Version:** 1.0
