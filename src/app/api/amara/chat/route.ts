/**
 * Amara Chat API Endpoint
 *
 * Handles streaming chat conversations with Amara AI assistant.
 * Uses Vercel AI SDK with Claude Haiku 4.5 for fast, cost-effective responses.
 */

import { streamText } from "ai";
import { NextResponse } from "next/server";
import { AMARA_MODEL_CONFIG, amaraModel, validateAmaraConfig } from "@/lib/amara/ai-client";
import { getAmaraSystemPrompt } from "@/lib/amara/prompts";
import { amaraTools } from "@/lib/amara/tools";
import { handleApiError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { amaraChatRequestSchema } from "@/lib/validations/amara";
import { validateRequestBody } from "@/lib/validations/api";

/**
 * Handle POST requests to the chat endpoint
 */
async function handlePOST(request: Request) {
  try {
    // Validate AI configuration
    validateAmaraConfig();

    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Validate request body
    const body = await validateRequestBody(request, amaraChatRequestSchema);
    const { messages, conversationId } = body;

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("locale, full_name")
      .eq("id", user.id)
      .maybeSingle();

    // Get customer profile for city info (if available)
    const { data: customerProfile } = await supabase
      .from("customer_profiles")
      .select("city")
      .eq("profile_id", user.id)
      .maybeSingle();

    // Prepare user context for system prompt
    const userContext = {
      locale: profile?.locale || "en",
      name: profile?.full_name || undefined,
      city: customerProfile?.city || undefined,
      userId: user.id,
    };

    // Get system prompt
    const systemPrompt = getAmaraSystemPrompt(userContext);

    // Log chat initiation for analytics
    logger.info("Amara chat initiated", {
      userId: user.id,
      conversationId: conversationId || "new",
      messageCount: messages.length,
      locale: userContext.locale,
    });

    // Stream AI response using Vercel AI SDK
    const result = streamText({
      model: amaraModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      tools: amaraTools,
      // Note: maxTokens and temperature are configured in the model itself via AMARA_MODEL_CONFIG
      onFinish: async ({ text, toolCalls, usage }) => {
        // Save conversation to database after response completes
        try {
          let currentConversationId = conversationId;

          // Create conversation if this is the first message
          if (!currentConversationId) {
            const { data: newConversation, error: conversationError } = await supabase
              .from("amara_conversations")
              .insert({
                user_id: user.id,
                locale: userContext.locale,
                is_active: true,
                last_message_at: new Date().toISOString(),
              })
              .select("id")
              .single();

            if (conversationError) {
              logger.error("Failed to create conversation", {
                error: conversationError,
                userId: user.id,
              });
            } else {
              currentConversationId = newConversation.id;
            }
          }

          // Save assistant message
          if (currentConversationId) {
            const { error: messageError } = await supabase.from("amara_messages").insert({
              conversation_id: currentConversationId,
              role: "assistant",
              content: text,
              tool_calls: toolCalls ? JSON.stringify(toolCalls) : null,
              metadata: {
                model: AMARA_MODEL_CONFIG.name,
                usage,
                timestamp: new Date().toISOString(),
              },
            });

            if (messageError) {
              logger.error("Failed to save assistant message", {
                error: messageError,
                conversationId: currentConversationId,
              });
            }

            // Update conversation's last_message_at
            await supabase
              .from("amara_conversations")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", currentConversationId);
          }

          // Log completion for analytics
          logger.info("Amara chat completed", {
            userId: user.id,
            conversationId: currentConversationId,
            tokensUsed: usage?.totalTokens || 0,
            toolCallCount: toolCalls?.length || 0,
          });
        } catch (saveError) {
          logger.error("Error saving conversation", {
            error: saveError,
            userId: user.id,
          });
        }
      },
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    logger.error("Amara chat error", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return handleApiError(error, request, {
      context: "amara_chat",
      userId: "unknown",
    });
  }
}

/**
 * Export with rate limiting
 *
 * Using 'api' rate limit type (100 req/min) for now.
 * Can create a custom 'amara' rate limit if needed.
 */
export const POST = withRateLimit(handlePOST, "api");
