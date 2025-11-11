import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "7j0vrfmg";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2025-01-10";

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

/**
 * Client for fetching data in the browser (public, CDN-enabled)
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

/**
 * Client for server-side fetching (supports draft mode and tokens)
 */
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN for fresh data
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "published",
});

/**
 * Client for write operations (migrations, webhooks)
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

/**
 * Export config for reuse
 */
export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
  studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3000/studio",
};
