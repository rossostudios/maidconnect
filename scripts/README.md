# Scripts Documentation

This directory contains utility scripts for the Casaora project.

## Precision Design System Scripts

### `check-precision-compliance.sh`

**Purpose:** Enforces Precision Design System compliance by detecting common violations.

**Usage:**
```bash
# Run directly
bash scripts/check-precision-compliance.sh

# Or use npm script
bun run check:precision

# Run all checks (Biome + Precision)
bun run check:all
```

**What it checks:**

1. **Custom Hex Colors** - Detects `#RRGGBB` patterns (should use Tailwind tokens)
   ```tsx
   // ❌ WRONG
   <div className="bg-[#FF5200]">

   // ✅ CORRECT
   <div className="bg-orange-500">
   ```

2. **Rounded Corners** - Detects `rounded-md`, `rounded-lg`, `rounded-xl`, etc. (Precision uses sharp edges)
   ```tsx
   // ❌ WRONG
   <div className="rounded-lg">

   // ✅ CORRECT
   <div className=""> {/* No border radius */}
   ```

3. **Old Font References** - Detects Satoshi/Manrope (should use Geist Sans/Mono only)
   ```tsx
   // ❌ WRONG
   <h1 style={{ fontFamily: "var(--font-satoshi)" }}>

   // ✅ CORRECT
   <h1 className="font-[family-name:var(--font-geist-sans)]">
   ```

4. **Gray Colors** - Detects `gray-*` Tailwind classes (should use `neutral-*` palette)
   ```tsx
   // ❌ WRONG
   <div className="bg-gray-100 text-gray-700">

   // ✅ CORRECT
   <div className="bg-neutral-100 text-neutral-700">
   ```

5. **Invalid Spacing** - Detects spacing outside 8px scale (e.g., `p-5`, `gap-7`)
   ```tsx
   // ❌ WRONG
   <div className="p-5 gap-7">

   // ✅ CORRECT
   <div className="p-6 gap-8">
   ```

6. **Inline Border Radius** - Detects `borderRadius:` in CSS-in-JS style objects
   ```tsx
   // ❌ WRONG
   <div style={{ borderRadius: "8px" }}>

   // ✅ CORRECT
   <div className=""> {/* Use Tailwind classes, no border radius */}
   ```

**Exit Codes:**
- `0` - All checks passed (no violations found)
- `1` - Violations found (see console output)

**Integration:**
This script runs automatically in CI/CD pipelines and can be added to pre-commit hooks for local enforcement.

**Related Documentation:**
- [Precision Design System Reference](../docs/precision-design-system-reference.md)
- [Marketing Pages Checklist](../docs/precision-checklist-marketing.md)
- [Dashboard Pages Checklist](../docs/precision-checklist-dashboard.md)
- [Admin Pages Checklist](../docs/precision-checklist-admin.md)
- [Error Pages Checklist](../docs/precision-checklist-error.md)

---

## Other Scripts

### `should-deploy.sh`

**Purpose:** Determines if a deployment should be skipped based on commit message.

**Usage:**
```bash
bash scripts/should-deploy.sh
```

**Skips deployment for:**
- Commits with `[skip deploy]` in the message
- Commits prefixed with `chore:` or `docs:`

### `remove-roundness.sh`

**Purpose:** Bulk removal of rounded corners from components.

**Usage:**
```bash
bash scripts/remove-roundness.sh <directory>
```

### `replace-colors.sh` / `replace-slate-colors.sh`

**Purpose:** Bulk color replacement for migrating to Precision palette.

**Usage:**
```bash
bash scripts/replace-colors.sh <directory>
bash scripts/replace-slate-colors.sh <directory>
```

### `setup-posthog-funnel.ts`

**Purpose:** Sets up PostHog funnels for analytics tracking.

**Usage:**
```bash
bun run setup-posthog-funnel.ts
```

---

## Development Workflow

### Pre-commit Checks

Before committing code, run:

```bash
# Run Biome linting and formatting
bun run check:fix

# Run Precision compliance checks
bun run check:precision

# Or run both together
bun run check:all
```

### CI/CD Integration

The `check:all` command runs in CI/CD to enforce both code quality (Biome) and design system compliance (Precision).

**GitHub Actions example:**
```yaml
- name: Run compliance checks
  run: bun run check:all
```

### Fixing Violations

When violations are found:

1. **Review the output** - The script shows file paths and line numbers
2. **Consult checklists** - See `docs/precision-checklist-*.md` for patterns
3. **Fix manually** - Replace violations with compliant patterns
4. **Re-run checks** - Verify fixes with `bun run check:precision`

**Example fix workflow:**
```bash
# Find violations
bun run check:precision

# Output shows:
# src/components/ui/card.tsx:12: className="rounded-lg p-5"

# Fix the file
# Before: className="rounded-lg p-5 bg-gray-100"
# After:  className="p-6 bg-neutral-100"

# Verify fix
bun run check:precision
# ✅ All Precision Design System checks passed!
```

---

## Contributing

When adding new components or pages:

1. **Follow Precision patterns** - See design system reference
2. **Run compliance checks** - Use `bun run check:precision`
3. **Fix violations** - Before creating PR
4. **Document patterns** - Update checklists if needed

---

## Troubleshooting

### False Positives

If the script flags code that is intentionally non-compliant (e.g., third-party components):

1. **Add exceptions** - Edit `check-precision-compliance.sh` to exclude specific files
2. **Use inline comments** - Document why the exception is needed

**Example:**
```tsx
// Precision exception: Third-party Stripe component requires rounded corners
<StripePaymentElement className="rounded-lg" />
```

### Performance

The script uses `grep` for fast pattern matching. For large codebases:

- **Limit scope** - Edit `DIRS_TO_CHECK` in the script
- **Parallel execution** - Run checks in separate terminals
- **Cache results** - Store output for incremental checks

---

## Additional Resources

- [Precision Design System Reference](../docs/precision-design-system-reference.md)
- [Biome Documentation](https://biomejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Geist Font Documentation](https://vercel.com/font)
