import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type UpdateProfileRequest = {
  full_name?: string;
  bio?: string;
  languages?: string[];
  phone_number?: string;
  avatar_url?: string;
  primary_services?: string[];
};

/**
 * Update professional profile
 * PUT /api/professional/profile
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is a professional
    const { data: professionalProfile } = await supabase
      .from("professional_profiles")
      .select("profile_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!professionalProfile) {
      return NextResponse.json({ error: "Not a professional" }, { status: 403 });
    }

    const body = (await request.json()) as UpdateProfileRequest;

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.full_name !== undefined) {
      updates.full_name = body.full_name;
    }
    if (body.bio !== undefined) {
      updates.bio = body.bio;
    }
    if (body.languages !== undefined) {
      updates.languages = body.languages;
    }
    if (body.phone_number !== undefined) {
      updates.phone_number = body.phone_number;
    }
    if (body.avatar_url !== undefined) {
      updates.avatar_url = body.avatar_url;
    }
    if (body.primary_services !== undefined) {
      updates.primary_services = body.primary_services;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("professional_profiles")
      .update(updates)
      .eq("profile_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

/**
 * Get professional profile
 * GET /api/professional/profile
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("professional_profiles")
      .select("full_name, bio, languages, phone_number, avatar_url, primary_services")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
