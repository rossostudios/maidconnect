/**
 * Sanity Webhook for ISR Revalidation
 *
 * This endpoint is called by Sanity webhooks when content changes.
 * It triggers Next.js ISR to rebuild the affected pages.
 *
 * Setup in Sanity:
 * 1. Go to https://www.sanity.io/manage
 * 2. Select your project
 * 3. Go to API → Webhooks
 * 4. Create new webhook:
 *    - URL: https://your-domain.com/api/revalidate
 *    - Dataset: production
 *    - Trigger on: Create, Update, Delete
 *    - Projection: { _type, _id, slug, category, language }
 *    - Secret: Generate a random string and add to SANITY_WEBHOOK_SECRET env var
 */

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;
const LOCALES = ["en", "es"] as const;

type WebhookPayload = {
  _type: string;
  _id: string;
  slug?: {
    current: string;
  };
  category?: {
    slug: {
      current: string;
    };
  };
  language?: string;
};

type PathBuilder = (document: WebhookPayload, locales: readonly string[]) => string[];

/**
 * Verify webhook signature from Sanity
 */
function verifySignature(body: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("[Webhook] SANITY_WEBHOOK_SECRET not configured");
    return false;
  }

  if (!signature) {
    console.error("[Webhook] Missing signature header");
    return false;
  }

  const hash = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");

  return `sha256=${hash}` === signature;
}

/**
 * Helper to add localized paths
 */
function addLocalizedPaths(paths: string[], pathTemplate: (locale: string) => string): void {
  for (const locale of LOCALES) {
    paths.push(pathTemplate(locale));
  }
}

/**
 * Build paths for help articles
 */
function buildHelpArticlePaths(document: WebhookPayload): string[] {
  const paths: string[] = [];
  const categorySlug = document.category?.slug?.current;
  const articleSlug = document.slug?.current;

  // Revalidate specific article if both slugs exist
  if (categorySlug && articleSlug) {
    addLocalizedPaths(paths, (locale) => `/${locale}/help/${categorySlug}/${articleSlug}`);
  }

  // Revalidate help index
  addLocalizedPaths(paths, (locale) => `/${locale}/help`);

  // Revalidate category page if category exists
  if (categorySlug) {
    addLocalizedPaths(paths, (locale) => `/${locale}/help/${categorySlug}`);
  }

  return paths;
}

/**
 * Build paths for help categories
 */
function buildHelpCategoryPaths(document: WebhookPayload): string[] {
  const paths: string[] = [];
  const categorySlug = document.slug?.current;

  // Revalidate category page if slug exists
  if (categorySlug) {
    addLocalizedPaths(paths, (locale) => `/${locale}/help/${categorySlug}`);
  }

  // Revalidate help index
  addLocalizedPaths(paths, (locale) => `/${locale}/help`);

  return paths;
}

/**
 * Build paths for changelog entries
 */
function buildChangelogPaths(document: WebhookPayload): string[] {
  const paths: string[] = [];
  const changelogSlug = document.slug?.current;

  // Revalidate specific changelog if slug exists
  if (changelogSlug) {
    addLocalizedPaths(paths, (locale) => `/${locale}/changelog/${changelogSlug}`);
  }

  // Revalidate changelog index
  addLocalizedPaths(paths, (locale) => `/${locale}/changelog`);

  return paths;
}

/**
 * Build paths for roadmap items
 */
function buildRoadmapPaths(): string[] {
  const paths: string[] = [];

  // Revalidate roadmap page
  addLocalizedPaths(paths, (locale) => `/${locale}/roadmap`);

  return paths;
}

/**
 * Build paths for generic pages
 */
function buildPagePaths(document: WebhookPayload): string[] {
  const paths: string[] = [];
  const pageSlug = document.slug?.current;

  // Revalidate specific page if slug exists
  if (pageSlug) {
    addLocalizedPaths(paths, (locale) => `/${locale}/${pageSlug}`);
  }

  return paths;
}

/**
 * Build paths for city pages
 */
function buildCityPagePaths(document: WebhookPayload): string[] {
  const paths: string[] = [];
  const citySlug = document.slug?.current;

  if (citySlug) {
    // Revalidate specific city page
    addLocalizedPaths(paths, (locale) => `/${locale}/city/${citySlug}`);

    // Revalidate city index
    addLocalizedPaths(paths, (locale) => `/${locale}/city`);
  }

  return paths;
}

/**
 * Registry of path builders by document type
 */
const pathBuilders: Record<string, PathBuilder> = {
  helpArticle: buildHelpArticlePaths,
  helpCategory: buildHelpCategoryPaths,
  changelog: buildChangelogPaths,
  roadmapItem: buildRoadmapPaths,
  page: buildPagePaths,
  cityPage: buildCityPagePaths,
};

/**
 * Get paths to revalidate based on document type and data
 */
function getPathsToRevalidate(document: WebhookPayload): string[] {
  const builder = pathBuilders[document._type];

  if (!builder) {
    console.warn(`[Webhook] Unknown document type: ${document._type}`);
    return [];
  }

  return builder(document, LOCALES);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook secret
    const body = await request.text();
    const signature = request.headers.get("sanity-webhook-signature");

    if (!verifySignature(body, signature)) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse webhook payload
    const payload = JSON.parse(body) as WebhookPayload;

    console.log("[Webhook] Received:", {
      type: payload._type,
      id: payload._id,
      slug: payload.slug?.current,
    });

    // 3. Get paths to revalidate
    const paths = getPathsToRevalidate(payload);

    if (paths.length === 0) {
      console.warn("[Webhook] No paths to revalidate for document:", payload);
      return NextResponse.json({
        revalidated: false,
        message: "No paths matched",
      });
    }

    // 4. Revalidate all affected paths
    const results = await Promise.allSettled(
      paths.map((path) => {
        try {
          revalidatePath(path);
          console.log(`[Webhook] Revalidated: ${path}`);
          return Promise.resolve({ path, success: true });
        } catch (error) {
          console.error(`[Webhook] Failed to revalidate ${path}:`, error);
          return Promise.reject({ path, success: false, error });
        }
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`[Webhook] Revalidation complete: ${successful} succeeded, ${failed} failed`);

    return NextResponse.json({
      revalidated: true,
      paths,
      results: {
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Health check endpoint
export function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Sanity webhook endpoint is configured",
    configured: !!WEBHOOK_SECRET,
  });
}
