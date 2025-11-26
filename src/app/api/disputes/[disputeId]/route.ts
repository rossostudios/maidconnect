/**
 * Dispute Detail API Route
 * GET: Get dispute details
 * PATCH: Update dispute status (admin only)
 */

import { z } from "zod";
import { ok, withAdmin, withAuth, withRateLimit } from "@/lib/api";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  notifyCustomerDisputeResolved,
  notifyProfessionalDisputeResolved,
} from "@/lib/notifications";

type RouteContext = { params: Promise<{ disputeId: string }> };

const updateDisputeSchema = z.object({
  status: z.enum(["pending", "investigating", "resolved", "dismissed"]),
  resolution_notes: z.string().max(2000).optional(),
});

// Lookup object for status action messages (Biome noNestedTernary fix)
type DisputeStatus = "pending" | "investigating" | "resolved" | "dismissed";
const STATUS_ACTION_MESSAGES: Record<DisputeStatus, string> = {
  pending: "updated",
  investigating: "updated",
  resolved: "resolved",
  dismissed: "dismissed",
};

// GET - Get dispute details
export const GET = withRateLimit(
  withAuth(async ({ user, supabase }, _request: Request, { params }: RouteContext) => {
    const { disputeId } = await params;

    // Get user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Fetch dispute with booking details
    const { data: dispute, error } = await supabase
      .from("booking_disputes")
      .select(
        `
        id,
        booking_id,
        customer_id,
        professional_id,
        reason,
        description,
        status,
        resolution_notes,
        resolved_by,
        created_at,
        updated_at,
        booking:bookings (
          id,
          service_name,
          scheduled_start,
          completed_at,
          amount_captured,
          currency
        ),
        customer:profiles!booking_disputes_customer_id_fkey (
          full_name,
          email
        ),
        professional:profiles!booking_disputes_professional_id_fkey (
          full_name,
          email
        )
      `
      )
      .eq("id", disputeId)
      .single();

    if (error || !dispute) {
      throw new NotFoundError("Dispute not found");
    }

    // Check authorization
    const isAdmin = profile?.role === "admin";
    const isCustomer = dispute.customer_id === user.id;
    const isProfessional = dispute.professional_id === user.id;

    if (!(isAdmin || isCustomer || isProfessional)) {
      throw new NotFoundError("Dispute not found"); // Don't reveal existence
    }

    return ok({ dispute });
  }),
  "api"
);

// PATCH - Update dispute status (admin only)
export const PATCH = withRateLimit(
  withAdmin(async ({ user, supabase }, request: Request, { params }: RouteContext) => {
    const { disputeId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateDisputeSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid request data");
    }

    const { status, resolution_notes } = parsed.data;

    // Fetch existing dispute
    const { data: existingDispute, error: fetchError } = await supabase
      .from("booking_disputes")
      .select(
        `
        id,
        status,
        customer_id,
        professional_id,
        reason,
        booking:bookings (
          id,
          service_name
        ),
        customer:profiles!booking_disputes_customer_id_fkey (
          full_name
        ),
        professional:profiles!booking_disputes_professional_id_fkey (
          full_name
        )
      `
      )
      .eq("id", disputeId)
      .single();

    if (fetchError || !existingDispute) {
      throw new NotFoundError("Dispute not found");
    }

    // Update dispute
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes;
    }

    // If resolving or dismissing, record who resolved it
    if (status === "resolved" || status === "dismissed") {
      updateData.resolved_by = user.id;
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: updatedDispute, error: updateError } = await supabase
      .from("booking_disputes")
      .update(updateData)
      .eq("id", disputeId)
      .select("id, status, resolution_notes, resolved_by, updated_at")
      .single();

    if (updateError || !updatedDispute) {
      throw new ValidationError(updateError?.message || "Failed to update dispute");
    }

    // Send notifications if dispute is resolved or dismissed
    if (status === "resolved" || status === "dismissed") {
      const booking = existingDispute.booking as { service_name: string } | null;
      const customer = existingDispute.customer as { full_name: string } | null;
      const _professional = existingDispute.professional as { full_name: string } | null;

      // Notify customer
      await notifyCustomerDisputeResolved(existingDispute.customer_id, {
        id: disputeId,
        bookingId: (existingDispute.booking as { id: string } | null)?.id || "",
        status,
        serviceName: booking?.service_name || "Service",
        resolution: resolution_notes || undefined,
      }).catch((err) => console.error("Failed to notify customer:", err));

      // Notify professional
      await notifyProfessionalDisputeResolved(existingDispute.professional_id, {
        id: disputeId,
        bookingId: (existingDispute.booking as { id: string } | null)?.id || "",
        status,
        serviceName: booking?.service_name || "Service",
        customerName: customer?.full_name || "Customer",
        resolution: resolution_notes || undefined,
      }).catch((err) => console.error("Failed to notify professional:", err));
    }

    return ok(
      { dispute: updatedDispute },
      `Dispute ${STATUS_ACTION_MESSAGES[status]} successfully`
    );
  }),
  "api"
);
