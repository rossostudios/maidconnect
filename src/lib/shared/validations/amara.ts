/**
 * Amara Validation Schemas
 *
 * Zod schemas for validating Amara chat requests and responses.
 */

import { z } from "zod";

const messagePartSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

/**
 * Schema for chat message
 */
export const chatMessageSchema = z
  .object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().optional(),
    parts: z.array(messagePartSchema).optional(),
    id: z.string().optional(),
  })
  .refine(
    (value) => {
      if (typeof value.content === "string" && value.content.trim().length > 0) {
        return true;
      }
      return Array.isArray(value.parts) && value.parts.length > 0;
    },
    {
      message: "Message must include content or parts",
      path: ["content"],
    }
  );

/**
 * Schema for chat request to the API
 */
export const amaraChatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "At least one message is required")
    .max(50, "Too many messages in conversation"),
  conversationId: z.string().uuid().optional(),
});

/**
 * Schema for creating a new conversation
 */
export const createConversationSchema = z.object({
  title: z.string().max(100).optional(),
  locale: z.enum(["en", "es"]).default("en"),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Schema for updating a conversation
 */
export const updateConversationSchema = z.object({
  title: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Schema for creating a message
 */
export const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(10_000).optional(),
  parts: z.array(messagePartSchema).optional(),
  attachments: z.array(messagePartSchema).optional(),
  toolCalls: z.any().optional(),
  toolResults: z.any().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.enum(["submitted", "streaming", "completed", "error"]).optional(),
});

/**
 * Type exports
 */
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type AmaraChatRequest = z.infer<typeof amaraChatRequestSchema>;
export type CreateConversation = z.infer<typeof createConversationSchema>;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
