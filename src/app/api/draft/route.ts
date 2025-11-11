/**
 * Draft Mode Enable Route
 *
 * Enables Next.js draft mode for Sanity Visual Editing
 * Called by Sanity Studio's Presentation Tool to enter preview mode
 */

import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/lib/sanity/client";

const clientWithToken = serverClient.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
});

export async function GET(request: NextRequest) {
  const { isValid, redirectTo = "/" } = await validatePreviewUrl(clientWithToken, request.url);

  if (!isValid) {
    return new NextResponse("Invalid secret", { status: 401 });
  }

  // Enable draft mode
  (await draftMode()).enable();

  // Redirect to the path from the request with draft mode enabled
  redirect(redirectTo);
}
