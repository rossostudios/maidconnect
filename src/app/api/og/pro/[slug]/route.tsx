/**
 * Dynamic Open Graph Image Generation for Professional Profiles
 * GET /api/og/pro/[slug]
 *
 * Generates social media preview images for professional profiles
 * Uses Next.js ImageResponse API (@vercel/og)
 */

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "edge";

// ========================================
// Fetch Professional Data
// ========================================

async function fetchProfessionalForOG(slug: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("professional_profiles")
    .select(
      `
      full_name,
      primary_services,
      city,
      country,
      verification_level,
      experience_years,
      total_bookings_completed
    `
    )
    .eq("slug", slug)
    .eq("profile_visibility", "public")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    name: data.full_name || "Casaora Professional",
    service: data.primary_services?.[0] || "Home Services Professional",
    location:
      data.city && data.country ? `${data.city}, ${data.country}` : data.country || "Colombia",
    verificationLevel: data.verification_level || "none",
    experienceYears: data.experience_years,
    totalBookings: data.total_bookings_completed,
  };
}

// ========================================
// GET: Generate OG Image
// ========================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // ========================================
    // 1. Fetch Professional Data
    // ========================================

    const professional = await fetchProfessionalForOG(slug);

    if (!professional) {
      return new Response("Professional not found", { status: 404 });
    }

    // ========================================
    // 2. Determine Verification Badge
    // ========================================

    let verificationBadge = "";
    let verificationColor = "#7A3B4A"; // rausch-500 (Burgundy)

    if (professional.verificationLevel === "verified") {
      verificationBadge = "✓ Verified";
      verificationColor = "#788C5D"; // green-500
    } else if (professional.verificationLevel === "background_checked") {
      verificationBadge = "✓ Background Checked";
      verificationColor = "#6A9BCC"; // babu-500
    }

    // ========================================
    // 3. Experience Badge
    // ========================================

    let experienceBadge = "";
    if (professional.experienceYears) {
      experienceBadge = `${professional.experienceYears}+ years experience`;
    } else if (professional.totalBookings && professional.totalBookings > 0) {
      experienceBadge = `${professional.totalBookings} bookings completed`;
    }

    // ========================================
    // 4. Generate Image Response
    // ========================================

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "#F7F7F7", // neutral-50 (Airbnb)
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Casaora Logo / Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#7A3B4A", // rausch-500 (Burgundy)
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                color: "white",
              }}
            >
              C
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 600,
                color: "#222222", // neutral-900 (Airbnb)
              }}
            >
              Casaora
            </div>
          </div>

          {/* Professional Name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#222222", // neutral-900 (Airbnb)
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {professional.name}
          </div>

          {/* Service */}
          <div
            style={{
              fontSize: "40px",
              fontWeight: 500,
              color: "#484848", // neutral-700 (Airbnb Hof)
              lineHeight: 1.3,
            }}
          >
            {professional.service}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            width: "100%",
          }}
        >
          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Location Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#FFFFFF",
                border: "2px solid #DDDDDD", // neutral-200 (Airbnb)
                borderRadius: "9999px",
                padding: "12px 24px",
                fontSize: "24px",
                color: "#484848", // neutral-700 (Airbnb Hof)
              }}
            >
              📍 {professional.location}
            </div>

            {/* Verification Badge */}
            {verificationBadge && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: verificationColor,
                  borderRadius: "9999px",
                  padding: "12px 24px",
                  fontSize: "24px",
                  color: "#FFFFFF",
                  fontWeight: 600,
                }}
              >
                {verificationBadge}
              </div>
            )}

            {/* Experience Badge */}
            {experienceBadge && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#FFFFFF",
                  border: "2px solid #DDDDDD", // neutral-200 (Airbnb)
                  borderRadius: "9999px",
                  padding: "12px 24px",
                  fontSize: "24px",
                  color: "#484848", // neutral-700 (Airbnb Hof)
                }}
              >
                {experienceBadge}
              </div>
            )}
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
