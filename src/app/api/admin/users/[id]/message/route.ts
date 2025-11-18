import { NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { sanitizeHTML } from "@/lib/utils/sanitize";

type MessageBody = {
  subject: string;
  message: string;
  priority?: "normal" | "urgent";
  scheduled_at?: string | null;
};

/**
 * Send Direct Message to User
 * POST /api/admin/users/[id]/message
 *
 * Sends a direct message from admin to a specific user.
 * Messages are stored in the database and can be sent immediately or scheduled.
 *
 * Body:
 * - subject: string (required)
 * - message: string (required, HTML content will be sanitized)
 * - priority?: "normal" | "urgent" (optional, default: "normal")
 * - scheduled_at?: string (optional, ISO timestamp for scheduled delivery)
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */
async function handleSendMessage(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id: userId } = await params;
    const body = (await request.json()) as MessageBody;

    // Validate request body
    if (!body.subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Validate scheduled_at if provided
    if (body.scheduled_at) {
      const scheduledDate = new Date(body.scheduled_at);
      if (Number.isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ error: "Invalid scheduled date format" }, { status: 400 });
      }
      if (scheduledDate < new Date()) {
        return NextResponse.json(
          { error: "Scheduled date must be in the future" },
          { status: 400 }
        );
      }
    }

    // Get user and validate
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = authUser?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found - cannot send message" },
        { status: 400 }
      );
    }

    // Sanitize message content
    const sanitizedMessage = sanitizeHTML(body.message);

    // Create admin message record
    const { data: adminMessage, error: messageError } = await supabase
      .from("admin_messages")
      .insert({
        user_id: userId,
        admin_id: admin.id,
        subject: body.subject,
        message: sanitizedMessage,
        priority: body.priority || "normal",
        scheduled_at: body.scheduled_at || null,
        sent_at: body.scheduled_at ? null : new Date().toISOString(),
        status: body.scheduled_at ? "scheduled" : "sent",
      })
      .select()
      .single();

    if (messageError) {
      console.error("[Admin] Failed to create admin message:", messageError);
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
    }

    // If sending immediately, create a notification
    if (!body.scheduled_at) {
      try {
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "admin_message",
          title: `Admin: ${body.subject}`,
          message: sanitizedMessage,
          priority: body.priority === "urgent" ? "high" : "normal",
          metadata: {
            admin_message_id: adminMessage.id,
            admin_id: admin.id,
          },
        });
      } catch (notificationError) {
        // Log but don't fail the request if notification creation fails
        console.warn("[Admin] Failed to create notification:", notificationError);
      }
    }

    // Create audit log
    await createAuditLog({
      adminId: admin.id,
      actionType: "send_message",
      targetUserId: userId,
      targetResourceType: "admin_message",
      targetResourceId: adminMessage.id,
      details: {
        subject: body.subject,
        priority: body.priority || "normal",
        scheduled: !!body.scheduled_at,
        scheduled_at: body.scheduled_at || null,
      },
      notes: `Sent message: ${body.subject}`,
    });

    // TODO: Send email notification to user
    // This can be implemented later with proper email templates
    // For urgent messages, could also trigger push notifications

    return NextResponse.json({
      success: true,
      message: body.scheduled_at ? "Message scheduled successfully" : "Message sent successfully",
      admin_message: {
        id: adminMessage.id,
        subject: adminMessage.subject,
        status: adminMessage.status,
        sent_at: adminMessage.sent_at,
        scheduled_at: adminMessage.scheduled_at,
      },
    });
  } catch (error: any) {
    console.error("[Admin] Send message error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

// Apply rate limiting: 10 requests per minute
export const POST = withRateLimit(handleSendMessage, "admin");
