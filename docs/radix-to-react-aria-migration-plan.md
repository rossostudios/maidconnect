# Radix UI to React Aria Migration Plan

**Project:** Casaora  
**Created:** 2025-11-11  
**Status:** Planning Phase

## Executive Summary

This document outlines a comprehensive, phased migration plan from Radix UI to Adobe React Aria Components. The migration will improve accessibility compliance (WAI-ARIA 1.2), reduce bundle size (~60% reduction per component), and provide better keyboard navigation while maintaining backward compatibility with existing Tailwind CSS styling.

### Current State Analysis

**Radix UI Components in Use:**
- `@radix-ui/react-dialog` - Dialog/Modal system
- `@radix-ui/react-checkbox` - Checkbox inputs
- `@radix-ui/react-radio-group` - Radio button groups
- `@radix-ui/react-avatar` - Avatar with image fallback
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-separator` - Visual dividers
- `@radix-ui/react-collapsible` - Collapsible content (not in ui/ folder)
- `@radix-ui/react-slot` - Composition utility (used in Button)

**Already Migrated to React Aria:**
- ✅ `Select` component (migrated from Radix)
- ✅ `Tabs` component (migrated from Radix)
- ✅ `Accordion` component (custom implementation, no Radix)

**Total Component Files:** 503 TSX files across the project

---

## 1. Architectural Differences

### Radix UI Approach
- **Compound Components Pattern:** Uses dot notation (e.g., `Dialog.Root`, `Dialog.Trigger`)
- **Declarative API:** Wraps DOM elements directly
- **Auto-managed state:** State handled internally
- **Portal-based overlays:** Built-in Portal components

```tsx
// Radix UI Pattern
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### React Aria Approach
- **Hook-based Pattern:** Uses hooks for behavior (e.g., `useDialog`, `useButton`)
- **Imperative API:** Provides props to spread on elements
- **Explicit state management:** Uses React Stately for state
- **Manual overlay management:** Developer controls positioning

```tsx
// React Aria Pattern
function Dialog({ isOpen, onClose, children }) {
  const ref = useRef();
  const { overlayProps } = useOverlay({ isOpen, onClose }, ref);
  const { dialogProps, titleProps } = useDialog({}, ref);
  
  return (
    <div {...overlayProps}>
      <div {...dialogProps} ref={ref}>
        <h2 {...titleProps}>Title</h2>
        {children}
      </div>
    </div>
  );
}
```

### React Aria Components (New Approach)
- **Hybrid Pattern:** Combines hooks with component API
- **Best of both worlds:** Declarative like Radix, powerful like hooks
- **Already in use:** Select and Tabs components use this pattern

```tsx
// React Aria Components Pattern (Recommended)
import { Dialog, DialogTrigger, Modal, ModalOverlay } from 'react-aria-components';

<DialogTrigger>
  <Button>Open</Button>
  <ModalOverlay>
    <Modal>
      <Dialog>
        {({ close }) => (
          <>
            <Heading>Title</Heading>
            <Button onPress={close}>Close</Button>
          </>
        )}
      </Dialog>
    </Modal>
  </ModalOverlay>
</DialogTrigger>
```

---

## 2. Component Mapping Matrix

### High Priority Components

| Radix UI | React Aria Hooks | React Aria Components | Complexity | Usage Count |
|----------|------------------|----------------------|------------|-------------|
| `Dialog` | `useDialog`, `useOverlay`, `useModal` | `Dialog`, `Modal`, `ModalOverlay` | High | ~50+ files |
| `Checkbox` | `useCheckbox` | `Checkbox`, `CheckboxGroup` | Medium | ~30+ files |
| `RadioGroup` | `useRadioGroup`, `useRadio` | `RadioGroup`, `Radio` | Medium | ~20+ files |
| `Label` | N/A (native) | N/A (can use native label) | Low | ~40+ files |
| `Separator` | N/A (native) | `Separator` | Low | ~15+ files |
| `Avatar` | N/A (custom) | N/A (custom implementation) | Medium | ~25+ files |
| `Slot` | N/A | N/A (use render props) | Low | 1 file (Button) |

