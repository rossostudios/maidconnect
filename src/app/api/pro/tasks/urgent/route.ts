/**
 * Urgent Tasks API
 * GET /api/pro/tasks/urgent - Get professional's urgent tasks requiring action
 *
 * Returns tasks grouped by urgency level:
 * - urgent: Immediate action required (bookings starting soon, in-progress)
 * - important: Action needed today (pending requests, unread messages)
 * - normal: Can wait (reviews to complete, upcoming bookings)
 *
 * Each task includes:
 * - type, title, subtitle
 * - urgency level
 * - action button metadata (label, href)
 * - optional: customerName, scheduledTime, timeUntil
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type UrgencyLevel = "urgent" | "important" | "normal";

type TaskType =
  | "booking_in_progress"
  | "booking_starting_soon"
  | "booking_today"
  | "pending_request"
  | "unread_messages"
  | "pending_review"
  | "upcoming_booking";

type UrgentTask = {
  id: string;
  type: TaskType;
  title: string;
  subtitle?: string;
  customerName?: string;
  scheduledTime?: string;
  timeUntil?: string;
  urgency: UrgencyLevel;
  actionLabel: string;
  actionHref: string;
  bookingId?: string;
};

type TaskGroup = {
  level: UrgencyLevel;
  label: string;
  tasks: UrgentTask[];
};

function getTimeUntil(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "Started";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

function formatScheduledTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatScheduledDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "professional") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const now = new Date();
    const today = now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all relevant bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(
        `id, status, scheduled_start, scheduled_end, duration_minutes,
         service_name, customer:profiles!customer_id(id, full_name)`
      )
      .eq("professional_id", user.id)
      .in("status", ["pending", "confirmed", "in_progress", "completed"])
      .gte("scheduled_start", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .order("scheduled_start", { ascending: true });

    const bookings = bookingsData || [];

    // Get unread message count
    const { count: unreadMessagesCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    // Get pending customer reviews count
    const { data: completedBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("professional_id", user.id)
      .eq("status", "completed")
      .order("scheduled_start", { ascending: false })
      .limit(10);

    const completedIds = completedBookings?.map((b) => b.id) || [];

    let pendingReviewsCount = 0;
    if (completedIds.length > 0) {
      const { data: reviewedBookings } = await supabase
        .from("customer_reviews")
        .select("booking_id")
        .eq("professional_id", user.id)
        .in("booking_id", completedIds);

      const reviewedIds = new Set(reviewedBookings?.map((r) => r.booking_id) || []);
      pendingReviewsCount = completedIds.filter((id) => !reviewedIds.has(id)).length;
    }

    // Build tasks
    const tasks: UrgentTask[] = [];

    // Process bookings
    for (const booking of bookings) {
      const customer = booking.customer as { id: string; full_name?: string } | null;

      // In-progress bookings (URGENT)
      if (booking.status === "in_progress") {
        tasks.push({
          id: `in-progress-${booking.id}`,
          type: "booking_in_progress",
          title: "Booking in progress",
          subtitle: booking.service_name || "Service",
          customerName: customer?.full_name,
          timeUntil: "Now",
          urgency: "urgent",
          actionLabel: "Complete Check-out",
          actionHref: `/dashboard/pro/bookings/${booking.id}`,
          bookingId: booking.id,
        });
        continue;
      }

      // Pending requests (IMPORTANT)
      if (booking.status === "pending") {
        tasks.push({
          id: `pending-${booking.id}`,
          type: "pending_request",
          title: "Booking request",
          subtitle: booking.service_name || "New service request",
          customerName: customer?.full_name,
          scheduledTime: booking.scheduled_start
            ? formatScheduledDate(booking.scheduled_start)
            : undefined,
          urgency: "important",
          actionLabel: "Respond",
          actionHref: `/dashboard/pro/bookings/${booking.id}`,
          bookingId: booking.id,
        });
        continue;
      }

      // Confirmed bookings
      if (booking.status === "confirmed" && booking.scheduled_start) {
        const bookingDate = new Date(booking.scheduled_start);
        const isToday = bookingDate.toDateString() === today;
        const isTomorrow = bookingDate.toDateString() === tomorrow.toDateString();
        const diffMins = (bookingDate.getTime() - now.getTime()) / (1000 * 60);

        // Starting within 30 minutes (URGENT)
        if (diffMins > 0 && diffMins < 30) {
          tasks.push({
            id: `starting-soon-${booking.id}`,
            type: "booking_starting_soon",
            title: "Starting soon",
            subtitle: booking.service_name || "Service",
            customerName: customer?.full_name,
            scheduledTime: formatScheduledTime(booking.scheduled_start),
            timeUntil: getTimeUntil(booking.scheduled_start),
            urgency: "urgent",
            actionLabel: "View Details",
            actionHref: `/dashboard/pro/bookings/${booking.id}`,
            bookingId: booking.id,
          });
        }
        // Today's bookings starting in 30min-2hrs (IMPORTANT)
        else if (isToday && diffMins > 30 && diffMins < 120) {
          tasks.push({
            id: `today-${booking.id}`,
            type: "booking_today",
            title: `Today: ${booking.service_name || "Service"}`,
            subtitle: `with ${customer?.full_name || "Customer"}`,
            customerName: customer?.full_name,
            scheduledTime: formatScheduledTime(booking.scheduled_start),
            timeUntil: getTimeUntil(booking.scheduled_start),
            urgency: "important",
            actionLabel: "View Details",
            actionHref: `/dashboard/pro/bookings/${booking.id}`,
            bookingId: booking.id,
          });
        }
        // Later today or tomorrow (NORMAL)
        else if (isToday || isTomorrow) {
          tasks.push({
            id: `upcoming-${booking.id}`,
            type: "upcoming_booking",
            title: isToday
              ? `Later today: ${booking.service_name || "Service"}`
              : `Tomorrow: ${booking.service_name || "Service"}`,
            subtitle: `with ${customer?.full_name || "Customer"}`,
            customerName: customer?.full_name,
            scheduledTime: formatScheduledTime(booking.scheduled_start),
            timeUntil: getTimeUntil(booking.scheduled_start),
            urgency: "normal",
            actionLabel: "View Details",
            actionHref: `/dashboard/pro/bookings/${booking.id}`,
            bookingId: booking.id,
          });
        }
      }
    }

    // Add unread messages task
    if (unreadMessagesCount && unreadMessagesCount > 0) {
      tasks.push({
        id: "unread-messages",
        type: "unread_messages",
        title: `${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? "s" : ""}`,
        subtitle: "Respond to keep customers engaged",
        urgency: unreadMessagesCount > 3 ? "urgent" : "important",
        actionLabel: "View Messages",
        actionHref: "/dashboard/pro/messages",
      });
    }

    // Add pending reviews task
    if (pendingReviewsCount > 0) {
      tasks.push({
        id: "pending-reviews",
        type: "pending_review",
        title: `${pendingReviewsCount} customer${pendingReviewsCount > 1 ? "s" : ""} to rate`,
        subtitle: "Rate customers from completed bookings",
        urgency: "normal",
        actionLabel: "Rate Customers",
        actionHref: "/dashboard/pro/bookings",
      });
    }

    // Sort by urgency
    const urgencyOrder: Record<UrgencyLevel, number> = { urgent: 0, important: 1, normal: 2 };
    tasks.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    // Group by urgency level
    const groups: TaskGroup[] = [
      {
        level: "urgent",
        label: "Requires Action",
        tasks: tasks.filter((t) => t.urgency === "urgent"),
      },
      {
        level: "important",
        label: "Important",
        tasks: tasks.filter((t) => t.urgency === "important"),
      },
      {
        level: "normal",
        label: "Upcoming",
        tasks: tasks.filter((t) => t.urgency === "normal"),
      },
    ].filter((group) => group.tasks.length > 0);

    // Summary counts
    const summary = {
      total: tasks.length,
      urgent: tasks.filter((t) => t.urgency === "urgent").length,
      important: tasks.filter((t) => t.urgency === "important").length,
      normal: tasks.filter((t) => t.urgency === "normal").length,
    };

    return NextResponse.json({
      success: true,
      summary,
      groups,
      tasks,
    });
  } catch (error) {
    logger.error("[Urgent Tasks API] Failed to get tasks", {
      professionalId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json({ error: "Failed to fetch urgent tasks" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
