import { NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function sanitizeRedirect(path: string | null): string {
  if (!path) {
    return "/";
  }
  if (!path.startsWith("/") || path.startsWith(AUTH_ROUTES.signOut)) {
    return "/";
  }
  return path;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const redirectPath = sanitizeRedirect(request.nextUrl.searchParams.get("redirectTo"));
  const url = new URL(redirectPath, request.url);
  return NextResponse.redirect(url);
}
