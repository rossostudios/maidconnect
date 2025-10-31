import { NextRequest, NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Get changelog by ID
 * GET /api/admin/changelog/[id]
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    const { data: changelog, error } = await supabase
      .from("changelogs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching changelog:", error);
      return NextResponse.json({ error: "Changelog not found" }, { status: 404 });
    }

    return NextResponse.json({ changelog });
  } catch (error: any) {
    console.error("Error fetching changelog:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

/**
 * Update changelog
 * PATCH /api/admin/changelog/[id]
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id } = await params;
    const updates = await request.json();

    // Don't allow updating id, created_by, created_at
    const allowedFields = [
      "sprint_number",
      "title",
      "slug",
      "summary",
      "content",
      "categories",
      "tags",
      "target_audience",
      "featured_image_url",
      "visibility",
      "metadata",
    ];

    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // If changing to published, update published_at
    if (updates.visibility === "published") {
      filteredUpdates.published_at = new Date().toISOString();
    }

    const { data: changelog, error } = await supabase
      .from("changelogs")
      .update(filteredUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating changelog:", error);
      return NextResponse.json({ error: "Failed to update changelog" }, { status: 500 });
    }

    // Log audit
    await createAuditLog({
      adminId: admin.id,
      actionType: "other",
      targetResourceType: "changelog",
      targetResourceId: id,
      details: filteredUpdates,
      notes: `Updated changelog: ${changelog.title}`,
    });

    return NextResponse.json({ success: true, changelog });
  } catch (error: any) {
    console.error("Error updating changelog:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

/**
 * Delete changelog
 * DELETE /api/admin/changelog/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    // Get changelog info before deleting for audit log
    const { data: changelog } = await supabase
      .from("changelogs")
      .select("title")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("changelogs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting changelog:", error);
      return NextResponse.json({ error: "Failed to delete changelog" }, { status: 500 });
    }

    // Log audit
    await createAuditLog({
      adminId: admin.id,
      actionType: "other",
      targetResourceType: "changelog",
      targetResourceId: id,
      details: {},
      notes: `Deleted changelog: ${changelog?.title || id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting changelog:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
