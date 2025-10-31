# React 19 Memoization Guide

## Overview

React 19 includes a new **React Compiler** that automatically memoizes components and values, eliminating the need for most manual `useMemo`, `useCallback`, and `React.memo` usage. This guide explains when to keep vs. remove memoization in the MaidConnect codebase.

## Key Changes in React 19

### What the React Compiler Does Automatically:
- ✅ Memoizes component render outputs
- ✅ Prevents unnecessary re-renders
- ✅ Optimizes prop comparisons
- ✅ Memoizes simple calculations and transformations

### What You Still Need to Do Manually:
- ⚠️ Expensive computations (complex algorithms, heavy array operations)
- ⚠️ Date/time parsing and formatting
- ⚠️ Event handlers needing referential equality for dependency arrays
- ⚠️ External API calls or side effects coordination

## Audit Results: 74 Memoization Instances

Found across 21 files in the codebase.

## Decision Framework

### ✅ KEEP useMemo For:

1. **Expensive Calculations**
   - Multiple array transformations (map + filter + reduce)
   - Complex sorting algorithms
   - Heavy data processing

2. **Date/Time Operations**
   - `date-fns` parsing and formatting
   - Date range calculations
   - Calendar computations

3. **External Dependencies**
   - Computed values used in useEffect dependencies
   - Values passed to external libraries that require referential equality

4. **Performance-Critical Paths**
   - Large dataset transformations (>100 items)
   - Chart data processing
   - Real-time data calculations

### ❌ REMOVE useMemo For:

1. **Simple Calculations**
   - Single array map/filter
   - Basic arithmetic
   - String concatenation

2. **Primitive Values**
   - Numbers, strings, booleans
   - Simple object destructuring

3. **JSX Elements**
   - Component render output
   - Conditional rendering logic

4. **One-Time Operations**
   - Values that don't change during component lifecycle

### ✅ KEEP useCallback For:

1. **Dependency Array Requirements**
   - Callbacks used in useEffect dependencies
   - Callbacks passed to custom hooks

2. **Referential Equality Needs**
   - Functions passed to memoized child components
   - Event handlers used in event listener registration

3. **Performance-Critical Callbacks**
   - Debounced/throttled functions
   - Functions called in tight loops

### ❌ REMOVE useCallback For:

1. **Simple Event Handlers**
   - onClick, onChange, onSubmit handlers
   - Basic form handlers without dependencies

2. **One-Off Functions**
   - Functions only used once in render
   - Inline arrow functions in JSX

## File-by-File Analysis

### 🟢 KEEP AS-IS (Good Use Cases)

#### 1. `src/components/finances/finances-overview.tsx` (5 instances)
**Status**: ✅ Keep all
- **Why**: Complex date-fns operations, multiple array transformations, chart data processing
- **Examples**:
  - `earningsData`: Multiple date operations + array transformations
  - `serviceData`: Map operations with sorting and slicing
  - `formatCurrency`: Intl.NumberFormat is expensive to recreate

#### 2. `src/components/professionals/professional-availability-calendar.tsx` (4 instances)
**Status**: ✅ Keep all
- **Why**: Date parsing, calendar computations, performance-critical rendering
- **Examples**:
  - Date range calculations with `date-fns`
  - Availability slot transformations
  - Calendar grid computations

#### 3. `src/components/portfolio/image-upload-dropzone.tsx` (7 instances)
**Status**: ✅ Keep all
- **Why**: File upload callbacks, drag-and-drop event handlers requiring referential equality
- **Examples**:
  - `onDrop`, `onDragEnter`, `onDragLeave` callbacks
  - Image validation logic
  - File processing functions

#### 4. `src/components/payments/payment-authorization-card.tsx` (5 instances)
**Status**: ✅ Keep all
- **Why**: Payment processing callbacks, external API coordination
- **Examples**:
  - Stripe payment intent handlers
  - Authorization callbacks
  - Error handling functions

#### 5. `src/components/bookings/pro-booking-calendar.tsx` (3 instances)
**Status**: ✅ Keep all
- **Why**: Calendar computations, date-fns operations
- **Examples**:
  - Booking slot calculations
  - Date range filtering
  - Availability checking

#### 6. `src/hooks/use-keyboard-shortcuts.ts` (10 instances)
**Status**: ✅ Keep all
- **Why**: Event listeners require referential equality, keyboard event coordination
- **Examples**:
  - Keyboard event handlers registered with addEventListener
  - Shortcut action callbacks
  - Router navigation functions

### 🟡 REVIEW & OPTIMIZE (Potential Removals)

#### 7. `src/hooks/use-push-notifications.ts` (5 instances)
**Status**: 🟡 Review 3/5 for removal
- **Keep**:
  - Notification permission request callback (external API)
  - Service worker registration callback (external API)
- **Consider Removing**:
  - Simple state update callbacks
  - Basic permission checking functions
  - One-off utility functions

