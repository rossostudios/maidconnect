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
 * Get paths to revalidate based on document type and data
 */
function getPathsToRevalidate(document: WebhookPayload): string[] {
  const paths: string[] = [];
  const locales = ["en", "es"]; // Revalidate both locales

  switch (document._type) {
    case "helpArticle": {
      const categorySlug = document.category?.slug?.current;
      const articleSlug = document.slug?.current;

      if (categorySlug && articleSlug) {
        // Revalidate the specific article page in both locales
        for (const locale of locales) {
          paths.push(`/${locale}/help/${categorySlug}/${articleSlug}`);
        }
      }

      // Revalidate help index and category pages
      for (const locale of locales) {
        paths.push(`/${locale}/help`);
        if (categorySlug) {
          paths.push(`/${locale}/help/${categorySlug}`);
        }
      }
      break;
    }

    case "helpCategory": {
      const categorySlug = document.slug?.current;

      if (categorySlug) {
        // Revalidate category page in both locales
        for (const locale of locales) {
          paths.push(`/${locale}/help/${categorySlug}`);
        }
      }

      // Revalidate help index
      for (const locale of locales) {
        paths.push(`/${locale}/help`);
      }
      break;
    }

    case "changelog": {
      const changelogSlug = document.slug?.current;

      if (changelogSlug) {
        // Revalidate specific changelog page in both locales
        for (const locale of locales) {
          paths.push(`/${locale}/changelog/${changelogSlug}`);
        }
      }

      // Revalidate changelog index
      for (const locale of locales) {
        paths.push(`/${locale}/changelog`);
      }
      break;
    }

    case "roadmapItem": {
      // Revalidate roadmap page in both locales
      for (const locale of locales) {
        paths.push(`/${locale}/roadmap`);
      }
      break;
    }

    case "page": {
      const pageSlug = document.slug?.current;

      if (pageSlug) {
        // Revalidate specific page in both locales
        for (const locale of locales) {
          paths.push(`/${locale}/${pageSlug}`);
        }
      }
      break;
    }

    case "cityPage": {
      const citySlug = document.slug?.current;

      if (citySlug) {
        // Revalidate city page in both locales
        for (const locale of locales) {
          paths.push(`/${locale}/city/${citySlug}`);
        }

        // Revalidate city index
        for (const locale of locales) {
          paths.push(`/${locale}/city`);
        }
      }
      break;
    }

    default:
      console.warn(`[Webhook] Unknown document type: ${document._type}`);
  }

  return paths;
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
      paths.map(async (path) => {
        try {
          revalidatePath(path);
          console.log(`[Webhook] Revalidated: ${path}`);
          return { path, success: true };
        } catch (error) {
          console.error(`[Webhook] Failed to revalidate ${path}:`, error);
          return { path, success: false, error };
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
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Sanity webhook endpoint is configured",
    configured: !!WEBHOOK_SECRET,
  });
}
