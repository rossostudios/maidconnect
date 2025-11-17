import { describe, expect, it } from "vitest";
import type { Conversation } from "@/components/messaging/MessagingInterface";
import {
  getConversationUnreadCount,
  getTotalUnreadCount,
  normalizeUser,
  updateConversationUnreadCount,
} from "../messagingUtils";

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockConversation: Conversation = {
  id: "conv-123",
  professional: {
    profile_id: "prof-456",
    profile: {
      full_name: "Maria Garcia",
      avatar_url: "https://example.com/maria.jpg",
    },
  },
  customer: {
    id: "cust-789",
    full_name: "Juan Pérez",
    avatar_url: "https://example.com/juan.jpg",
  },
  customer_unread_count: 3,
  professional_unread_count: 5,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-11T12:00:00Z",
  last_message: {
    id: "msg-001",
    content: "Hello!",
    sender_type: "customer",
    created_at: "2025-01-11T12:00:00Z",
  },
};

const mockConversation2: Conversation = {
  id: "conv-456",
  professional: {
    profile_id: "prof-789",
    profile: {
      full_name: "Carlos Rodríguez",
      avatar_url: "https://example.com/carlos.jpg",
    },
  },
  customer: {
    id: "cust-789",
    full_name: "Juan Pérez",
    avatar_url: "https://example.com/juan.jpg",
  },
  customer_unread_count: 0,
  professional_unread_count: 2,
  created_at: "2025-01-02T00:00:00Z",
  updated_at: "2025-01-10T15:00:00Z",
  last_message: {
    id: "msg-002",
    content: "Thanks!",
    sender_type: "professional",
    created_at: "2025-01-10T15:00:00Z",
  },
};

const mockConversation3: Conversation = {
  id: "conv-789",
  professional: {
    profile_id: "prof-123",
    profile: {
      full_name: "Ana Martínez",
      avatar_url: "https://example.com/ana.jpg",
    },
  },
  customer: {
    id: "cust-456",
    full_name: "Sofia Lopez",
    avatar_url: "https://example.com/sofia.jpg",
  },
  customer_unread_count: 7,
  professional_unread_count: 0,
  created_at: "2025-01-03T00:00:00Z",
  updated_at: "2025-01-09T10:00:00Z",
  last_message: {
    id: "msg-003",
    content: "See you tomorrow",
    sender_type: "customer",
    created_at: "2025-01-09T10:00:00Z",
  },
};

// ============================================================================
// NORMALIZE USER
// ============================================================================

describe("normalizeUser", () => {
  describe("customer role", () => {
    it("returns professional user data when called by customer", () => {
      const result = normalizeUser(mockConversation, "customer");

      expect(result.id).toBe("prof-456");
      expect(result.full_name).toBe("Maria Garcia");
      expect(result.avatar_url).toBe("https://example.com/maria.jpg");
    });

    it("returns correct professional for different conversation", () => {
      const result = normalizeUser(mockConversation2, "customer");

      expect(result.id).toBe("prof-789");
      expect(result.full_name).toBe("Carlos Rodríguez");
      expect(result.avatar_url).toBe("https://example.com/carlos.jpg");
    });

    it("handles professional without avatar", () => {
      const convWithoutAvatar: Conversation = {
        ...mockConversation,
        professional: {
          profile_id: "prof-000",
          profile: {
            full_name: "No Avatar Pro",
            avatar_url: undefined,
          },
        },
      };

      const result = normalizeUser(convWithoutAvatar, "customer");

      expect(result.id).toBe("prof-000");
      expect(result.full_name).toBe("No Avatar Pro");
      expect(result.avatar_url).toBeUndefined();
    });
  });

  describe("professional role", () => {
    it("returns customer user data when called by professional", () => {
      const result = normalizeUser(mockConversation, "professional");

      expect(result.id).toBe("cust-789");
      expect(result.full_name).toBe("Juan Pérez");
      expect(result.avatar_url).toBe("https://example.com/juan.jpg");
    });

    it("returns correct customer for different conversation", () => {
      const result = normalizeUser(mockConversation3, "professional");

      expect(result.id).toBe("cust-456");
      expect(result.full_name).toBe("Sofia Lopez");
      expect(result.avatar_url).toBe("https://example.com/sofia.jpg");
    });

    it("handles customer without avatar", () => {
      const convWithoutAvatar: Conversation = {
        ...mockConversation,
        customer: {
          id: "cust-000",
          full_name: "No Avatar Customer",
          avatar_url: undefined,
        },
      };

      const result = normalizeUser(convWithoutAvatar, "professional");

      expect(result.id).toBe("cust-000");
      expect(result.full_name).toBe("No Avatar Customer");
      expect(result.avatar_url).toBeUndefined();
    });
  });

  describe("return structure", () => {
    it("returns object with all required fields", () => {
      const result = normalizeUser(mockConversation, "customer");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("full_name");
      expect(typeof result.id).toBe("string");
      expect(typeof result.full_name).toBe("string");
    });

    it("avatar_url is optional", () => {
      const result = normalizeUser(mockConversation, "customer");

      if (result.avatar_url !== undefined) {
        expect(typeof result.avatar_url).toBe("string");
      }
    });
  });
});

