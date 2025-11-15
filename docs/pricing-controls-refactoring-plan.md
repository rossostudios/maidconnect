# Pricing Controls Refactoring Plan

**Date**: January 14, 2025
**Component**: `/src/components/admin/PricingControls.tsx`
**Current Size**: 838 lines
**Target**: <200 lines main component + modular extracted components
**Estimated Reduction**: ~75% (similar to Analytics Dashboard)

---

## 📋 Current State Analysis

### Component Structure (838 lines)

**Main Orchestrator:**
- `PricingControlsManager` (lines 75-178) - Main component with state management

**Modal & Table Components (Inline):**
- `PricingRuleModal` (lines 189-210) - Create/edit modal wrapper
- `PricingRulesTable` (lines 212-263) - Table wrapper with headers
- `PricingRuleRow` (lines 265-343) - Individual table row

**Custom Hook (Inline):**
- `usePricingRuleForm` (lines 345-415) - Form state management and submit logic

**Form Field Components (All Inline):**
- `ScopeFields` (lines 434-490) - Service category + city selection
- `CommissionFields` (lines 492-548) - Commission rate + background check fee
- `PriceLimitsFields` (lines 550-613) - Min/max price + deposit percentage
- `PolicyFields` (lines 615-692) - Late cancellation policy
- `EffectiveDatesFields` (lines 694-741) - Effective from/until dates
- `NotesField` (lines 743-764) - Optional notes textarea
- `ModalFooter` (lines 766-796) - Cancel/save buttons

**Helper Functions (Inline):**
- `createInitialFormData` (lines 417-432)
- `validatePricingRuleForm` (lines 798-812)
- `buildPricingPayload` (lines 814-830)
- `getModalFooterLabel` (lines 832-837)

### Design Issues

