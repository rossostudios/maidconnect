import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

type ReferralCode = {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  max_uses: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

/**
 * Generate or retrieve user's referral code
 * POST /api/referrals/generate-code
 *
 * Creates a new referral code if user doesn't have an active one,
 * otherwise returns existing code.
 *
 * Research shows 90%+ of successful programs use simple, memorable codes
 * Format: XXXX-YYYY (8 chars with hyphen for readability)
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user already has an active referral code
    const { data: existingCode, error: fetchError } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching referral code:", fetchError);
      return NextResponse.json({ error: "Failed to fetch referral code" }, { status: 500 });
    }

    // Return existing code if found
    if (existingCode) {
      return NextResponse.json({
        code: existingCode.code,
        uses_count: existingCode.uses_count,
        created_at: existingCode.created_at,
      });
    }

    // Generate new referral code using database function
    const { data: newCodeData, error: generateError } =
      await supabase.rpc("generate_referral_code");

    if (generateError) {
      console.error("Error generating referral code:", generateError);
      return NextResponse.json({ error: "Failed to generate referral code" }, { status: 500 });
    }

    const generatedCode = newCodeData as string;

    // Insert new referral code record
    const { data: insertedCode, error: insertError } = await supabase
      .from("referral_codes")
      .insert({
        user_id: user.id,
        code: generatedCode,
        is_active: true,
        uses_count: 0,
        max_uses: null, // Unlimited uses
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting referral code:", insertError);
      return NextResponse.json({ error: "Failed to save referral code" }, { status: 500 });
    }

    const code = insertedCode as ReferralCode;

    return NextResponse.json(
      {
        code: code.code,
        uses_count: code.uses_count,
        created_at: code.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in generate-code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Get user's referral code
 * GET /api/referrals/generate-code
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

    // Fetch user's active referral code
    const { data: code, error } = await supabase
      .from("referral_codes")
      .select("code, uses_count, created_at")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching referral code:", error);
      return NextResponse.json({ error: "Failed to fetch referral code" }, { status: 500 });
    }

    if (!code) {
      return NextResponse.json({ error: "No referral code found" }, { status: 404 });
    }

    return NextResponse.json(code);
  } catch (error) {
    console.error("Unexpected error in GET referral code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
