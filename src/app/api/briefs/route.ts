import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/integrations/supabase/serverClient";

// Validation schema
const briefSchema = z.object({
  serviceType: z.enum([
    "housekeeping",
    "childcare",
    "eldercare",
    "cooking",
    "estate_management",
    "other",
  ]),
  city: z.string(),
  language: z.enum(["english", "spanish", "both"]),
  startDate: z.string(),
  hoursPerWeek: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  requirements: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = briefSchema.parse(body);

    const supabase = await createSupabaseServerClient();

    // Insert brief into database
    const { data: brief, error } = await supabase
      .from("briefs")
      .insert({
        service_type: data.serviceType,
        city: data.city,
        language: data.language,
        start_date: data.startDate,
        hours_per_week: data.hoursPerWeek,
        name: data.name,
        email: data.email,
        phone: data.phone,
        requirements: data.requirements,
        status: "pending",
        metadata: { type: "brief", source: "web" },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating brief:", error);
      return NextResponse.json({ error: "Failed to create brief" }, { status: 500 });
    }

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to customer

    return NextResponse.json(
      {
        success: true,
        briefId: brief.id,
        message: "Brief created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing brief:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
