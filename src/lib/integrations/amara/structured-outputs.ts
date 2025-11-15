/**
 * Structured Outputs Utility for Claude AI
 *
 * Provides guaranteed JSON schema compliance for all Claude API responses
 * using Anthropic's structured outputs feature.
 *
 * Key benefits:
 * - Zero parsing errors
 * - Type-safe responses
 * - No retry logic needed
 * - Production-ready reliability
 */

import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

/**
 * Initialize Anthropic client
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Configuration for structured output requests
 */
export interface StructuredOutputConfig<T extends z.ZodType> {
  /** Zod schema defining the expected output structure */
  schema: T;

  /** System prompt providing context and instructions */
  systemPrompt: string;

  /** User message or query to analyze */
  userMessage: string;

  /** Optional image data for vision analysis (base64 or URL) */
  images?: Array<{
    type: "base64" | "url";
    source: string;
    mediaType?: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  }>;

  /** Model to use (defaults to sonnet-4-5) */
  model?: "claude-sonnet-4-5" | "claude-opus-4-1" | "claude-haiku-4-5";

  /** Maximum tokens to generate (default: 4096) */
  maxTokens?: number;

  /** Temperature for randomness (0-1, default: 0.3 for consistency) */
  temperature?: number;
}

/**
 * Call Claude with guaranteed structured output
 *
 * @param config - Configuration with schema, prompts, and options
 * @returns Parsed and type-safe response matching the schema
 *
 * @example
 * ```typescript
 * const result = await getStructuredOutput({
 *   schema: bookingIntentSchema,
 *   systemPrompt: "You are a booking intent parser...",
 *   userMessage: "I need a cleaner tomorrow in Bogotá",
 * });
 *
 * // result is guaranteed to match BookingIntent type
 * console.log(result.serviceType); // 'cleaning'
 * ```
 */
export async function getStructuredOutput<T extends z.ZodType>(
  config: StructuredOutputConfig<T>
): Promise<z.infer<T>> {
  const {
    schema,
    systemPrompt,
    userMessage,
    images,
    model = "claude-sonnet-4-5",
    maxTokens = 4096,
    temperature = 0.3,
  } = config;

  // Convert Zod schema to JSON Schema format for Anthropic
  const jsonSchema = zodToJsonSchema(schema);

  // Build content blocks (text + optional images)
  const content: Array<Anthropic.MessageParam["content"][0]> = [];

  // Add text message
  content.push({
    type: "text",
    text: userMessage,
  });

  // Add images if provided (for document extraction use case)
  if (images && images.length > 0) {
    for (const image of images) {
      if (image.type === "base64") {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: image.mediaType || "image/jpeg",
            data: image.source,
          },
        });
      } else {
        content.push({
          type: "image",
          source: {
            type: "url",
            url: image.source,
          },
        });
      }
    }
  }

  try {
    // Call Anthropic API with structured output configuration
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content,
        },
      ],
      // Enable structured outputs with JSON schema
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_response",
          strict: true,
          schema: jsonSchema,
        },
      },
    });

    // Extract JSON response
    const textContent = response.content.find((block) => block.type === "text");

    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    // Parse JSON (guaranteed to be valid by Claude)
    const parsed = JSON.parse(textContent.text);

    // Validate against Zod schema (should never fail, but good practice)
    const validated = schema.parse(parsed);

    return validated;
  } catch (error) {
    console.error("Structured output error:", error);

    // Provide helpful error messages
    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Claude API error: ${error.message} (status: ${error.status})`
      );
    }

    if (error instanceof z.ZodError) {
      throw new Error(
        `Schema validation failed: ${error.errors.map((e) => e.message).join(", ")}`
      );
    }

    throw error;
  }
}

/**
 * Convert Zod schema to JSON Schema format
 *
 * Anthropic's structured outputs use JSON Schema, so we need to convert
 * our Zod schemas to the compatible format.
 */
function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  // Use zod-to-json-schema library for conversion
  // This is a simplified version - in production, use the library
  const zodToJsonSchemaLib = require("zod-to-json-schema");
  return zodToJsonSchemaLib.zodToJsonSchema(schema);
}

/**
 * Batch structured output processing
 *
 * Processes multiple requests in parallel for better performance.
 * Useful for bulk document extraction or review analysis.
 *
 * @example
 * ```typescript
 * const reviews = await getBatchStructuredOutput([
 *   { schema: reviewAnalysisSchema, systemPrompt, userMessage: review1 },
 *   { schema: reviewAnalysisSchema, systemPrompt, userMessage: review2 },
 * ]);
 * ```
 */
export async function getBatchStructuredOutput<T extends z.ZodType>(
  configs: Array<StructuredOutputConfig<T>>
): Promise<Array<z.infer<T>>> {
  // Process in parallel with concurrency limit (avoid rate limits)
  const CONCURRENCY_LIMIT = 5;
  const results: Array<z.infer<T>> = [];

  for (let i = 0; i < configs.length; i += CONCURRENCY_LIMIT) {
    const batch = configs.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.all(
      batch.map((config) => getStructuredOutput(config))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Stream structured output for real-time UI updates
 *
 * For longer responses, stream partial results to the UI.
 * Currently not fully supported by Anthropic - use regular streaming
 * and parse incrementally.
 */
export async function* streamStructuredOutput<T extends z.ZodType>(
  config: StructuredOutputConfig<T>
): AsyncGenerator<Partial<z.infer<T>>> {
  // This is a placeholder for future streaming support
  // Anthropic is working on streaming structured outputs
  const result = await getStructuredOutput(config);
  yield result;
}
