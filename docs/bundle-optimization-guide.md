# Bundle Size Optimization Guide

This guide provides actionable strategies to reduce the initial bundle size of Casaora.

## Quick Wins (Immediate Impact)

### 1. Optimize Package Imports ✅ DONE

Added more packages to `optimizePackageImports` in `next.config.ts`:
- `@hugeicons/react`
- `@radix-ui/*` components
- `react-aria` and `react-stately`
- `@tanstack/react-table`
- `motion` (Framer Motion)

**Expected savings:** 20-30% reduction in bundle size for routes using these components.

### 2. Dynamic Imports for Heavy Components

Lazy load components that aren't immediately visible on page load.

**Before:**
```tsx
import { AdminAnalyticsDashboard } from '@/components/admin/enhanced-analytics-dashboard';
```

**After:**
```tsx
import dynamic from 'next/dynamic';

const AdminAnalyticsDashboard = dynamic(
  () => import('@/components/admin/enhanced-analytics-dashboard'),
  {
    loading: () => <div>Loading analytics...</div>,
    ssr: false // Only if component doesn't need SSR
  }
);
```

**Target components for dynamic import:**
- Admin dashboard components
- Charts and data visualization (Recharts)
- Modals and dialogs
- Map components (Leaflet)
- Rich text editors
- File upload components

**Expected savings:** 100-200 KB per dynamically loaded component.

### 3. Reduce Icon Imports

**Current approach (heavy):**
```tsx
import { Calendar, User, Settings, Home } from '@hugeicons/react';
```

**Optimized approach:**
```tsx
// Only import what you need, package optimizer will tree-shake
import { Calendar } from '@hugeicons/react';
```

Even better - create a central icon export file:
```tsx
// src/components/icons/index.ts
export { Calendar, User, Settings, Home } from '@hugeicons/react';

// In components:
import { Calendar } from '@/components/icons';
```

**Expected savings:** 50-100 KB by eliminating unused icon imports.

## Medium Effort (Significant Impact)

### 4. Optimize Date Library

`date-fns` is already optimized, but ensure you're using modular imports:

**Before:**
```tsx
import { format, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
```

**After (tree-shakeable):**
```tsx
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import addDays from 'date-fns/addDays';
import es from 'date-fns/locale/es';
```

**Expected savings:** 15-25 KB.

### 5. Code Splitting by Route

Use Next.js App Router's automatic code splitting + manual optimization:

**Split admin routes:**
```tsx
// app/[locale]/admin/layout.tsx
import dynamic from 'next/dynamic';

const AdminSidebar = dynamic(() => import('@/components/admin/sidebar'));
const AdminHeader = dynamic(() => import('@/components/admin/header'));
```

**Split dashboard features:**
- Analytics: Load only when user navigates to analytics tab
- Bookings table: Load only on bookings page
- Professional verification: Load only for admin users

**Expected savings:** 150-300 KB reduction in initial bundle.

### 6. Optimize Third-Party Scripts

Move third-party scripts to use Next.js `<Script>` component with `strategy="lazyOnload"`:

```tsx
import Script from 'next/script';

<Script
  src="https://js.stripe.com/v3/"
  strategy="lazyOnload"
/>
```

**Target scripts:**
- Stripe
- Analytics
- Better Stack logging (if loaded client-side)

**Expected savings:** 50-100 KB deferred from initial load.

### 7. Optimize Sanity Client

Sanity client can be heavy. Use minimal client for public pages:

**Before:**
```tsx
import { createClient } from '@sanity/client';
```

**After:**
```tsx
// For public pages - minimal client
import { createClient } from '@sanity/client/stega';

// Or use server-only imports
import 'server-only';
import { createClient } from '@sanity/client';
```

**Expected savings:** 30-50 KB on client bundles.

## Advanced Optimizations (Long-term)

### 8. Replace Heavy Dependencies

Consider lighter alternatives for:

| Current Package | Size | Alternative | Size | Savings |
|----------------|------|-------------|------|---------|
| `recharts` | ~400 KB | `chart.js` + `react-chartjs-2` | ~150 KB | 250 KB |
| `leaflet` + `react-leaflet` | ~150 KB | `mapbox-gl` (CDN) or `pigeon-maps` | 0-50 KB | 100+ KB |
| `dompurify` | ~45 KB | Sanitize on server only | 0 KB | 45 KB |
| `marked` | ~50 KB | Built-in `unified` + `remark` | ~30 KB | 20 KB |

