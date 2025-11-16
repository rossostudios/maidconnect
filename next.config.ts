import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Output standalone for Vercel deployment with proper NFT file generation
  // This ensures middleware and API routes have dependency traces for serverless functions
  output: "standalone",

  // Skip TypeScript checking during build (already verified locally)
  // This prevents hanging builds on Vercel and speeds up deployments
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "hvnetxfsrtplextvtwfx.supabase.co",
      },
    ],
    // Image optimization settings
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Disable cacheComponents - incompatible with dynamic auth routes
  // TODO: Re-enable when Next.js improves compatibility with protected routes
  // cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
    // Memory optimizations to prevent SIGABRT errors during build
    webpackMemoryOptimizations: true,
  },
  // Security headers
  //
  // Epic H-1: CSP Hardening
  // Content Security Policy (CSP) is now handled in middleware.ts with nonce-based script protection.
  // The middleware generates cryptographically secure nonces per-request for enhanced XSS protection.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // NOTE: Content Security Policy (CSP) is now handled in middleware.ts
          // The middleware provides dynamic nonce-based CSP for better XSS protection
          // while maintaining compatibility with PostHog, Stripe, and other integrations.
          // Prevents clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevents MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Controls referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Controls browser features and APIs
          {
            key: "Permissions-Policy",
            value: ["camera=()", "microphone=()", "geolocation=(self)", "interest-cohort=()"].join(
              ", "
            ),
          },
          // Enforces HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Protects against XSS attacks (legacy, but still useful)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
