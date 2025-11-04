/**
 * Utility functions for messaging operations
 */

import type { Conversation } from "@/components/messaging/messaging-interface";

type NormalizedUser = {
  id: string;
  full_name: string;
  avatar_url?: string;
};

/**
 * Normalize user data from conversation based on role
 * Returns the "other" user in the conversation
 */
export function normalizeUser(
  conversation: Conversation,
  userRole: "customer" | "professional"
): NormalizedUser {
  if (userRole === "customer") {
    // Customer wants to see professional
    return {
      id: conversation.professional.profile_id,
      full_name: conversation.professional.profile.full_name,
      avatar_url: conversation.professional.profile.avatar_url,
    };
  }
  // Professional wants to see customer
  return conversation.customer;
}

/**
 * Calculate total unread count for a user
 */
export function getTotalUnreadCount(
  conversations: Conversation[],
  userRole: "customer" | "professional"
): number {
  return conversations.reduce(
    (sum, conv) =>
      sum + (userRole === "customer" ? conv.customer_unread_count : conv.professional_unread_count),
    0
  );
}

/**
 * Get unread count for a specific conversation
 */
export function getConversationUnreadCount(
  conversation: Conversation,
  userRole: "customer" | "professional"
): number {
  return userRole === "customer"
    ? conversation.customer_unread_count
    : conversation.professional_unread_count;
}

/**
 * Update conversation unread count locally (optimistic update)
 */
export function updateConversationUnreadCount(
  conversations: Conversation[],
  conversationId: string,
  userRole: "customer" | "professional",
  newCount = 0
): Conversation[] {
  return conversations.map((conv) =>
    conv.id === conversationId
      ? {
          ...conv,
          customer_unread_count: userRole === "customer" ? newCount : conv.customer_unread_count,
          professional_unread_count:
            userRole === "professional" ? newCount : conv.professional_unread_count,
        }
      : conv
  );
}
