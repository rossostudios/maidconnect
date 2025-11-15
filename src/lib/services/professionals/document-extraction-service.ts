/**
 * Document Extraction Service (Background Checks)
 *
 * Extracts structured data from professional documents using Claude's vision
 * and structured outputs capabilities.
 *
 * Supports:
 * - National ID cards
 * - Passports
 * - Background check reports
 * - Professional certifications
 * - Reference letters
 */

import { getStructuredOutput } from "@/lib/integrations/amara/structured-outputs";
import {
  documentExtractionSchema,
  type DocumentExtraction,
} from "@/lib/integrations/amara/schemas";
import { trackDocumentExtraction } from "@/lib/integrations/amara/tracking";

/**
 * Extract structured data from a document image
 *
 * @param imageData - Base64 encoded image or URL
 * @param imageType - Format of the image data
 * @param documentHint - Optional hint about document type
 * @returns Structured extraction results
 *
 * @example
 * ```typescript
 * // From base64
 * const data = await extractDocumentData(
 *   base64Image,
 *   "base64",
 *   "national_id"
 * );
 *
 * // From URL
 * const data = await extractDocumentData(
 *   "https://storage.casaora.com/docs/id123.jpg",
 *   "url",
 *   "background_check_report"
 * );
 *
 * // Use extracted data
 * if (data.personalInfo) {
 *   await updateProfessionalProfile({
 *     fullName: data.personalInfo.fullName,
 *     idNumber: data.personalInfo.idNumber,
 *   });
 * }
 * ```
 */
