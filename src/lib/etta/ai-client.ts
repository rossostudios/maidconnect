/**
 * Etta AI Client Configuration
 *
 * Sets up Vercel AI SDK with Claude Haiku 4.5 for the Etta booking concierge.
 * Uses Anthropic's Claude Haiku 4.5 model via Vercel AI Gateway for optimal
 * performance and cost-efficiency.
 */

import { anthropic } from "@ai-sdk/anthropic";

/**
 * Etta's AI model configuration
 *
 * Using Claude Haiku 4.5 for:
 * - Fast response times (2-3 seconds)
 * - Cost efficiency ($1/M input, $5/M output tokens)
 * - Strong multilingual support (EN/ES)
 * - Excellent tool calling capabilities
 */
export const ettaModel = anthropic("claude-haiku-4-5");

/**
 * Model configuration constants
 */
export const ETTA_MODEL_CONFIG = {
  name: "claude-haiku-4-5",
  provider: "anthropic",
  maxTokens: 1000, // Limit response length
  temperature: 0.7, // Balanced creativity and consistency
  topP: 1, // Use full probability distribution
} as const;

/**
 * Validate that the required API key is present
 */
export function validateEttaConfig(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required for Etta AI");
  }
}