### Additional Radix Components (Not in UI folder)

| Component | Location | Migration Path |
|-----------|----------|----------------|
| `Collapsible` | Various feature components | `usePress` + custom animation |

### Already Migrated Components

| Component | Migration Date | Notes |
|-----------|---------------|-------|
| `Select` | Before 2025-11-11 | Uses React Aria hooks + custom API |
| `Tabs` | Before 2025-11-11 | Uses React Aria hooks + custom API |
| `Accordion` | N/A | Custom implementation (no Radix) |

---

## 3. Migration Phases

### Phase 1: Foundation & Low-Risk Components (Week 1-2)
**Goal:** Establish migration patterns and migrate simple components

**Components:**
1. ✅ **Separator** → Native `<hr>` or React Aria `Separator`
   - Simple replacement, no state management
   - Update ~15 files
   - Create migration guide for developers

2. ✅ **Label** → Native `<label>` with proper `htmlFor` attributes
   - Replace Radix Label with native HTML
   - Update ~40 files
   - Ensure form associations are preserved

3. ✅ **Slot** (in Button) → Render props pattern
   - Refactor Button's `asChild` prop
   - Create `renderProps` pattern similar to React Aria
   - Test extensively (Button is used everywhere)

**Deliverables:**
- Migration pattern documentation
- Codemods for automated refactoring (if needed)
- Updated component documentation
- Unit tests for migrated components

### Phase 2: Form Components (Week 3-4)
**Goal:** Migrate interactive form components with state

**Components:**
1. ✅ **Checkbox** → React Aria `useCheckbox` hook
   - Migrate to hook pattern first
   - Consider React Aria Components for better DX
   - Update ~30 files
   - Ensure indeterminate state works
   - Test with React Hook Form integration

2. ✅ **RadioGroup** → React Aria `useRadioGroup` + `useRadio`
   - Migrate to hook pattern
   - Update ~20 files
   - Test keyboard navigation (Arrow keys)
   - Verify form submission values

**Deliverables:**
- Updated form components in `src/components/ui/`
- Integration tests with React Hook Form
- Accessibility audit report
- Updated Storybook stories

### Phase 3: Avatar Component (Week 5)
**Goal:** Implement custom Avatar with image loading logic

**Component:**
1. ✅ **Avatar** → Custom implementation with React hooks
   - Use native `<img>` with `onError` fallback
   - Implement image loading states
   - Update ~25 files
   - Ensure lazy loading works
   - Test with various image sizes/formats

**Approach:**
```tsx
// Custom Avatar implementation
function Avatar({ src, alt, fallback }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="avatar">
      {!error && src ? (
        <img 
          src={src} 
          alt={alt}
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="avatar-fallback">{fallback}</div>
      )}
    </div>
  );
}
```

**Deliverables:**
- Custom Avatar component with tests
- Image optimization guide
- Performance benchmarks

### Phase 4: Dialog/Modal System (Week 6-8)
**Goal:** Migrate the most complex and widely-used component

**Component:**
1. ⚠️ **Dialog** → React Aria `Dialog` + `Modal` + `ModalOverlay`
   - **CRITICAL:** Used in ~50+ files across the app
   - Create backward-compatible API wrapper
   - Implement focus management
   - Handle animations (exit animations are challenging)
   - Test on all breakpoints

**Migration Strategy:**
- Create new `Dialog2` component first (parallel implementation)
- Migrate feature by feature to new Dialog2
- Once stable, rename Dialog → DialogLegacy, Dialog2 → Dialog
- Remove DialogLegacy after full migration

**Specific Challenges:**
- **Exit animations:** React Aria Components don't have built-in exit animations like Radix's `data-[state=closed]` attributes
- **Portal management:** Need to handle z-index stacking contexts
- **Nested dialogs:** Ensure nested modals work correctly
- **Mobile responsiveness:** Sheet-style dialogs on mobile

**Approach:**
```tsx
// New Dialog implementation with backward compat API
import { Dialog as AriaDialog, Modal, ModalOverlay } from 'react-aria-components';

function Dialog({ children, ...props }) {
  return (
    <ModalOverlay>
      <Modal>
        <AriaDialog>
          {children}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

// Maintain compound component API
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
```

