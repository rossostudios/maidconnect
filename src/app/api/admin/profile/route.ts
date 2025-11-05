import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().min(0).max(20).optional(),
  city: z.string().min(0).max(100).optional(),
  country: z.string().min(0).max(100).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Validate input
    const body = await request.json();
    const validated = ProfileUpdateSchema.parse(body);

    // 4. Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: validated.full_name,
        phone: validated.phone || null,
        city: validated.city || null,
        country: validated.country || null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", JSON.stringify(updateError, null, 2));
      console.error("Error message:", updateError.message);
      console.error("Error code:", updateError.code);
      return NextResponse.json(
        { error: updateError.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin profile API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
