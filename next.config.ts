import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
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
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  // Security headers
  async headers() {
    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === "production";

    // Build script-src directive based on environment
    const scriptSrc = [
      "'self'",
      // unsafe-eval only in development (needed for Next.js hot reloading)
      ...(isProduction ? [] : ["'unsafe-eval'"]),
      // unsafe-inline for compatibility (consider nonce-based CSP in future)
      "'unsafe-inline'",
      "https://js.stripe.com",
      "https://maps.googleapis.com",
      // Better Stack logging
      "https://in.logs.betterstack.com",
    ].join(" ");

    // CSP violation reporting endpoint (Better Stack)
    const reportUri = process.env.LOGTAIL_SOURCE_TOKEN
      ? `https://in.logs.betterstack.com/api/v1/ingest?source_token=${process.env.LOGTAIL_SOURCE_TOKEN}`
      : "";

    return [
      {
        source: "/:path*",
        headers: [
          // Content Security Policy (CSP) - Prevents XSS attacks
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Added Supabase storage for images
              "img-src 'self' data: blob: https://images.unsplash.com https://*.stripe.com https://*.supabase.co",
              "font-src 'self' data: https://fonts.gstatic.com",
              // Added Upstash Redis and Better Stack
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://maps.googleapis.com https://*.upstash.io https://in.logs.betterstack.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              // CSP violation reporting (only if Better Stack is configured)
              ...(reportUri ? [`report-uri ${reportUri}`] : []),
            ]
              .filter(Boolean)
              .join("; "),
          },
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
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=(self)",
              "interest-cohort=()",
            ].join(", "),
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

export default withNextIntl(nextConfig);
