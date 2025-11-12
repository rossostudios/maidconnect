/**
 * Sanity Webhook Handler - Algolia Sync
 *
 * This webhook receives events from Sanity CMS when documents are
 * created, updated, or deleted, and syncs them to Algolia for search.
 *
 * Webhook Setup in Sanity:
 * 1. Go to https://www.sanity.io/manage
 * 2. Select your project
 * 3. Navigate to API → Webhooks
 * 4. Create new webhook:
 *    - URL: https://your-domain.com/api/webhooks/sanity
 *    - Dataset: production
 *    - Trigger on: Create, Update, Delete
 *    - Filter: _type in ["helpArticle", "changelog", "roadmapItem", "cityPage"]
 *    - HTTP method: POST
 *    - API version: v2021-03-25
 *    - Include drafts: No
 *    - Secret: (use SANITY_WEBHOOK_SECRET from .env)
 */

import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { syncDocument } from "@/lib/integrations/algolia";
import { client } from "@/lib/integrations/sanity/client";

/**
 * Verify webhook signature to ensure request is from Sanity
 */
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("SANITY_WEBHOOK_SECRET not configured");
    return false;
  }

  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");

  return hash === signature;
}

/**
 * Supported document types for Algolia sync
 */
const SUPPORTED_TYPES = new Set(["helpArticle", "changelog", "roadmapItem", "cityPage"]);

/**
 * POST /api/webhooks/sanity
 * Handles Sanity webhook events and syncs to Algolia
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("sanity-webhook-signature") || "";

    // Verify webhook signature
    if (!verifySignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const { _id, _type } = payload;

    // Check if document type is supported
    if (!SUPPORTED_TYPES.has(_type)) {
      console.log(`Ignoring webhook for unsupported document type: ${_type}`);
      return NextResponse.json({ message: "Document type not supported" });
    }

    // Determine action (create, update, or delete)
    let action: "create" | "update" | "delete";

    if (payload._deleted === true) {
      action = "delete";
    } else if (payload._rev?.startsWith("1-")) {
      action = "create";
    } else {
      action = "update";
    }

    console.log(`Sanity webhook: ${action} ${_type} ${_id}`);

    // For create/update, fetch the full document from Sanity
    // (webhook payload may not include all fields)
    let document = payload;

    if (action !== "delete") {
      const query = `*[_id == $id][0]{
        ...,
        category->{_id, title, slug},
        tags[]->{_id, title, slug}
      }`;

      document = await client.fetch(query, { id: _id });

      if (!document) {
        console.error(`Document not found: ${_id}`);
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
    }

    // Sync to Algolia
    const result = await syncDocument(document, action);

    console.log("Algolia sync successful:", result);

    return NextResponse.json({
      success: true,
      action: result.action,
      documentId: result.documentId,
      documentType: result.documentType,
    });
  } catch (error) {
    console.error("Sanity webhook error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/sanity
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Sanity → Algolia webhook endpoint",
    supportedTypes: Array.from(SUPPORTED_TYPES),
  });
}
