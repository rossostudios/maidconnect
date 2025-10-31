import { NextRequest, NextResponse } from "next/server";
import { createAuditLog, requireAdmin } from "@/lib/admin-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Create new changelog entry
 * POST /api/admin/changelog/create
 * Body: {
 *   sprint_number: number,
 *   title: string,
 *   slug: string,
 *   summary?: string,
 *   content: string,
 *   categories: string[],
 *   tags?: string[],
 *   target_audience?: string[],
 *   featured_image_url?: string,
 *   visibility: 'draft' | 'published'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const body = await request.json();
    const {
      sprint_number,
      title,
      slug,
      summary,
      content,
      categories = [],
      tags = [],
      target_audience = ["all"],
      featured_image_url,
      visibility = "draft",
    } = body;

    // Validation
    if (!(sprint_number && title && slug && content)) {
      return NextResponse.json(
        {
          error: "Missing required fields: sprint_number, title, slug, content",
        },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const { data: existing } = await supabase
      .from("changelogs")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists. Please use a unique slug." },
        { status: 400 }
      );
    }

    // Create changelog
    const { data: changelog, error } = await supabase
      .from("changelogs")
      .insert({
        sprint_number,
        title,
        slug,
        summary,
        content,
        categories,
        tags,
        target_audience,
        featured_image_url,
        visibility,
        created_by: admin.id,
        published_at: visibility === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating changelog:", error);
      return NextResponse.json({ error: "Failed to create changelog" }, { status: 500 });
    }

    // Log audit
    await createAuditLog({
      adminId: admin.id,
      actionType: "other",
      targetResourceType: "changelog",
      targetResourceId: changelog.id,
      details: {
        sprint_number,
        title,
        visibility,
      },
      notes: `Created changelog: ${title}`,
    });

    return NextResponse.json({ success: true, changelog });
  } catch (error: any) {
    console.error("Error in changelog create:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