**Deliverables:**
- New Dialog implementation
- Migration guide for all Dialog usages
- Comprehensive test suite (E2E with Playwright)
- Performance comparison report

### Phase 5: Cleanup & Optimization (Week 9)
**Goal:** Remove Radix dependencies and optimize bundle

**Tasks:**
1. ✅ Remove all Radix UI packages from package.json
2. ✅ Update documentation and guides
3. ✅ Run bundle analysis
4. ✅ Verify tree-shaking works correctly
5. ✅ Update CLAUDE.md with new patterns

**Deliverables:**
- Dependency cleanup PR
- Bundle size comparison report
- Updated developer documentation

---

## 4. Potential Challenges & Solutions

### Challenge 1: Data Attributes & Animations
**Problem:** Radix uses `data-[state=open]` attributes for CSS animations. React Aria doesn't provide these by default.

**Solution:**
```tsx
// Add data attributes manually
function DialogContent({ isOpen, children }) {
  return (
    <div 
      data-state={isOpen ? 'open' : 'closed'}
      className={cn(
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      )}
    >
      {children}
    </div>
  );
}
```

### Challenge 2: Compound Component API
**Problem:** Developers are used to Radix's `Dialog.Trigger` pattern.

**Solution:** Create wrapper components that maintain the API:
```tsx
// Maintain familiar API
const Dialog = Object.assign(
  DialogRoot,
  {
    Trigger: DialogTrigger,
    Content: DialogContent,
    Title: DialogTitle,
  }
);
```

### Challenge 3: Focus Management Differences
**Problem:** Radix and React Aria handle focus trapping differently.

**Solution:**
- Test focus behavior extensively
- Use `useFocusRing` from React Aria for focus styles
- Document focus management behavior changes

### Challenge 4: TypeScript Types
**Problem:** Type definitions differ between libraries.

**Solution:**
- Create type adapters for backward compatibility
- Use generic constraints to maintain type safety
- Update all component prop types

### Challenge 5: Styling with Tailwind
**Problem:** Radix-specific data attributes in Tailwind classes.

**Solution:**
- ✅ **Good news:** Tailwind CSS will work identically
- Update data attribute selectors if needed
- Use `cn()` utility for conditional classes
- Consider creating design tokens for common states

### Challenge 6: Bundle Size During Migration
**Problem:** Both libraries will be in bundle during migration.

**Solution:**
- Use tree-shaking effectively
- Migrate in phases to avoid duplicate code
- Monitor bundle size with `bun run analyze`

### Challenge 7: Testing During Migration
**Problem:** Need to test both old and new implementations.

**Solution:**
- Keep existing tests for Radix components
- Write new tests for React Aria components
- Use feature flags to enable/disable new components
- Run parallel E2E tests

---

## 5. Testing Strategy

### Unit Tests (Vitest)
- Test each migrated component in isolation
- Verify props API maintains backward compatibility
- Test keyboard interactions
- Test focus management

### Accessibility Tests (jest-axe + Playwright)
- Run axe-core on all migrated components
- Test screen reader announcements
- Verify ARIA attributes are correct
- Test keyboard navigation patterns

### Integration Tests (Playwright)
- Test forms with migrated components
- Test dialog flows (open, close, nested)
- Test mobile responsive behavior
- Test with real user interactions

### Visual Regression Tests (Storybook + Chromatic)
- Capture screenshots of all component states
- Compare before/after migration
- Verify animations and transitions

### Performance Tests
- Measure bundle size before/after
- Test rendering performance with React DevTools
- Verify no memory leaks in dialogs

---

## 6. Rollback Considerations

### Rollback Triggers
- Accessibility regressions detected
- Critical bugs in production
- Performance degradation > 20%
- User complaints > 10% increase

### Rollback Plan
1. **Keep Radix packages in package.json** until Phase 5
2. **Use feature flags** for gradual rollout
3. **Maintain old components as `*Legacy`** for quick rollback
4. **Git tags** for each phase completion
5. **Database backups** before major releases

