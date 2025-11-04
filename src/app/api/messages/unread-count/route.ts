/**
 * REFACTORED VERSION - Get unread message count
 * GET /api/messages/unread-count
 *
 * BEFORE: 50 lines (1 handler)
 * AFTER: 36 lines (1 handler) (28% reduction)
 */

import { withAuth, ok } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

/**
 * Get unread message count for current user
 */
export const GET = withAuth(async ({ user, supabase }) => {
  // Get user's role to determine which unread count to sum
  const isCustomer = user.user_metadata?.role === "customer";
  const isProfessional = user.user_metadata?.role === "professional";

  if (!(isCustomer || isProfessional)) {
    return ok({ unreadCount: 0 });
  }

  // Fetch conversations and sum unread counts
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("customer_unread_count, professional_unread_count")
    .or(`customer_id.eq.${user.id},professional_id.eq.${user.id}`);

  if (error) {
    throw new ValidationError("Failed to fetch unread count");
  }

  // Sum up the appropriate unread count based on user role
  const totalUnread = (conversations || []).reduce((sum, conv) => {
    if (isCustomer) {
      return sum + (conv.customer_unread_count || 0);
    }
    return sum + (conv.professional_unread_count || 0);
  }, 0);

  return ok({ unreadCount: totalUnread });
});
