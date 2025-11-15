/**
 * Document Extraction API
 *
 * POST /api/admin/documents/extract
 *
 * Extracts structured data from professional documents using AI vision.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractDocumentData } from "@/lib/services/professionals/document-extraction-service";
import { withAuth } from "@/lib/shared/api/middleware";

const requestSchema = z.object({
  imageData: z.string().describe("Base64 encoded image or URL"),
  imageType: z.enum(["base64", "url"]).describe("Format of image data"),
  documentType: z
    .enum([
      "national_id",
      "passport",
      "background_check_report",
      "certification",
      "reference_letter",
    ])
    .optional()
    .describe("Optional hint about document type"),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const validated = requestSchema.parse(body);

    // Extract document data
    const extraction = await extractDocumentData(
      validated.imageData,
      validated.imageType,
      validated.documentType
    );

    return NextResponse.json({
      success: true,
      extraction,
    });
  } catch (error) {
    console.error("Document extraction error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to extract document data" },
      { status: 500 }
    );
  }
}

// Wrap with auth middleware (admin only)
export const POST = withAuth(handler, { requiredRole: "admin" });
