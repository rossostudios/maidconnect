import { describe, expect, it } from "vitest";
import {
  amaraChatRequestSchema,
  chatMessageSchema,
  createConversationSchema,
  createMessageSchema,
  updateConversationSchema,
} from "../amara";

// ============================================================================
// CHAT MESSAGE SCHEMA
// ============================================================================

describe("chatMessageSchema", () => {
  describe("valid messages", () => {
    it("accepts message with content string", () => {
      const valid = {
        role: "user" as const,
        content: "Hello, how can you help me?",
      };

      const result = chatMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts message with parts array", () => {
      const valid = {
        role: "assistant" as const,
        parts: [{ type: "text", text: "Hello!" }],
      };

      const result = chatMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts all valid roles", () => {
      expect(chatMessageSchema.safeParse({ role: "user", content: "Hi" }).success).toBe(true);
      expect(chatMessageSchema.safeParse({ role: "assistant", content: "Hi" }).success).toBe(true);
      expect(chatMessageSchema.safeParse({ role: "system", content: "Hi" }).success).toBe(true);
    });

    it("accepts message with optional id", () => {
      const valid = {
        role: "user" as const,
        content: "Hello",
        id: "msg-123",
      };

      const result = chatMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts both content and parts", () => {
      const valid = {
        role: "user" as const,
        content: "Main message",
        parts: [{ type: "attachment" }],
      };

      const result = chatMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid messages", () => {
    it("rejects invalid roles", () => {
      const invalid = {
        role: "moderator",
        content: "Hello",
      };

      const result = chatMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects message without content or parts", () => {
      const invalid = {
        role: "user" as const,
      };

      const result = chatMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("content or parts");
      }
    });

    it("rejects message with empty content and no parts", () => {
      const invalid = {
        role: "user" as const,
        content: "",
      };

      const result = chatMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects message with whitespace-only content and no parts", () => {
      const invalid = {
        role: "user" as const,
        content: "   ",
      };

      const result = chatMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects message with empty parts array and no content", () => {
      const invalid = {
        role: "user" as const,
        parts: [],
      };

      const result = chatMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("requires role field", () => {
      const missing = {
        content: "Hello",
      };

      const result = chatMessageSchema.safeParse(missing);
      expect(result.success).toBe(false);
    });
  });

  describe("passthrough behavior for parts", () => {
    it("allows extra fields in parts objects", () => {
      const valid = {
        role: "user" as const,
        parts: [
          {
            type: "image",
            url: "https://example.com/image.jpg",
            mimeType: "image/jpeg",
            extraField: "allowed",
          },
        ],
      };

      const result = chatMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("requires type field in parts", () => {
      const invalid = {
        role: "user" as const,
        parts: [{ url: "https://example.com" }],
      };

      const result = chatMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// AMARA CHAT REQUEST SCHEMA
// ============================================================================

describe("amaraChatRequestSchema", () => {
  describe("valid requests", () => {
    it("accepts request with single message", () => {
      const valid = {
        messages: [
          {
            role: "user" as const,
            content: "Hello",
          },
        ],
      };

      const result = amaraChatRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts request with multiple messages", () => {
      const valid = {
        messages: [
          { role: "user" as const, content: "Hello" },
          { role: "assistant" as const, content: "Hi there!" },
          { role: "user" as const, content: "How are you?" },
        ],
      };

      const result = amaraChatRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts request with optional conversationId", () => {
      const valid = {
        messages: [{ role: "user" as const, content: "Hello" }],
        conversationId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = amaraChatRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts up to 50 messages", () => {
      const valid = {
        messages: Array(50).fill({ role: "user" as const, content: "msg" }),
      };

      const result = amaraChatRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid requests", () => {
    it("rejects empty messages array", () => {
      const invalid = {
        messages: [],
      };

      const result = amaraChatRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("At least one message");
      }
    });

    it("rejects more than 50 messages", () => {
      const invalid = {
        messages: Array(51).fill({ role: "user" as const, content: "msg" }),
      };

      const result = amaraChatRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("Too many messages");
      }
    });

    it("rejects invalid UUID for conversationId", () => {
      const invalid = {
        messages: [{ role: "user" as const, content: "Hello" }],
        conversationId: "not-a-uuid",
      };

      const result = amaraChatRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects if any message is invalid", () => {
      const invalid = {
        messages: [
          { role: "user" as const, content: "Hello" },
          { role: "invalid" as const, content: "Bad message" },
        ],
      };

      const result = amaraChatRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("conversation context", () => {
    it("allows continuing conversation with conversationId", () => {
      const valid = {
        messages: [{ role: "user" as const, content: "Continue our chat" }],
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = amaraChatRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("allows new conversation without conversationId", () => {
      const valid = {
        messages: [{ role: "user" as const, content: "Start new chat" }],
      };

      const result = amaraChatRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// CREATE CONVERSATION SCHEMA
// ============================================================================

describe("createConversationSchema", () => {
  describe("valid conversation creation", () => {
    it("accepts minimal conversation (all fields optional)", () => {
      const valid = {};

      const result = createConversationSchema.parse(valid);
      expect(result.locale).toBe("en"); // Default
    });

    it("accepts conversation with title", () => {
      const valid = {
        title: "Support Chat",
      };

      const result = createConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts both supported locales", () => {
      expect(createConversationSchema.safeParse({ locale: "en" }).success).toBe(true);
      expect(createConversationSchema.safeParse({ locale: "es" }).success).toBe(true);
    });

    it("defaults locale to 'en'", () => {
      const result = createConversationSchema.parse({});
      expect(result.locale).toBe("en");
    });

    it("accepts metadata object", () => {
      const valid = {
        metadata: {
          userId: "user-123",
          source: "mobile-app",
          category: "support",
        },
      };

      const result = createConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts all fields together", () => {
      const valid = {
        title: "Booking Assistance",
        locale: "es" as const,
        metadata: {
          bookingId: "booking-456",
          professionalId: "prof-789",
        },
      };

      const result = createConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid conversation creation", () => {
    it("rejects title longer than 100 characters", () => {
      const invalid = {
        title: "A".repeat(101),
      };

      const result = createConversationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("accepts title exactly 100 characters", () => {
      const valid = {
        title: "A".repeat(100),
      };

      const result = createConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid locale", () => {
      const invalid = {
        locale: "fr",
      };

      const result = createConversationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// UPDATE CONVERSATION SCHEMA
// ============================================================================

describe("updateConversationSchema", () => {
  describe("valid conversation updates", () => {
    it("accepts empty update object", () => {
      const valid = {};

      const result = updateConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts title update", () => {
      const valid = {
        title: "Updated Title",
      };

      const result = updateConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts isActive update", () => {
      const valid = {
        isActive: false,
      };

      const result = updateConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts metadata update", () => {
      const valid = {
        metadata: {
          resolved: true,
          rating: 5,
        },
      };

      const result = updateConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts multiple fields", () => {
      const valid = {
        title: "Resolved: Booking Issue",
        isActive: false,
        metadata: { resolved: true },
      };

      const result = updateConversationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("invalid conversation updates", () => {
    it("rejects title longer than 100 characters", () => {
      const invalid = {
        title: "A".repeat(101),
      };

      const result = updateConversationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects non-boolean isActive", () => {
      const invalid = {
        isActive: "true",
      };

      const result = updateConversationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// CREATE MESSAGE SCHEMA
// ============================================================================

describe("createMessageSchema", () => {
  describe("valid message creation", () => {
    const validConversationId = "123e4567-e89b-12d3-a456-426614174000";

    it("accepts message with content", () => {
      const valid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "Hello, I need help",
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts message with parts", () => {
      const valid = {
        conversationId: validConversationId,
        role: "assistant" as const,
        parts: [{ type: "text", text: "Sure, I can help!" }],
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts all role types", () => {
      expect(
        createMessageSchema.safeParse({
          conversationId: validConversationId,
          role: "user",
          content: "Hi",
        }).success
      ).toBe(true);
      expect(
        createMessageSchema.safeParse({
          conversationId: validConversationId,
          role: "assistant",
          content: "Hi",
        }).success
      ).toBe(true);
      expect(
        createMessageSchema.safeParse({
          conversationId: validConversationId,
          role: "system",
          content: "Hi",
        }).success
      ).toBe(true);
    });

    it("accepts message with attachments", () => {
      const valid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "Check this image",
        attachments: [{ type: "image", url: "https://example.com/img.jpg" }],
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts message with all optional fields", () => {
      const valid = {
        conversationId: validConversationId,
        role: "assistant" as const,
        content: "Response",
        parts: [{ type: "text" }],
        attachments: [{ type: "file" }],
        toolCalls: [{ name: "search" }],
        toolResults: [{ result: "data" }],
        metadata: { timestamp: Date.now() },
        status: "completed" as const,
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts all valid statuses", () => {
      const base = {
        conversationId: validConversationId,
        role: "assistant" as const,
        content: "msg",
      };

      expect(createMessageSchema.safeParse({ ...base, status: "submitted" }).success).toBe(true);
      expect(createMessageSchema.safeParse({ ...base, status: "streaming" }).success).toBe(true);
      expect(createMessageSchema.safeParse({ ...base, status: "completed" }).success).toBe(true);
      expect(createMessageSchema.safeParse({ ...base, status: "error" }).success).toBe(true);
    });
  });

  describe("invalid message creation", () => {
    const validConversationId = "123e4567-e89b-12d3-a456-426614174000";

    it("requires conversationId", () => {
      const missing = {
        role: "user" as const,
        content: "Hello",
      };

      const result = createMessageSchema.safeParse(missing);
      expect(result.success).toBe(false);
    });

    it("requires valid UUID for conversationId", () => {
      const invalid = {
        conversationId: "not-a-uuid",
        role: "user" as const,
        content: "Hello",
      };

      const result = createMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("requires role", () => {
      const missing = {
        conversationId: validConversationId,
        content: "Hello",
      };

      const result = createMessageSchema.safeParse(missing);
      expect(result.success).toBe(false);
    });

    it("rejects invalid role", () => {
      const invalid = {
        conversationId: validConversationId,
        role: "moderator",
        content: "Hello",
      };

      const result = createMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects content longer than 10,000 characters", () => {
      const invalid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "A".repeat(10_001),
      };

      const result = createMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("accepts content exactly 10,000 characters", () => {
      const valid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "A".repeat(10_000),
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty content string", () => {
      const invalid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "",
      };

      const result = createMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid status", () => {
      const invalid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "Hello",
        status: "pending",
      };

      const result = createMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("optional content/parts handling", () => {
    const validConversationId = "123e4567-e89b-12d3-a456-426614174000";

    it("allows message without content if parts provided", () => {
      const valid = {
        conversationId: validConversationId,
        role: "user" as const,
        parts: [{ type: "image" }],
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("allows message without parts if content provided", () => {
      const valid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "Hello",
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("allows message with both content and parts", () => {
      const valid = {
        conversationId: validConversationId,
        role: "user" as const,
        content: "Check this",
        parts: [{ type: "file" }],
      };

      const result = createMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
