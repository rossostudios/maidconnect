/**
 * Lighthouse CI Configuration
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 *
 * Core Web Vitals Thresholds:
 * - LCP (Largest Contentful Paint): < 2.5s good, < 4s needs improvement
 * - FCP (First Contentful Paint): < 1.8s good, < 3s needs improvement
 * - CLS (Cumulative Layout Shift): < 0.1 good, < 0.25 needs improvement
 * - TBT (Total Blocking Time): < 200ms good, < 600ms needs improvement
 */
module.exports = {
  ci: {
    collect: {
      // Use built Next.js output
      staticDistDir: '.next',
      // Start the production server for testing
      startServerCommand: 'bun run start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/en/professionals',
        'http://localhost:3000/en/about',
      ],
      // Number of runs per URL for consistent results
      numberOfRuns: 3,
      // Chromium settings
      settings: {
        // Mobile-first testing (matches Google's mobile-first indexing)
        preset: 'desktop',
        // Throttling to simulate real-world conditions
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
        // Skip audits that don't apply to our use case
        skipAudits: [
          'uses-http2', // Handled by Vercel Edge
          'canonical', // Dynamic per locale
        ],
      },
    },
    assert: {
      // Assertion preset (lighthouse:recommended is stricter than lighthouse:no-pwa)
      preset: 'lighthouse:recommended',
      assertions: {
        // === Core Web Vitals (CRITICAL) ===
        // LCP - Largest Contentful Paint
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],

        // FCP - First Contentful Paint
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],

        // CLS - Cumulative Layout Shift
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // TBT - Total Blocking Time (proxy for INP in lab)
        'total-blocking-time': ['error', { maxNumericValue: 200 }],

        // === Performance Score ===
        'categories:performance': ['error', { minScore: 0.9 }],

        // === Accessibility Score ===
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // === Best Practices Score ===
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // === SEO Score ===
        'categories:seo': ['warn', { minScore: 0.9 }],

        // === Bundle Size Related ===
        // Warn on unminified JS
        'unminified-javascript': 'warn',

        // Warn on unminified CSS
        'unminified-css': 'warn',

        // Warn on unused JS (helps identify code splitting opportunities)
        'unused-javascript': 'warn',

        // Warn on unused CSS
        'unused-css-rules': 'warn',

        // Warn on render-blocking resources
        'render-blocking-resources': 'warn',

        // === Image Optimization ===
        // Next.js Image component should handle these
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn',
        'modern-image-formats': 'warn',

        // === Font Loading ===
        'font-display': 'warn',

        // === Caching ===
        'uses-long-cache-ttl': 'warn',

        // === PWA (disabled - not a PWA) ===
        'categories:pwa': 'off',
        'installable-manifest': 'off',
        'service-worker': 'off',

        // === Other ===
        // Allow some variation in scores across runs
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
      },
    },
    upload: {
      // Target for uploading results
      // Options: 'temporary-public-storage' (free, 7 days), 'lhci' (self-hosted), 'filesystem'
      target: 'temporary-public-storage',
    },
  },
};
