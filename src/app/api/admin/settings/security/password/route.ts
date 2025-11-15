/**
 * Admin Security Password API
 * POST /api/admin/settings/security/password - Change admin password
 *
 * Rate Limit: 10 requests per minute (admin tier)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

async function handlePasswordChange(request: NextRequest) {
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

    // 3. Validate request body
    const body = await request.json();
    const validated = PasswordChangeSchema.parse(body);

    // 4. Verify current password by attempting to sign in
    // This is the safest way to verify the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validated.currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // 5. Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: validated.newPassword,
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      throw updateError;
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid password data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Apply rate limiting: 10 requests per minute (admin tier)
export const POST = withRateLimit(handlePasswordChange, "admin");
