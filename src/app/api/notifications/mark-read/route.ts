/**
 * REFACTORED VERSION - Mark notification(s) as read
 * POST /api/notifications/mark-read
 *
 * BEFORE: 66 lines
 * AFTER: 40 lines (39% reduction)
 */

import { z } from "zod";
import { ok, withAuth } from "@/lib/api";
import { ValidationError } from "@/lib/errors";

const markReadSchema = z
  .object({
    notificationIds: z.array(z.string().uuid()).optional(),
    markAllRead: z.boolean().optional(),
  })
  .refine((data) => data.notificationIds || data.markAllRead, {
    message: "Must provide either notificationIds or markAllRead",
  });

export const POST = withAuth(async ({ user, supabase }, request: Request) => {
  // Parse and validate request body
  const body = await request.json();
  const { notificationIds, markAllRead } = markReadSchema.parse(body);

  if (markAllRead) {
    // Mark all unread notifications as read
    const { error: markAllError } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (markAllError) {
      throw new ValidationError("Failed to mark notifications as read");
    }

    return ok({ markedAll: true }, "All notifications marked as read");
  }

  // Mark specific notifications as read
  const { error: markError } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .in("id", notificationIds!)
    .eq("user_id", user.id);

  if (markError) {
    throw new ValidationError("Failed to mark notifications as read");
  }

  return ok(
    { marked: notificationIds!.length },
    `${notificationIds!.length} notifications marked as read`
  );
});