// ============================================================================
// TOTAL UNREAD COUNT
// ============================================================================

describe("getTotalUnreadCount", () => {
  const conversations = [mockConversation, mockConversation2, mockConversation3];

  describe("customer role", () => {
    it("sums customer_unread_count from all conversations", () => {
      // Conv1: 3, Conv2: 0, Conv3: 7 = 10
      const result = getTotalUnreadCount(conversations, "customer");
      expect(result).toBe(10);
    });

    it("returns 0 for empty conversations array", () => {
      const result = getTotalUnreadCount([], "customer");
      expect(result).toBe(0);
    });

    it("returns 0 when all customer unread counts are 0", () => {
      const noUnreadConvs = conversations.map((conv) => ({
        ...conv,
        customer_unread_count: 0,
      }));
      const result = getTotalUnreadCount(noUnreadConvs, "customer");
      expect(result).toBe(0);
    });

    it("handles single conversation", () => {
      const result = getTotalUnreadCount([mockConversation], "customer");
      expect(result).toBe(3);
    });
  });

  describe("professional role", () => {
    it("sums professional_unread_count from all conversations", () => {
      // Conv1: 5, Conv2: 2, Conv3: 0 = 7
      const result = getTotalUnreadCount(conversations, "professional");
      expect(result).toBe(7);
    });

    it("returns 0 for empty conversations array", () => {
      const result = getTotalUnreadCount([], "professional");
      expect(result).toBe(0);
    });

    it("returns 0 when all professional unread counts are 0", () => {
      const noUnreadConvs = conversations.map((conv) => ({
        ...conv,
        professional_unread_count: 0,
      }));
      const result = getTotalUnreadCount(noUnreadConvs, "professional");
      expect(result).toBe(0);
    });

    it("handles single conversation", () => {
      const result = getTotalUnreadCount([mockConversation], "professional");
      expect(result).toBe(5);
    });
  });

  describe("edge cases", () => {
    it("handles large unread counts", () => {
      const largeUnreadConv: Conversation = {
        ...mockConversation,
        customer_unread_count: 999,
        professional_unread_count: 1000,
      };
      const customerResult = getTotalUnreadCount([largeUnreadConv], "customer");
      const professionalResult = getTotalUnreadCount([largeUnreadConv], "professional");

      expect(customerResult).toBe(999);
      expect(professionalResult).toBe(1000);
    });

    it("returns correct sum for many conversations", () => {
      const manyConvs = Array.from({ length: 10 }, (_, i) => ({
        ...mockConversation,
        id: `conv-${i}`,
        customer_unread_count: i + 1,
        professional_unread_count: i + 2,
      }));

      // Sum 1+2+3+...+10 = 55
      const customerResult = getTotalUnreadCount(manyConvs, "customer");
      expect(customerResult).toBe(55);

      // Sum 2+3+4+...+11 = 65
      const professionalResult = getTotalUnreadCount(manyConvs, "professional");
      expect(professionalResult).toBe(65);
    });
  });
});

