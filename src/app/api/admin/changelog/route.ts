import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Check authentication and admin role
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();

    const {
      sprint_number,
      title,
      slug,
      summary,
      content,
      published_at,
      categories,
      tags,
      target_audience,
      featured_image_url,
      visibility,
    } = body;

    // Validation
    if (!sprint_number || !title || !slug || !content || !published_at) {
      return NextResponse.json(
        { error: "Missing required fields: sprint_number, title, slug, content, published_at" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("changelogs")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Slug already exists. Please use a unique slug." }, { status: 409 });
    }

    // Insert changelog
    const { data: changelog, error } = await supabase
      .from("changelogs")
      .insert({
        sprint_number,
        title,
        slug,
        summary: summary || null,
        content,
        published_at: new Date(published_at).toISOString(),
        categories: categories || [],
        tags: tags || [],
        target_audience: target_audience || ["all"],
        featured_image_url: featured_image_url || null,
        visibility: visibility || "draft",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating changelog:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ changelog }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/changelog:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
