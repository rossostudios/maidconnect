"use server";

import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type SignOutActionState = {
  success?: boolean;
  error?: string;
};

/**
 * Server action to sign out the current user
 * Clears Supabase session and redirects to sign-in page
 */
export async function signOutAction(): Promise<never> {
  const supabase = await createSupabaseServerClient();

  // Sign out from Supabase (clears all session cookies)
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[SignOut] Error signing out:", error);
    // Even if there's an error, redirect to sign-in
    // The user session is likely already invalid
  }

  // Redirect to sign-in page with success message
  redirect(`${AUTH_ROUTES.signIn}?signedOut=true`);
}
