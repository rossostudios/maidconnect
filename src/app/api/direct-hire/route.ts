import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";

const directHireSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  serviceType: z.string().min(1),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = directHireSchema.parse(body);

    const supabase = await createSupabaseServerClient();

    // Store the direct hire request
    const { error } = await supabase.from("contact_requests").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      metadata: {
        type: "direct-hire",
        serviceType: data.serviceType,
        source: "web",
      },
    });

    if (error) {
      console.error("Failed to store direct hire request:", error);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Direct hire request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
