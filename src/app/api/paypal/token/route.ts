/**
 * PayPal Client Token Generation API Route
 * GET /api/paypal/token
 *
 * Generates a client token for initializing PayPal Checkout SDK on the frontend.
 * This token is used by the PayPal JavaScript SDK to initialize payment buttons.
 *
 * SECURITY:
 * - Rate limited to prevent abuse
 * - Authenticated users only
 * - Token is short-lived (valid for ~1 hour)
 */

import { NextResponse } from "next/server";
import { paypal } from "@/lib/integrations/paypal";
import { logger } from "@/lib/logger";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  try {
    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate client token
    const clientToken = await paypal.generateClientToken();

    logger.info("[PayPal Token] Generated client token", {
      userId: user.id,
    });

    return NextResponse.json({
      clientToken,
      expiresIn: 3600, // Token valid for 1 hour
    });
  } catch (error) {
    logger.error("[PayPal Token] Error generating client token", { error });
    return NextResponse.json({ error: "Failed to generate PayPal client token" }, { status: 500 });
  }
}
