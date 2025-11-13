import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";

// Validation schema
const conciergeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  serviceType: z.string().min(1),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = conciergeSchema.parse(body);

    const supabase = await createSupabaseServerClient();

    // Insert concierge request into database (using same briefs table with type)
    const { data: brief, error } = await supabase
      .from("briefs")
      .insert({
        service_type: "other", // Concierge requests use "other" since service is determined later
        city: "TBD", // To be determined by concierge team
        language: "english", // Default for concierge service
        start_date: "ASAP", // Typical for concierge requests
        hours_per_week: "TBD", // To be determined during consultation
        name: data.name,
        email: data.email,
        phone: data.phone,
        requirements: `Service Type Requested: ${data.serviceType}\n\n${data.message || ""}`,
        status: "pending",
        created_at: new Date().toISOString(),
        // Mark as concierge type for tracking
        metadata: { type: "concierge", serviceType: data.serviceType, source: "web" },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating concierge request:", error);
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
    }

    // TODO: Send priority notification email to admin (concierge requests get 2-hour SLA)
    // TODO: Send confirmation email to customer with concierge details

    return NextResponse.json(
      {
        success: true,
        briefId: brief.id,
        message: "Concierge request created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing concierge request:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
