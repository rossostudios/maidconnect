# Radix UI → React Aria Migration Summary

Quick reference guide for the migration from Radix UI to React Aria Components.

## Quick Stats

- **Components to Migrate:** 7 Radix components
- **Already Migrated:** 2 components (Select, Tabs)
- **Timeline:** 9 weeks (Nov 2025 - Jan 2026)
- **Bundle Size Savings:** ~21kb (~57% reduction)
- **Files Impacted:** ~180+ files across the codebase

## Component Quick Reference

| Current (Radix) | Migrate To | Complexity | Files | Phase |
|-----------------|------------|------------|-------|-------|
| `@radix-ui/react-separator` | Native `<hr>` or React Aria | Low | ~15 | Phase 1 |
| `@radix-ui/react-label` | Native `<label>` | Low | ~40 | Phase 1 |
| `@radix-ui/react-slot` | Render props | Low | 1 | Phase 1 |
| `@radix-ui/react-checkbox` | React Aria Checkbox | Medium | ~30 | Phase 2 |
| `@radix-ui/react-radio-group` | React Aria RadioGroup | Medium | ~20 | Phase 2 |
| `@radix-ui/react-avatar` | Custom implementation | Medium | ~25 | Phase 3 |
| `@radix-ui/react-dialog` | React Aria Dialog/Modal | High | ~50+ | Phase 4 |

## Migration Phases

### Phase 1: Foundation (Weeks 1-2)
- Separator, Label, Slot
- Establish patterns
- Low risk

### Phase 2: Forms (Weeks 3-4)
- Checkbox, RadioGroup
- Test with React Hook Form
- Medium risk

### Phase 3: Avatar (Week 5)
- Custom implementation
- Image loading logic
- Low-medium risk

### Phase 4: Dialog (Weeks 6-8)
- Most complex component
- Used in 50+ files
- High risk - needs careful testing

### Phase 5: Cleanup (Week 9)
- Remove Radix packages
- Bundle optimization
- Documentation updates

## Key Architectural Changes

### Before (Radix)
```tsx
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Title</Dialog.Title>
  </Dialog.Content>
</Dialog.Root>
```

### After (React Aria Components)
```tsx
<DialogTrigger>
  <Button>Open</Button>
  <Modal>
    <Dialog>
      <Heading>Title</Heading>
    </Dialog>
  </Modal>
</DialogTrigger>
```

## Critical Challenges

1. **Exit Animations:** React Aria doesn't provide `data-[state=closed]` - need custom solution
2. **Compound API:** Maintain `Dialog.Trigger` pattern for backward compat
3. **Focus Management:** Different focus trap implementation
4. **Bundle Size During Migration:** Both libraries in bundle temporarily
5. **Testing:** Need parallel tests for old/new implementations

## Benefits of Migration

✅ **Accessibility:** WAI-ARIA 1.2 compliance  
✅ **Bundle Size:** 57% smaller (~21kb savings)  
✅ **Keyboard Nav:** Better Arrow key support  
✅ **Type Safety:** Improved TypeScript types  
✅ **Flexibility:** More customization options  

## Rollback Plan

- Keep Radix packages until Phase 5
- Use feature flags for gradual rollout
- Maintain `*Legacy` components
- Git tags for each phase
- Quick rollback: `bun run vercel:rollback`

## Resources

- **Full Plan:** `docs/radix-to-react-aria-migration-plan.md`
- **React Aria Docs:** https://react-spectrum.adobe.com/react-aria/
- **Existing Examples:** 
  - `src/components/ui/select.tsx` (already migrated)
  - `src/components/ui/tabs.tsx` (already migrated)

## Next Steps

1. ✅ Review migration plan
2. ✅ Schedule team kickoff
3. ✅ Create tracking board
4. ✅ Start Phase 1 (Separator migration)

---

**Last Updated:** 2025-11-11  
**Status:** Planning Phase