#### 8. `src/hooks/use-feature-flag.ts` (4 instances)
**Status**: 🟡 Review 2/4 for removal
- **Keep**:
  - Feature flag fetch callback (external API)
  - Cache invalidation logic
- **Consider Removing**:
  - Simple boolean transformations
  - Feature flag lookup (simple object access)

#### 9. `src/hooks/use-latest-changelog.ts` (4 instances)
**Status**: 🟡 Review 2/4 for removal
- **Keep**:
  - Changelog fetch callback (useEffect dependency)
  - Mark as viewed callback (API call)
- **Consider Removing**:
  - Simple state setters
  - Boolean flag transformations

#### 10. `src/components/messaging/messaging-interface.tsx` (3 instances)
**Status**: 🟡 Review 1/3 for removal
- **Keep**:
  - Send message callback (API call)
  - Real-time subscription handler
- **Consider Removing**:
  - Simple message filtering (single filter operation)

#### 11. `src/components/command-palette/command-palette.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: Navigation callbacks used in useEffect, need referential equality
- **Examples**:
  - Router.push navigation callback
  - Modal close handler

#### 12. `src/components/professionals/professionals-directory.tsx` (4 instances)
**Status**: 🟡 Review 2/4 for removal
- **Keep**:
  - Complex filter + sort operations on professionals list
  - Search debouncing logic
- **Consider Removing**:
  - Simple filter callbacks (single condition)
  - Basic string comparison functions

### 🟢 KEEP (UI Components)

#### 13. `src/components/ui/date-picker.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: Date-fns operations, external library integration

#### 14. `src/components/ui/time-picker.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: Time parsing, external library integration

#### 15. `src/components/documents/documents-table.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: TanStack Table requires stable references

#### 16. `src/components/payments/payment-history-table.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: TanStack Table requires stable references

### 🟡 REVIEW (Admin/Forms)

#### 17. `src/components/admin/changelog/changelog-editor.tsx` (2 instances)
**Status**: 🟡 Review 1/2 for removal
- **Keep**: Save changelog callback (API call)
- **Consider Removing**: Simple form state updates

#### 18. `src/app/[locale]/dashboard/pro/onboarding/document-upload-form.tsx` (2 instances)
**Status**: 🟡 Review 1/2 for removal
- **Keep**: Document upload callback (API call)
- **Consider Removing**: Simple validation functions

### 🟢 KEEP (Complex Components)

#### 19. `src/components/bookings/pro-financial-summary.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: Financial calculations, multiple array operations

#### 20. `src/components/providers/supabase-provider.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: Supabase client creation is expensive

#### 21. `src/components/availability/blocked-dates-calendar.tsx` (2 instances)
**Status**: ✅ Keep both
- **Why**: Date-fns operations, calendar computations

## Summary Statistics

- **Total Instances**: 74 across 21 files
- **Keep As-Is**: ~55 instances (74%)
- **Potential Removals**: ~19 instances (26%)
- **Main Keep Reasons**:
  - Date/time operations: ~18 instances
  - Complex data transformations: ~15 instances
  - External API coordination: ~12 instances
  - Event handler referential equality: ~10 instances

## Best Practices Going Forward

### When Writing New Code:

1. **Default**: Don't use useMemo/useCallback
   - Let React 19 compiler handle optimization

2. **Add Memoization Only When**:
   - Performance profiling shows it's needed
   - Working with date-fns or heavy libraries
   - Multiple array operations (map + filter + reduce)
   - External library requires referential equality

3. **Use React DevTools Profiler**:
   - Measure before optimizing
   - Verify memoization actually helps
   - Don't premature optimize

### Code Review Checklist:

- [ ] Does this calculation involve date-fns? → Keep useMemo
- [ ] Multiple array transformations (>2)? → Keep useMemo
- [ ] Simple array map/filter? → Remove useMemo
- [ ] Event handler for onClick/onChange? → Remove useCallback
- [ ] Function used in useEffect deps? → Keep useCallback
- [ ] External library integration? → Keep memoization

## Migration Plan

### Phase 1: Quick Wins (Estimate: 1-2 hours)
Remove obvious unnecessary memoization:
- Simple event handlers
- Single array operations
- Primitive value transformations

### Phase 2: Careful Review (Estimate: 2-3 hours)
Review and test each removal:
- Hook optimizations
- Form handlers
- State update callbacks

### Phase 3: Performance Testing (Estimate: 1 hour)
After removals, verify:
- No performance regressions
- Web Vitals remain stable
- User interactions feel smooth

## React 19 Compiler Notes

The React Compiler is currently in **beta** but stable enough for production use. It:

- Works automatically, no configuration needed
- Is backward compatible with React 18 code
- Doesn't break existing memoization
- Optimizes more aggressively than manual memoization

## References

- [React 19 Compiler Docs](https://react.dev/learn/react-compiler)
- [useMemo Best Practices](https://react.dev/reference/react/useMemo)
- [useCallback Best Practices](https://react.dev/reference/react/useCallback)
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

---

**Last Updated**: October 31, 2025
**Next Review**: After React 19 stable release