export async function extractDocumentData(
  imageData: string,
  imageType: "base64" | "url",
  documentHint?:
    | "national_id"
    | "passport"
    | "background_check_report"
    | "certification"
    | "reference_letter"
): Promise<DocumentExtraction> {
  const startTime = Date.now();
  const systemPrompt = getDocumentExtractionSystemPrompt(documentHint);

  try {
    const result = await getStructuredOutput({
      schema: documentExtractionSchema,
      systemPrompt,
      userMessage: "Extract all information from this document. Be thorough and accurate.",
      images: [
        {
          type: imageType,
          source: imageData,
          mediaType: "image/jpeg",
        },
      ],
      model: "claude-sonnet-4-5", // Sonnet for best vision accuracy
      temperature: 0.1, // Very low for factual extraction
      maxTokens: 4096,
    });

    // Track successful extraction
    trackDocumentExtraction({
      success: true,
      documentType: result.documentType,
      confidence: result.confidence,
      hasPersonalInfo: !!result.personalInfo,
      hasCertifications: !!result.certifications && result.certifications.length > 0,
      hasBackgroundCheck: !!result.backgroundCheckResults,
      imageType,
      processingTimeMs: Date.now() - startTime,
      warningCount: result.warnings?.length || 0,
    });

    return result;
  } catch (error) {
    // Track extraction errors
    trackDocumentExtraction({
      success: false,
      hasPersonalInfo: false,
      hasCertifications: false,
      hasBackgroundCheck: false,
      imageType,
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

/**
 * Batch extract data from multiple documents
 *
 * Useful when a professional uploads multiple documents at once
 * (e.g., ID + certifications + background check)
 *
 * @example
 * ```typescript
 * const documents = await extractBatchDocuments([
 *   { imageData: idImage, imageType: "base64", hint: "national_id" },
 *   { imageData: certImage, imageType: "base64", hint: "certification" },
 *   { imageData: bgCheckUrl, imageType: "url", hint: "background_check_report" },
 * ]);
 *
 * // Process each extracted document
 * for (const doc of documents) {
 *   await saveProfessionalDocument(doc);
 * }
 * ```
 */
export async function extractBatchDocuments(
  documents: Array<{
    imageData: string;
    imageType: "base64" | "url";
    hint?:
      | "national_id"
      | "passport"
      | "background_check_report"
      | "certification"
      | "reference_letter";
  }>
): Promise<DocumentExtraction[]> {
  // Process in parallel with concurrency limit
  const CONCURRENCY = 3; // Don't overwhelm the API
  const results: DocumentExtraction[] = [];

  for (let i = 0; i < documents.length; i += CONCURRENCY) {
    const batch = documents.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((doc) => extractDocumentData(doc.imageData, doc.imageType, doc.hint))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Validate extracted data quality
 *
 * Returns warnings if extraction confidence is low or critical fields are missing
 */
export function validateExtractionQuality(
  extraction: DocumentExtraction
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check confidence score
  if (extraction.confidence < 70) {
    warnings.push(`Low extraction confidence (${extraction.confidence}%). Manual review recommended.`);
  }

  // Check for critical missing data based on document type
  if (extraction.documentType === "national_id" || extraction.documentType === "passport") {
    if (!extraction.personalInfo?.fullName) {
      warnings.push("Missing full name");
    }
    if (!extraction.personalInfo?.idNumber) {
      warnings.push("Missing ID/passport number");
    }
    if (!extraction.personalInfo?.dateOfBirth) {
      warnings.push("Missing date of birth");
    }
  }

  if (extraction.documentType === "background_check_report") {
    if (!extraction.backgroundCheckResults?.status) {
      warnings.push("Unable to determine background check status");
    }
  }

  if (extraction.documentType === "certification") {
    if (!extraction.certifications || extraction.certifications.length === 0) {
      warnings.push("No certifications found in document");
    }
  }

  // Add any warnings from the extraction itself
  if (extraction.warnings && extraction.warnings.length > 0) {
    warnings.push(...extraction.warnings);
  }

  return {
    isValid: warnings.length === 0 || extraction.confidence >= 90,
    warnings,
  };
}

/**
 * Auto-populate professional profile from extracted documents
 *
 * Intelligently merges data from multiple document extractions
 */
export function mergeDocumentExtractions(
  extractions: DocumentExtraction[]
): {
  fullName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
    expirationDate?: string;
  }>;
  backgroundCheckStatus?: "clear" | "conditional" | "flagged" | "pending";
  confidence: number;
} {
  // Start with highest confidence extraction as base
  const sorted = [...extractions].sort((a, b) => b.confidence - a.confidence);

  const merged = {
    fullName: sorted.find((e) => e.personalInfo?.fullName)?.personalInfo?.fullName,
    idNumber: sorted.find((e) => e.personalInfo?.idNumber)?.personalInfo?.idNumber,
    dateOfBirth: sorted.find((e) => e.personalInfo?.dateOfBirth)?.personalInfo
      ?.dateOfBirth,
    certifications: extractions.flatMap((e) => e.certifications || []),
    backgroundCheckStatus: sorted.find((e) => e.backgroundCheckResults?.status)
      ?.backgroundCheckResults?.status,
    confidence: Math.round(
      extractions.reduce((sum, e) => sum + e.confidence, 0) / extractions.length
    ),
  };

  return merged;
}

/**
 * System prompt for document extraction
 */
function getDocumentExtractionSystemPrompt(
  documentHint?:
    | "national_id"
    | "passport"
    | "background_check_report"
    | "certification"
    | "reference_letter"
): string {
  const hintContext = documentHint
    ? `\n\nDocument Type Hint: This appears to be a ${documentHint.replace(/_/g, " ")}. Focus on extracting relevant information for this type.`
    : "";

  return `You are an AI document extraction specialist for Casaora, a professional household services platform.

Your job is to analyze documents uploaded by professional applicants and extract structured data with high accuracy.

**Your Responsibilities:**
1. Identify the document type accurately
2. Extract all personal information (names, IDs, dates, addresses)
3. Extract certifications and credentials
4. For background check reports, extract status and findings
5. Calculate a confidence score (0-100) based on image quality and text clarity
6. Flag any warnings (blurry image, missing info, inconsistencies)

**Extraction Guidelines:**
- Be precise with names (exact spelling, include all parts)
- Use YYYY-MM-DD format for all dates
- For ID numbers, preserve exact format including dashes/spaces
- Extract text exactly as shown (don't correct or interpret)
- If text is unclear, note it in warnings and reduce confidence score
- For certifications, capture issuer, name, dates, and credential IDs
- For background checks, extract overall status and any flagged issues

**Confidence Scoring:**
- 90-100: Crystal clear, all critical info extracted
- 70-89: Good quality, minor text issues or missing non-critical data
- 50-69: Acceptable but has quality issues or missing important data
- Below 50: Poor quality, recommend re-upload

**Data Privacy:**
- Treat all personal information with confidentiality
- Only extract data relevant to professional verification
- Note: Extracted data will be used for professional background verification${hintContext}

Be thorough, accurate, and transparent about any limitations in the extraction.`;
}