### Quick Rollback Commands
```bash
# Revert to previous stable tag
git revert --strategy=recursive --strategy-option=theirs HEAD

# Reinstall Radix if removed
bun add @radix-ui/react-dialog @radix-ui/react-checkbox # etc

# Rollback deployment
bun run vercel:rollback
```

---

## 7. Migration Checklist Template

For each component migration:

### Pre-Migration
- [ ] Audit all usages with `grep -r "ComponentName" src/`
- [ ] Document current API and behavior
- [ ] Create test plan
- [ ] Review accessibility requirements

### During Migration
- [ ] Create new component implementation
- [ ] Maintain backward-compatible API
- [ ] Add TypeScript types
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update Storybook stories
- [ ] Add accessibility tests

### Post-Migration
- [ ] Update documentation
- [ ] Create migration guide for consumers
- [ ] Deploy to staging
- [ ] Run E2E tests on staging
- [ ] Monitor error logs
- [ ] Collect team feedback
- [ ] Deploy to production

---

## 8. Developer Communication Plan

### Week 1: Kickoff
- [ ] Team meeting to explain migration plan
- [ ] Share this document with all developers
- [ ] Set up #migration-react-aria Slack channel
- [ ] Create migration FAQ

### During Migration
- [ ] Weekly update emails
- [ ] Daily Slack updates on progress
- [ ] Code review guidelines for migration PRs
- [ ] Pair programming sessions for complex components

### Post-Migration
- [ ] Retrospective meeting
- [ ] Update onboarding documentation
- [ ] Create video tutorial on new patterns
- [ ] Blog post about migration experience

---

## 9. Timeline & Milestones

| Phase | Duration | Milestone | Completion Date |
|-------|----------|-----------|----------------|
| Phase 1 | 2 weeks | Simple components migrated | Week of 2025-11-25 |
| Phase 2 | 2 weeks | Form components migrated | Week of 2025-12-09 |
| Phase 3 | 1 week | Avatar migrated | Week of 2025-12-16 |
| Phase 4 | 3 weeks | Dialog system migrated | Week of 2026-01-06 |
| Phase 5 | 1 week | Cleanup & optimization | Week of 2026-01-13 |

**Total Duration:** 9 weeks  
**Target Completion:** January 13, 2026

---

## 10. Success Metrics

### Technical Metrics
- ✅ **Bundle size reduction:** Target 60% per component
- ✅ **Accessibility score:** 100% on Lighthouse
- ✅ **Zero console warnings** in React strict mode
- ✅ **Test coverage:** Maintain 80%+ coverage
- ✅ **Performance:** No rendering regressions

### Business Metrics
- ✅ **Zero production incidents** related to migration
- ✅ **Developer velocity:** No slowdown in feature development
- ✅ **User satisfaction:** No increase in support tickets

### Quality Metrics
- ✅ **Code review feedback:** Positive from 90%+ of team
- ✅ **Documentation quality:** 4.5/5 rating from team
- ✅ **Migration smoothness:** Complete within timeline

---

## 11. Resources & References

