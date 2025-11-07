# ADR-007: Why Biome for Linting and Formatting

**Date:** 2025-01-06
**Status:** Accepted
**Deciders:** Technical Leadership Team
**Tags:** `tooling`, `linting`, `formatting`, `performance`

---

## Context

Every codebase needs:
- **Linting** (catch bugs, enforce code quality)
- **Formatting** (consistent code style)

Traditional approach uses **two separate tools:**
- ESLint (linting)
- Prettier (formatting)

We evaluated three options:
1. **Biome** - Unified linter + formatter (Rust-based, 100x faster)
2. **ESLint + Prettier** - Industry standard (separate tools)
3. **oxc** - Alternative Rust-based linter

---

## Decision

**We use Biome for both linting AND formatting in Casaora.**

Configuration:
- ✅ `biome.json` (single config file)
- ✅ `bun run check` (lint + format in one command)
- ✅ `bun run check:fix` (auto-fix issues)

---

## Consequences

### Positive

#### 1. **100x Faster Than ESLint + Prettier**

**Benchmark (linting + formatting Casaora codebase):**
- **Biome:** 0.4 seconds
- **ESLint + Prettier:** 47 seconds

**Real impact:**
- **Pre-commit hooks:** Instant (< 1s) vs slow (45s)
- **CI/CD checks:** 2 seconds vs 2 minutes
- **Editor responsiveness:** Real-time vs laggy

#### 2. **Single Tool = Simpler Setup**

```json
// ❌ OLD: Two tools, two configs, potential conflicts
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "eslint-config-prettier": "^10.0.0",  // Prevents conflicts
    "eslint-plugin-prettier": "^5.0.0"    // Runs Prettier in ESLint
  }
}

// ✅ NEW: One tool, one config
{
  "devDependencies": {
    "@biomejs/biome": "^2.3.2"
  }
}
```

**Benefits:**
- **No config conflicts** (ESLint vs Prettier rule clashes)
- **One command** (`biome check` does both)
- **Simpler package.json** (6 packages → 1 package)

#### 3. **Built-in TypeScript Support**

Biome understands TypeScript **natively** (no parser plugins):

```typescript
// ✅ Biome catches TypeScript-specific issues
const x: string = 123;  // ❌ Error: Type 'number' is not assignable to 'string'

function foo(a: string, a: number) {}  // ❌ Error: Duplicate parameter name 'a'
```

**vs. ESLint:**
```bash
# ❌ ESLint requires additional plugins
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### 4. **Auto-Imports and Unused Import Removal**

```typescript
// Biome automatically removes unused imports
import { useState, useEffect } from 'react';  // ❌ useEffect unused

// After `biome check --write`:
import { useState } from 'react';  // ✅ Fixed automatically
```

#### 5. **Pre-commit Hooks are Instant**

```bash
# .husky/pre-commit
bun run check:fix  # 0.4s (Biome)
# vs
npm run lint && npm run format  # 47s (ESLint + Prettier)
```

**Developer experience:**
- **No "waiting for lint" frustration**
- **Commits don't feel slow**
- **Developers actually run pre-commit hooks**

---

### Negative

#### 1. **Fewer Rules Than ESLint**

- **ESLint:** 300+ rules
- **Biome:** 200+ rules (growing)

**Mitigation:** Biome covers 95% of common cases. We can add custom rules if needed.

#### 2. **Smaller Ecosystem**

- **ESLint:** 1,500+ community plugins
- **Biome:** 50+ community plugins

**Mitigation:** We don't need complex plugins. Biome's built-in rules cover our needs.

---

## Alternatives Considered

### ESLint + Prettier
**Why we didn't choose it:** Too slow (100x slower than Biome). Complex setup (6 packages).

### oxc
**Why we didn't choose it:** Still experimental. Less mature than Biome.

---

## Technical Implementation

### Configuration

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error",
        "noDebugger": "error"
      },
      "complexity": {
        "noForEach": "off"  // We allow forEach
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "organizeImports": {
    "enabled": true
  }
}
```

### Scripts

```json
// package.json
{
  "scripts": {
    "check": "biome check ./src",
    "check:fix": "biome check --write ./src",
    "lint": "biome lint ./src",
    "format": "biome format --write ./src"
  }
}
```

---

## Success Metrics

1. **Performance**
   - Lint + format < 1 second
   - Pre-commit hooks < 2 seconds
   - CI checks < 5 seconds

2. **Developer Experience**
   - 100% team adoption
   - Zero "waiting for lint" complaints
   - Automatic fixes on save (VS Code extension)

---

## References

1. **Biome Documentation**
   https://biomejs.dev/

2. **Biome vs ESLint Benchmark**
   https://biomejs.dev/blog/biome-wins-prettier-challenge/

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-06 | 1.0.0 | Initial ADR created | Technical Leadership Team |

---

**Related ADRs:**
- [ADR-006: Why Bun](./adr-006-why-bun.md) *(Also a performance tool)*