// ============================================================================
// CONVERSATION UNREAD COUNT
// ============================================================================

describe("getConversationUnreadCount", () => {
  describe("customer role", () => {
    it("returns customer_unread_count for customer role", () => {
      const result = getConversationUnreadCount(mockConversation, "customer");
      expect(result).toBe(3);
    });

    it("returns 0 when customer has no unread messages", () => {
      const result = getConversationUnreadCount(mockConversation2, "customer");
      expect(result).toBe(0);
    });

    it("returns correct count for different conversation", () => {
      const result = getConversationUnreadCount(mockConversation3, "customer");
      expect(result).toBe(7);
    });
  });

  describe("professional role", () => {
    it("returns professional_unread_count for professional role", () => {
      const result = getConversationUnreadCount(mockConversation, "professional");
      expect(result).toBe(5);
    });

    it("returns 0 when professional has no unread messages", () => {
      const result = getConversationUnreadCount(mockConversation3, "professional");
      expect(result).toBe(0);
    });

    it("returns correct count for different conversation", () => {
      const result = getConversationUnreadCount(mockConversation2, "professional");
      expect(result).toBe(2);
    });
  });

  describe("return type", () => {
    it("always returns a number", () => {
      const customerResult = getConversationUnreadCount(mockConversation, "customer");
      const professionalResult = getConversationUnreadCount(mockConversation, "professional");

      expect(typeof customerResult).toBe("number");
      expect(typeof professionalResult).toBe("number");
    });

    it("never returns negative numbers", () => {
      const customerResult = getConversationUnreadCount(mockConversation, "customer");
      const professionalResult = getConversationUnreadCount(mockConversation, "professional");

      expect(customerResult).toBeGreaterThanOrEqual(0);
      expect(professionalResult).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// UPDATE CONVERSATION UNREAD COUNT
// ============================================================================

describe("updateConversationUnreadCount", () => {
  const conversations = [mockConversation, mockConversation2, mockConversation3];

  describe("customer role", () => {
    it("updates customer_unread_count for matching conversation", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 10);

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.customer_unread_count).toBe(10);
    });

    it("preserves professional_unread_count when updating customer count", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 10);

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.professional_unread_count).toBe(5); // Original value
    });

    it("does not modify other conversations", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 10);

      const otherConv = result.find((c) => c.id === "conv-456");
      expect(otherConv?.customer_unread_count).toBe(0); // Original value
      expect(otherConv?.professional_unread_count).toBe(2); // Original value
    });

    it("defaults to 0 when newCount not provided", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer");

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.customer_unread_count).toBe(0);
    });

    it("can set count to explicit 0", () => {
      const result = updateConversationUnreadCount(conversations, "conv-789", "customer", 0);

      const updatedConv = result.find((c) => c.id === "conv-789");
      expect(updatedConv?.customer_unread_count).toBe(0);
    });
  });

  describe("professional role", () => {
    it("updates professional_unread_count for matching conversation", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "professional", 15);

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.professional_unread_count).toBe(15);
    });

    it("preserves customer_unread_count when updating professional count", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "professional", 15);

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.customer_unread_count).toBe(3); // Original value
    });

    it("does not modify other conversations", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "professional", 15);

      const otherConv = result.find((c) => c.id === "conv-789");
      expect(otherConv?.customer_unread_count).toBe(7); // Original value
      expect(otherConv?.professional_unread_count).toBe(0); // Original value
    });

    it("defaults to 0 when newCount not provided", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "professional");

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.professional_unread_count).toBe(0);
    });

    it("can set count to explicit 0", () => {
      const result = updateConversationUnreadCount(conversations, "conv-456", "professional", 0);

      const updatedConv = result.find((c) => c.id === "conv-456");
      expect(updatedConv?.professional_unread_count).toBe(0);
    });
  });

  describe("immutability", () => {
    it("returns new array, does not mutate original", () => {
      const original = [...conversations];
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 99);

      expect(result).not.toBe(conversations);
      expect(conversations[0].customer_unread_count).toBe(3); // Original unchanged
      expect(original[0]).toBe(conversations[0]); // Original array unchanged
    });

    it("returns new conversation objects", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 99);

      const originalConv = conversations.find((c) => c.id === "conv-123");
      const updatedConv = result.find((c) => c.id === "conv-123");

      expect(updatedConv).not.toBe(originalConv);
    });

    it("preserves all other conversation properties", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 99);

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.id).toBe(mockConversation.id);
      expect(updatedConv?.professional).toEqual(mockConversation.professional);
      expect(updatedConv?.customer).toEqual(mockConversation.customer);
      expect(updatedConv?.created_at).toBe(mockConversation.created_at);
      expect(updatedConv?.updated_at).toBe(mockConversation.updated_at);
      expect(updatedConv?.last_message).toEqual(mockConversation.last_message);
    });
  });

  describe("edge cases", () => {
    it("returns empty array when given empty array", () => {
      const result = updateConversationUnreadCount([], "conv-123", "customer", 5);
      expect(result).toEqual([]);
    });

    it("returns same array when conversation ID not found", () => {
      const result = updateConversationUnreadCount(conversations, "conv-999", "customer", 5);

      expect(result.length).toBe(conversations.length);
      // All conversations remain unchanged
      for (const conv of result) {
        const original = conversations.find((c) => c.id === conv.id);
        expect(conv.customer_unread_count).toBe(original?.customer_unread_count);
        expect(conv.professional_unread_count).toBe(original?.professional_unread_count);
      }
    });

    it("handles large unread counts", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 9999);

      const updatedConv = result.find((c) => c.id === "conv-123");
      expect(updatedConv?.customer_unread_count).toBe(9999);
    });

    it("maintains array length", () => {
      const result = updateConversationUnreadCount(conversations, "conv-123", "customer", 5);
      expect(result.length).toBe(conversations.length);
    });

    it("maintains conversation order", () => {
      const result = updateConversationUnreadCount(conversations, "conv-456", "customer", 5);

      expect(result[0].id).toBe(conversations[0].id);
      expect(result[1].id).toBe(conversations[1].id);
      expect(result[2].id).toBe(conversations[2].id);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("Messaging utils integration", () => {
  it("complete workflow: update then get unread count", () => {
    const conversations = [mockConversation, mockConversation2];

    // Update conversation
    const updated = updateConversationUnreadCount(conversations, "conv-123", "customer", 10);

    // Get specific conversation count
    const updatedConv = updated.find((c) => c.id === "conv-123");
    if (!updatedConv) throw new Error("Conversation not found");

    const count = getConversationUnreadCount(updatedConv, "customer");
    expect(count).toBe(10);

    // Get total count
    const total = getTotalUnreadCount(updated, "customer");
    expect(total).toBe(10); // conv-123: 10, conv-456: 0
  });

  it("complete workflow: normalize users and track unread", () => {
    const conversations = [mockConversation, mockConversation2];

    // Customer normalizes users to see professionals
    const prof1 = normalizeUser(conversations[0], "customer");
    const prof2 = normalizeUser(conversations[1], "customer");

    expect(prof1.full_name).toBe("Maria Garcia");
    expect(prof2.full_name).toBe("Carlos Rodríguez");

    // Customer checks their total unread
    const totalUnread = getTotalUnreadCount(conversations, "customer");
    expect(totalUnread).toBe(3); // conv-123: 3, conv-456: 0
  });

  it("role-specific isolation: customer and professional have separate counts", () => {
    const conversations = [mockConversation];

    // Customer unread
    const customerUnread = getTotalUnreadCount(conversations, "customer");
    expect(customerUnread).toBe(3);

    // Professional unread (different value)
    const professionalUnread = getTotalUnreadCount(conversations, "professional");
    expect(professionalUnread).toBe(5);

    // Update customer count
    const updated = updateConversationUnreadCount(conversations, "conv-123", "customer", 0);

    // Customer count changed
    const newCustomerUnread = getTotalUnreadCount(updated, "customer");
    expect(newCustomerUnread).toBe(0);

    // Professional count unchanged
    const newProfessionalUnread = getTotalUnreadCount(updated, "professional");
    expect(newProfessionalUnread).toBe(5);
  });
});
