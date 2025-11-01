/**
 * Etta Validation Schemas
 *
 * Zod schemas for validating Etta chat requests and responses.
 */

import { z } from "zod";

/**
 * Schema for chat message
 */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message content cannot be empty"),
  id: z.string().optional(),
});

/**
 * Schema for chat request to the API
 */
export const ettaChatRequestSchema = z.object({
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
  content: z.string().min(1).max(10_000),
  toolCalls: z.any().optional(),
  toolResults: z.any().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Type exports
 */
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type EttaChatRequest = z.infer<typeof ettaChatRequestSchema>;
export type CreateConversation = z.infer<typeof createConversationSchema>;
export type UpdateConversation = z.infer<typeof updateConversationSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