**Note:** Evaluate alternatives based on feature requirements.

### 9. Implement Route-Based Splitting

Configure webpack to split routes more aggressively:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            },
            // Admin chunks
            admin: {
              name: 'admin',
              test: /src\/components\/admin/,
              chunks: 'all',
              priority: 30
            },
            // UI library chunks
            ui: {
              name: 'ui',
              test: /src\/components\/ui/,
              chunks: 'all',
              priority: 25
            }
          }
        }
      };
    }
    return config;
  }
};
```

**Expected savings:** Better caching, 20-40% reduction in route-specific bundles.

### 10. Optimize CSS

Tailwind CSS is already optimized, but ensure:

```ts
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Precise paths only
  ],
  // Remove unused utilities
  safelist: [], // Only add if dynamic classes are used
  // Enable JIT mode optimizations
  mode: 'jit'
};
```

**Expected savings:** 5-10 KB by removing unused utilities.

### 11. Image Optimization

Your image config is already good, but add:

```ts
// next.config.ts
images: {
  // ... existing config
  unoptimized: false, // Ensure optimization is on
  dangerouslyAllowSVG: false, // Security + performance
  contentDispositionType: 'attachment',
  // Lazy load images by default
  loading: 'lazy',
}
```

### 12. Implement Preloading Strategy

Preload critical resources:

```tsx
// app/layout.tsx
import Link from 'next/link';

<head>
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preconnect" href="https://hvnetxfsrtplextvtwfx.supabase.co" />
  <link rel="dns-prefetch" href="https://js.stripe.com" />
</head>
```

## Measurement & Monitoring

### Analyze Bundle Regularly

```bash
# Run bundle analyzer
ANALYZE=true bun run build

# Check initial load size
bun run build && ls -lh .next/static/chunks/*.js | sort -k5 -h
```

### Set Bundle Size Budgets

Create `.bundlewatch.config.json`:

```json
{
  "files": [
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "200kb"
    },
    {
      "path": ".next/static/css/*.css",
      "maxSize": "50kb"
    }
  ],
  "ci": {
    "trackBranches": ["main", "develop"]
  }
}
```

### Monitor Core Web Vitals

Track in production:
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **FCP (First Contentful Paint):** < 1.8s

## Priority Implementation Order

### Phase 1 (Week 1) - Quick Wins
1. ✅ Optimize package imports (DONE)
2. Dynamic import admin components
3. Optimize icon imports
4. Lazy load third-party scripts

**Expected Impact:** 150-250 KB reduction (20-30%)

### Phase 2 (Week 2-3) - Medium Effort
5. Implement route-based code splitting
6. Optimize Sanity client usage
7. Review and optimize date-fns imports
8. Set up bundle analyzer in CI/CD

**Expected Impact:** Additional 200-300 KB reduction (25-35%)

### Phase 3 (Month 2) - Advanced
9. Evaluate heavy dependency replacements
10. Implement aggressive webpack splitting
11. Add bundle size budgets
12. Optimize CSS further

**Expected Impact:** Additional 150-250 KB reduction (15-25%)

## Total Expected Savings

**Current Estimated Initial Bundle:** ~800-1000 KB (typical Next.js app with your stack)

**After Phase 1:** ~600-750 KB (25% reduction)
**After Phase 2:** ~400-550 KB (40% reduction)
**After Phase 3:** ~300-400 KB (50-60% reduction)

**Goal:** Initial bundle < 400 KB for excellent performance

## Verification Commands

```bash
# Analyze current bundle
ANALYZE=true bun run build

# Check bundle sizes
bun run build
du -sh .next/static/chunks/*

# Test production build locally
bun run build && bun start

# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Bundle size comparison
npx bundlephobia@latest <package-name>
```

## Resources

- [Next.js Bundle Analyzer](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Bundle Phobia](https://bundlephobia.com/) - Check package sizes before installing
- [Import Cost VSCode Extension](https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost)

---

**Last Updated:** 2025-11-11
**Status:** Phase 1 optimizations applied