### Documentation
- [React Aria Hooks Documentation](https://react-spectrum.adobe.com/react-aria/hooks.html)
- [React Aria Components Documentation](https://react-spectrum.adobe.com/react-aria/react-aria-components.html)
- [Radix UI to React Aria Migration Guide (Argos CI)](https://argos-ci.com/blog/react-aria-migration)
- [React Aria vs Radix UI Comparison (DhiWise)](https://www.dhiwise.com/post/react-aria-vs-radix-ui-what-best-ui-toolkit)

### Examples
- `src/components/ui/select.tsx` - Already migrated Select component
- `src/components/ui/tabs.tsx` - Already migrated Tabs component

### Tools
- [React Aria Components Starter](https://github.com/adobe/react-spectrum/tree/main/packages/react-aria-components)
- [Tailwind CSS Radix Plugin](https://www.tailwindcss-radix.com/) (for reference)

---

## 12. Open Questions

1. **Should we use React Aria Components or pure hooks?**
   - Recommendation: Use React Aria Components (like Select/Tabs)
   - Reason: Better DX, maintains compound component API

2. **How to handle exit animations?**
   - Recommendation: Use Framer Motion `AnimatePresence` for complex animations
   - Alternative: CSS transitions with data attributes

3. **Should we maintain 100% API compatibility?**
   - Recommendation: Yes for Dialog, Checkbox, RadioGroup
   - Reason: Too many usages to refactor

4. **Do we need a feature flag system?**
   - Recommendation: Yes for Dialog migration (high risk)
   - Use environment variable: `FEATURE_NEW_DIALOG=true`

5. **What about mobile-specific components (Sheet, Drawer)?**
   - Recommendation: Build on top of Dialog with responsive styling
   - Use `useMediaQuery` for conditional rendering

---

## 13. Next Steps

### Immediate (This Week)
1. [ ] Review and approve this migration plan
2. [ ] Set up migration tracking board (Linear/GitHub Projects)
3. [ ] Schedule team kickoff meeting
4. [ ] Create feature branch: `feat/migrate-react-aria`

### Week 1
1. [ ] Start Phase 1: Separator migration
2. [ ] Create migration codemod scripts
3. [ ] Set up bundle size monitoring

---

## Appendix A: Code Examples

### Example 1: Dialog Migration

**Before (Radix):**
```tsx
import * as Dialog from "@radix-ui/react-dialog";

function MyModal() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title>My Modal</Dialog.Title>
          <Dialog.Description>Description here</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**After (React Aria Components):**
```tsx
import { DialogTrigger, Modal, Dialog, Heading } from 'react-aria-components';

function MyModal() {
  return (
    <DialogTrigger>
      <Button>Open</Button>
      <Modal>
        <Dialog className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {({ close }) => (
            <>
              <Heading slot="title">My Modal</Heading>
              <p>Description here</p>
              <Button onPress={close}>Close</Button>
            </>
          )}
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
}
```

### Example 2: Checkbox Migration

**Before (Radix):**
```tsx
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

function MyCheckbox() {
  return (
    <Checkbox.Root className="h-4 w-4">
      <Checkbox.Indicator>
        <Check className="h-4 w-4" />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}
```

**After (React Aria):**
```tsx
import { Checkbox } from 'react-aria-components';
import { Check } from "lucide-react";

function MyCheckbox() {
  return (
    <Checkbox className="group">
      <div className="h-4 w-4">
        <Check className="h-4 w-4 hidden group-selected:block" />
      </div>
    </Checkbox>
  );
}
```

---

## Appendix B: Bundle Size Analysis

### Current Bundle Sizes (Estimated)

| Package | Size (minified + gzipped) |
|---------|--------------------------|
| `@radix-ui/react-dialog` | ~15kb |
| `@radix-ui/react-checkbox` | ~5kb |
| `@radix-ui/react-radio-group` | ~6kb |
| `@radix-ui/react-avatar` | ~4kb |
| `@radix-ui/react-label` | ~2kb |
| `@radix-ui/react-separator` | ~2kb |
| `@radix-ui/react-slot` | ~3kb |
| **Total** | **~37kb** |

### Expected Bundle Sizes (After Migration)

| Package | Size (minified + gzipped) |
|---------|--------------------------|
| `react-aria-components` (Dialog) | ~8kb |
| `react-aria-components` (Checkbox) | ~3kb |
| `react-aria-components` (RadioGroup) | ~4kb |
| Custom Avatar | ~1kb |
| Native Label | ~0kb |
| Native Separator | ~0kb |
| Render props pattern | ~0kb |
| **Total** | **~16kb** |

**Savings:** ~21kb (~57% reduction)

---

## Appendix C: Accessibility Checklist

For each migrated component:

- [ ] Keyboard navigation works (Tab, Enter, Space, Arrow keys)
- [ ] Focus management is correct (focus trap in modals)
- [ ] Screen reader announcements are clear
- [ ] ARIA attributes are present and correct
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Disabled states are properly indicated
- [ ] Labels are properly associated with inputs

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-11  
**Next Review:** After Phase 1 completion
