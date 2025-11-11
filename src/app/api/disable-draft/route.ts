/**
 * Draft Mode Disable Route
 *
 * Disables Next.js draft mode
 * Called when exiting Sanity Visual Editing preview mode
 */

import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Disable draft mode
  (await draftMode()).disable();

  // Redirect to the path from the fetched post or fallback to home
  const url = new URL(request.nextUrl);
  const redirectTo = url.searchParams.get("redirect") || "/";

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
