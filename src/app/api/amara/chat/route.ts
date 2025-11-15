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
import { amaraChatRequestSchema, type ChatMessage } from "@/lib/validations/amara";
import { validateRequestBody } from "@/lib/validations/api";

type NormalizedMessagePart = Record<string, any>;

const MESSAGE_STATUS = {
  SUBMITTED: "submitted",
  STREAMING: "streaming",
  COMPLETED: "completed",
  ERROR: "error",
} as const;

/**
 * Handle POST requests to the chat endpoint
 */
async function handlePOST(request: Request) {
  let authenticatedUserId: string | null = null;

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
    authenticatedUserId = user.id;

    // Validate request body
    const body = await validateRequestBody(request, amaraChatRequestSchema);
    const { messages, conversationId } = body;
    const latestMessage = messages.at(-1);

    if (!latestMessage || latestMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from the user." }, { status: 400 });
    }

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

    let activeConversationId: string;
    try {
      activeConversationId = await getOrCreateConversation({
        supabase,
        conversationId,
        userId: user.id,
        locale: userContext.locale,
      });
    } catch (convError) {
      if (convError instanceof ConversationError) {
        return NextResponse.json({ error: convError.message }, { status: convError.status });
      }
      throw convError;
    }

    await persistUserMessage({
      supabase,
      conversationId: activeConversationId,
      message: latestMessage,
      locale: userContext.locale,
    });

    // Get system prompt
    const systemPrompt = getAmaraSystemPrompt(userContext);

    // Log chat initiation for analytics
    logger.info("Amara chat initiated", {
      userId: user.id,
      conversationId: activeConversationId,
      messageCount: messages.length,
      locale: userContext.locale,
    });

    const coreMessages = toCoreMessages(messages);

    // Stream AI response using Vercel AI SDK
    const result = streamText({
      model: amaraModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...coreMessages,
      ],
      tools: amaraTools,
      // Note: maxTokens and temperature are configured in the model itself via AMARA_MODEL_CONFIG
      onFinish: async (event) => {
        try {
          await handleAssistantCompletion({
            supabase,
            event,
            conversationId: activeConversationId,
            userId: user.id,
          });
        } catch (saveError) {
          logger.error("Error saving conversation", {
            error: saveError,
            userId: user.id,
            conversationId: activeConversationId,
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
      userId: authenticatedUserId ?? "unknown",
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

class ConversationError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ConversationError";
    this.status = status;
  }
}

async function getOrCreateConversation({
  supabase,
  conversationId,
  userId,
  locale,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  conversationId?: string;
  userId: string;
  locale: string;
}) {
  if (conversationId) {
    const { data: existingConversation, error: existingConversationError } = await supabase
      .from("amara_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingConversationError || !existingConversation) {
      throw new ConversationError("Conversation not found", 404);
    }

    return existingConversation.id;
  }

  const now = new Date().toISOString();
  const { data: createdConversation, error: conversationInsertError } = await supabase
    .from("amara_conversations")
    .insert({
      user_id: userId,
      locale,
      is_active: true,
      last_message_at: now,
    })
    .select("id")
    .single();

  if (conversationInsertError || !createdConversation) {
    throw new ConversationError("Unable to create conversation", 500);
  }

  return createdConversation.id;
}

async function persistUserMessage({
  supabase,
  conversationId,
  message,
  locale,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  conversationId: string;
  message: ChatMessage;
  locale: string;
}) {
  if (message.id) {
    const { data: existing } = await supabase
      .from("amara_messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("metadata->>clientMessageId", message.id)
      .maybeSingle();

    if (existing) {
      return existing.id;
    }
  }

  const parts = getMessageParts(message);
  const attachments = getAttachmentParts(parts);
  const text = getMessageText(message);
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("amara_messages")
    .insert({
      conversation_id: conversationId,
      role: "user",
      content: text,
      parts,
      attachments,
      status: MESSAGE_STATUS.SUBMITTED,
      metadata: {
        locale,
        source: "web",
        clientMessageId: message.id,
        submittedAt: timestamp,
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to save user message");
  }

  await supabase
    .from("amara_conversations")
    .update({ last_message_at: timestamp })
    .eq("id", conversationId);

  return data.id;
}

async function handleAssistantCompletion({
  supabase,
  event,
  conversationId,
  userId,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  event: any; // Allow any AI SDK event structure to avoid type chasing
  conversationId: string;
  userId: string;
}) {
  const parts = (event.content ?? []) as any[];
  const attachments = getAttachmentParts(parts);
  const timestamp = new Date().toISOString();
  const responseMessageId = event.response?.messages?.find(
    (message: { role: string; id?: string }) => message.role === "assistant"
  )?.id;

  const { data: assistantMessage, error: assistantError } = await supabase
    .from("amara_messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: event.text,
      parts,
      attachments,
      tool_calls: event.toolCalls?.length ? event.toolCalls : null,
      metadata: {
        model: AMARA_MODEL_CONFIG.name,
        usage: event.usage,
        finishReason: event.finishReason,
        responseMessageId,
        timestamp,
      },
      status: event.finishReason === "error" ? MESSAGE_STATUS.ERROR : MESSAGE_STATUS.COMPLETED,
    })
    .select("id")
    .single();

  if (assistantError || !assistantMessage) {
    throw assistantError ?? new Error("Failed to store assistant message");
  }

  const toolRuns = buildToolRunPayloads({
    conversationId,
    messageId: assistantMessage.id,
    userId,
    toolCalls: event.toolCalls ?? [],
    toolResults: event.toolResults ?? [],
  });

  if (toolRuns.length > 0) {
    await supabase.from("amara_tool_runs").insert(toolRuns);
  }

  await supabase
    .from("amara_conversations")
    .update({ last_message_at: timestamp })
    .eq("id", conversationId);

  logger.info("Amara chat completed", {
    userId,
    conversationId,
    tokensUsed: event.usage?.totalTokens || 0,
    toolCallCount: event.toolCalls?.length || 0,
  });
}

function toCoreMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: getMessageText(message),
  }));
}

function getMessageParts(message: ChatMessage): NormalizedMessagePart[] {
  if (Array.isArray(message.parts) && message.parts.length > 0) {
    return message.parts as NormalizedMessagePart[];
  }

  if (typeof message.content === "string") {
    return [{ type: "text", text: message.content }];
  }

  return [];
}

function getMessageText(message: ChatMessage) {
  if (typeof message.content === "string" && message.content.trim().length > 0) {
    return message.content;
  }

  return getMessageParts(message)
    .filter((part) => part.type === "text" && typeof (part as { text?: string }).text === "string")
    .map((part) => String((part as { text?: string }).text))
    .join("\n\n");
}

function getAttachmentParts(parts: NormalizedMessagePart[]) {
  return parts.filter((part) => part.type === "file");
}

function buildToolRunPayloads({
  conversationId,
  messageId,
  userId,
  toolCalls,
  toolResults,
}: {
  conversationId: string;
  messageId: string;
  userId: string;
  toolCalls: Array<{ toolCallId: string; toolName: string; input?: unknown }>;
  toolResults: Array<{ toolCallId: string; output: unknown }>;
}) {
  if (!toolCalls.length) {
    return [];
  }

  const resultsById = new Map(toolResults.map((result) => [result.toolCallId, result]));

  return toolCalls.map((call) => {
    const result = resultsById.get(call.toolCallId);
    return {
      conversation_id: conversationId,
      message_id: messageId,
      user_id: userId,
      tool_call_id: call.toolCallId,
      tool_name: call.toolName,
      state: result ? "output-available" : "output-error",
      input: call.input ?? null,
      output: result?.output ?? null,
      error_text: result ? null : "No tool result returned",
    };
  });
}