❌ **Not Precision Design Compliant:**
- Beige/cream colors (#ebe5d8, #7d7566, #fbfafa)
- Rounded corners (-2xl borders)
- Red accent (#E85D48) instead of orange (#FF5200)
- No sharp geometric design
- Mixed font styling (not Geist Sans/Mono)
- Background-fill instead of border-only badges

❌ **Code Organization:**
- 838 lines in single file
- Inline components mixed with business logic
- No separation of concerns
- Complex nested forms
- Lint warnings (cognitive complexity, variable shadowing)

---

## 🎯 Refactoring Goals

### Primary Objectives

1. **Extract Form Field Components** - Move all 7 form field components to separate files
2. **Extract Table Components** - Move table and row components to separate files
3. **Extract Custom Hook** - Move usePricingRuleForm to `/src/hooks/`
4. **Extract Helper Functions** - Move validation/payload helpers to utils
5. **Precision Design Migration** - Update all components to Precision design system
6. **Reduce Main Component** - Target: <200 lines orchestrator
7. **Fix Lint Issues** - Resolve cognitive complexity and shadowing warnings

### Design System Alignment

- ✅ Sharp corners (remove all rounded borders)
- ✅ Neutral + Orange palette (neutral-50, neutral-200, orange-500)
- ✅ Geist Sans for labels (uppercase, tracking-wider)
- ✅ Geist Mono for numeric values (tracking-tighter)
- ✅ Border-only badges
- ✅ Consistent spacing and typography

---

## 📦 Proposed File Structure

### New Components (9 new files + 1 refactored)

```
src/
├── hooks/
│   └── usePricingRuleForm.ts                    (NEW - 120 lines)
│       - Form state management
│       - Validation logic
│       - Submit handler
│       - Exported types
│
├── lib/utils/pricing/
│   ├── validation.ts                             (NEW - 40 lines)
│   │   - validatePricingRuleForm()
│   │   - Field-specific validators
│   ├── payload.ts                                (NEW - 30 lines)
│   │   - buildPricingPayload()
│   │   - Data transformation
│   └── initial-data.ts                           (NEW - 30 lines)
│       - createInitialFormData()
│       - Default values
│
├── components/admin/pricing-controls/
│   ├── pricing-controls-manager.tsx              (REFACTORED - <200 lines)
│   │   - Main orchestrator
│   │   - State management
│   │   - Table + Modal integration
│   │
│   ├── pricing-rules-table.tsx                   (NEW - 80 lines)
│   │   - PricisionDataTable wrapper or custom table
│   │   - Column definitions
│   │   - Empty state
│   │
│   ├── pricing-rule-modal.tsx                    (NEW - 100 lines)
│   │   - Modal wrapper
│   │   - Form integration
│   │   - Submit/cancel handlers
│   │
│   ├── form-fields/
│   │   ├── scope-fields.tsx                      (NEW - 60 lines)
│   │   ├── commission-fields.tsx                 (NEW - 60 lines)
│   │   ├── price-limits-fields.tsx               (NEW - 70 lines)
│   │   ├── policy-fields.tsx                     (NEW - 80 lines)
│   │   ├── effective-dates-fields.tsx            (NEW - 60 lines)
│   │   ├── notes-field.tsx                       (NEW - 30 lines)
│   │   └── modal-footer.tsx                      (NEW - 40 lines)
│   │
│   └── info-cards.tsx                            (NEW - 80 lines)
│       - Rule Priority card
│       - Commission Range card
│       - Late Cancel Policy card
│
└── types/
    └── pricing.ts                                 (NEW - 80 lines)
        - PricingRule type
        - PricingRuleFormData type
        - Field update types
        - Export all pricing types
```

---

## 🚀 Implementation Sprints

### Sprint 1: Foundation & Types (2 hours)

**Goal**: Extract types, helper functions, and custom hook

**Tasks:**

1. **Create Types File** (`/src/types/pricing.ts`):
   - Export PricingRule type
   - Export PricingRuleFormData type
   - Export field update helper types
   - Export constants (SERVICE_CATEGORIES, CITIES)

2. **Create Validation Utils** (`/src/lib/utils/pricing/validation.ts`):
   - Extract validatePricingRuleForm()
   - Add field-specific validators
   - Export validation helpers

3. **Create Payload Utils** (`/src/lib/utils/pricing/payload.ts`):
   - Extract buildPricingPayload()
   - Add data transformation logic
   - Export payload builders

4. **Create Initial Data Utils** (`/src/lib/utils/pricing/initial-data.ts`):
   - Extract createInitialFormData()
   - Export default value constants

5. **Create Custom Hook** (`/src/hooks/usePricingRuleForm.ts`):
   - Extract usePricingRuleForm hook
   - Import validation/payload utils
   - Export hook with full type safety

**Deliverables:**
- 5 new files (~300 lines total)
- All helpers extracted from main component
- Full TypeScript coverage

---

### Sprint 2: Form Field Components (3 hours)

**Goal**: Extract all 7 form field components with Precision design

**Tasks:**

1. **Create Form Fields Directory**: `/src/components/admin/pricing-controls/form-fields/`

2. **Extract Field Components** (Precision design compliance):
   - `scope-fields.tsx` - Service category + city dropdowns
   - `commission-fields.tsx` - Commission rate + BG check fee
   - `price-limits-fields.tsx` - Min/max price + deposit %
   - `policy-fields.tsx` - Late cancel hours + fee %
   - `effective-dates-fields.tsx` - Effective from/until
   - `notes-field.tsx` - Optional notes textarea
   - `modal-footer.tsx` - Cancel/Save buttons

**Design Requirements for Each Field Component:**
- Sharp corners (no rounded borders)
- Geist Sans labels (uppercase, tracking-wider, text-xs)
- Geist Mono for numeric input values
- Neutral-200 borders, orange-500 focus states
- Consistent spacing (p-3 inputs, mb-6 field groups)
- Proper ARIA labels and accessibility

**Deliverables:**
- 7 new form field components (~400 lines total)
- Precision design compliance
- Reusable, testable components

---

### Sprint 3: Table & Modal Components (2 hours)

**Goal**: Extract table and modal wrapper components with Precision design

**Tasks:**

1. **Extract Info Cards** (`/src/components/admin/pricing-controls/info-cards.tsx`):
   - Rule Priority card
   - Commission Range card
   - Late Cancel Policy card
   - Precision design: Sharp corners, neutral borders

2. **Extract Pricing Rules Table** (`/src/components/admin/pricing-controls/pricing-rules-table.tsx`):
   - Option A: Use PrecisionDataTable (preferred for consistency)
   - Option B: Custom table with Precision design
   - Column definitions (Scope, Commission, Price Range, Effective, Status, Actions)
   - Empty state with icon
   - Active/inactive toggle
   - Edit action

3. **Extract Pricing Rule Modal** (`/src/components/admin/pricing-controls/pricing-rule-modal.tsx`):
   - Modal wrapper with backdrop
   - Form integration
   - Title (Create/Edit)
   - All form fields composition
   - Modal footer integration

**Design Requirements:**
- Sharp corners throughout
- Neutral-200 borders
- Orange-500 for CTAs and active states
- Geist Sans for table headers
- Geist Mono for numeric values (commission %, prices)
- Border-only status badges (active = green border, inactive = gray border)

**Deliverables:**
- 3 new components (~260 lines total)
- Precision design compliance
- Clean composition pattern

---

### Sprint 4: Main Component Refactoring (1 hour)

**Goal**: Refactor PricingControlsManager into clean orchestrator

**Tasks:**

1. **Refactor Main Component** (`/src/components/admin/pricing-controls/pricing-controls-manager.tsx`):
   - Import all extracted components
   - Remove inline components
   - Keep only orchestration logic:
     - State management (rules, isCreating, editingRule)
     - Toggle active handler
     - Modal open/close handlers
   - Clean composition:
     ```tsx
     <div className="space-y-6">
       {/* Header with create button */}
       <PricingRulesTable rules={rules} onEdit={...} onToggleActive={...} />
       <InfoCards />
       {(isCreating || editingRule) && (
         <PricingRuleModal rule={editingRule} onClose={...} onSave={...} />
       )}
     </div>
     ```

2. **Update Admin Pricing Page** (`/src/app/[locale]/admin/pricing/page.tsx`):
   - Update import path
   - Verify server component integration

3. **Run Build & Lint**:
   - `bun run build` - Verify compilation
   - `bun run check` - Fix any linting issues
   - Resolve cognitive complexity warnings
   - Resolve variable shadowing issues

**Deliverables:**
- Main component: 838→<200 lines (~75% reduction)
- Clean orchestration pattern
- All lint issues resolved
- Build verified

---

## 📊 Expected Impact

### Code Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Main Component** | 838 lines | <200 lines | -75% |
| **Total Files** | 1 | 18 | +17 |
| **Inline Components** | 13 | 0 | -100% |
| **Cognitive Complexity** | ~60 | <15 | -75% |
| **Reusable Components** | 0 | 7 form fields | +7 |

### Design System

| Aspect | Before | After |
|--------|--------|-------|
| **Color Palette** | Beige (#ebe5d8, #7d7566) | Neutral + Orange |
| **Corners** | Rounded (-2xl) | Sharp (no rounding) |
| **Typography** | Mixed | Geist Sans/Mono |
| **Badges** | Background fill | Border-only |
| **Accent Color** | Red (#E85D48) | Orange (#FF5200) |

### Developer Experience

- ✅ **Testability**: Isolated components and hooks
- ✅ **Maintainability**: Single responsibility principle
- ✅ **Reusability**: Form fields can be used in other forms
- ✅ **Type Safety**: Full TypeScript coverage with exported types
- ✅ **Debugging**: Easy to isolate issues to specific files
- ✅ **Scalability**: Ready for new pricing rules/fields

---

## 🧪 Verification Checklist

After each sprint:

- [ ] Build compiles successfully (`bun run build`)
- [ ] Lint checks pass (`bun run check`)
- [ ] Type safety verified (no TS errors)
- [ ] Component imports work correctly
- [ ] Precision design applied consistently
- [ ] Accessibility features maintained

After final sprint:

- [ ] Create pricing rule (new)
- [ ] Edit pricing rule (existing)
- [ ] Toggle rule active/inactive
- [ ] Form validation works
- [ ] Modal open/close animations smooth
- [ ] Table displays correctly
- [ ] Info cards render
- [ ] Responsive design works
- [ ] All form fields submit correctly

---

## 🚨 Known Lint Issues to Fix

From previous build output:

1. **Cognitive Complexity** (line 345, usePricingRuleForm):
   - Current: ~60 complexity
   - Target: <15
   - Solution: Extract validation, payload building, and API calls to separate functions

2. **Variable Shadowing** (line 345, usePricingRuleForm):
   - Parameter `rule` shadows outer `rule`
   - Solution: Rename parameter to `initialRule` or `ruleData`

3. **useBlockStatements** (various):
   - Single-line if statements need braces
   - Solution: Add curly braces to all conditional returns

---

## 📝 Notes

### Considerations

**PrecisionDataTable vs Custom Table:**
- **Option A**: Use PrecisionDataTable wrapper (like Analytics Dashboard)
  - Pros: Consistent with other admin pages, sorting/export built-in
  - Cons: Might be overkill for simple CRUD table
- **Option B**: Custom table with Precision design
  - Pros: Lighter weight, tailored to exact needs
  - Cons: Need to implement sorting, empty states manually

**Recommendation**: Start with Option B (custom table) - pricing rules are simpler than analytics data and don't need export/advanced filtering.

### Future Enhancements

- [ ] Add bulk activate/deactivate rules
- [ ] Add rule duplication
- [ ] Add rule priority drag-and-drop
- [ ] Add rule conflict detection
- [ ] Add rule preview before save
- [ ] Add rule change history/audit log

---

## 🔗 Related Documentation

- **Design System**: [docs/minimal-admin-design-system.md](minimal-admin-design-system.md)
- **Analytics Dashboard Refactoring**: [docs/analytics-dashboard-refactoring-complete.md](analytics-dashboard-refactoring-complete.md)
- **Migration Guide**: [docs/admin-premium-migration-guide.md](admin-premium-migration-guide.md)

---

**Created**: January 14, 2025
**Status**: Ready to implement
**Estimated Time**: 8 hours (4 sprints × 2 hours average)
