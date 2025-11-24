import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { sanitizeHTML } from "@/lib/utils/sanitize";

type BulkMessageBody = {
  user_ids: string[];
  subject: string;
  message: string;
};

type OperationResult = {
  userId: string;
  success: boolean;
  error?: string;
};

/**
 * Bulk Send Messages
 * POST /api/admin/bulk/message
 *
 * Sends direct messages to multiple users in a single operation.
 * Messages are sanitized for security before being sent.
 *
 * Body:
 * - user_ids: string[] (required, max 100 users)
 * - subject: string (required)
 * - message: string (required, HTML will be sanitized)
 *
 * Rate Limit: 5 requests per minute (admin tier)
 */
async function handleBulkMessage(request: Request) {
  try {
    // Verify admin access
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const body = (await request.json()) as BulkMessageBody;

    // Validate request body
    if (!(body.user_ids && Array.isArray(body.user_ids)) || body.user_ids.length === 0) {
      return NextResponse.json({ error: "user_ids array is required" }, { status: 400 });
    }

    if (body.user_ids.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 users can receive messages at once" },
        { status: 400 }
      );
    }

    if (!body.subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Sanitize message content once
    const sanitizedMessage = sanitizeHTML(body.message);

    const results: OperationResult[] = [];
    let successful = 0;
    let failed = 0;

    // Process each user
    for (const userId of body.user_ids) {
      try {
        // Verify user exists
        const { data: user, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();

        if (userError || !user) {
          results.push({
            userId,
            success: false,
            error: "User not found",
          });
          failed++;
          continue;
        }

        // Create admin message record
        const { data: adminMessage, error: messageError } = await supabase
          .from("admin_messages")
          .insert({
            user_id: userId,
            admin_id: admin.id,
            subject: body.subject,
            message: sanitizedMessage,
            priority: "normal",
            sent_at: new Date().toISOString(),
            status: "sent",
          })
          .select()
          .single();

        if (messageError) {
          results.push({
            userId,
            success: false,
            error: "Failed to create message",
          });
          failed++;
          continue;
        }

        // Create notification
        try {
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "admin_message",
            title: `Admin: ${body.subject}`,
            message: sanitizedMessage,
            priority: "normal",
            metadata: {
              admin_message_id: adminMessage.id,
              admin_id: admin.id,
              bulk_operation: true,
            },
          });
        } catch (notificationError) {
          // Log but don't fail the operation if notification creation fails
          console.warn(
            `[Admin] Failed to create notification for user ${userId}:`,
            notificationError
          );
        }

        // Create audit log (only for first 10 messages to avoid excessive logs)
        if (successful < 10) {
          await createAuditLog({
            adminId: admin.id,
            actionType: "send_message",
            targetUserId: userId,
            targetResourceType: "admin_message",
            targetResourceId: adminMessage.id,
            details: {
              subject: body.subject,
              bulk_operation: true,
            },
            notes: `Bulk message: ${body.subject}`,
          });
        }

        results.push({
          userId,
          success: true,
        });
        successful++;
      } catch (error) {
        console.error(`[Admin] Failed to send message to user ${userId}:`, error);
        results.push({
          userId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        failed++;
      }
    }

    // Create summary audit log
    await createAuditLog({
      adminId: admin.id,
      actionType: "bulk_send_message",
      targetUserId: null,
      targetResourceType: "admin_message",
      targetResourceId: null,
      details: {
        total: body.user_ids.length,
        successful,
        failed,
        subject: body.subject,
      },
      notes: `Bulk message sent to ${successful} users: ${body.subject}`,
    });

    // Return summary
    return NextResponse.json({
      success: true,
      total: body.user_ids.length,
      successful,
      failed,
      results,
      errors: results.filter((r) => !r.success).map((r) => ({ userId: r.userId, error: r.error })),
    });
  } catch (error: unknown) {
    console.error("[Admin] Bulk message error:", error);
    const message = error instanceof Error ? error.message : "Failed to process bulk message";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// Apply rate limiting: 5 requests per minute (more restrictive for bulk operations)
export const POST = withRateLimit(handleBulkMessage, "admin", 5);
