/**
 * Bundle Analyzer Configuration
 * Run with: ANALYZE=true bun run build
 */

import withBundleAnalyzer from "@next/bundle-analyzer";
import nextConfig from "./next.config.mjs";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

export default bundleAnalyzer(nextConfig);
