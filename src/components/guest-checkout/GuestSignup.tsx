/**
 * Guest Signup Prompt
 *
 * Post-booking modal that encourages guests to create an account
 * Converts guest session to full user account
 *
 * Sprint 1: Guest Checkout Implementation
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  clearGuestBookingFlag,
  convertGuestToUser,
  getCurrentGuestSession,
  shouldShowSignupPrompt,
} from "@/lib/guestCheckout";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import { toast } from "@/lib/toast";

type GuestSignupPromptProps = {
  bookingId?: string;
};

export function GuestSignupPrompt({ bookingId }: GuestSignupPromptProps) {
  const [isOpen, setIsOpen] = useState(shouldShowSignupPrompt());
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();

  const guestSession = getCurrentGuestSession();

  if (!(isOpen && guestSession)) {
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Create auth user with guest email
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: guestSession.email,
        password,
        options: {
          data: {
            full_name: guestSession.full_name,
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        setIsLoading(false);
        return;
      }

      // Convert guest session to user account (migrates bookings)
      const success = await convertGuestToUser(guestSession.id, authData.user.id);

      if (!success) {
        toast.error("Account created but failed to link booking. Please contact support.");
        setIsLoading(false);
        return;
      }

      toast.success("Account created! Welcome to Casaora");
      clearGuestBookingFlag();
      setIsOpen(false);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard/customer");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    clearGuestBookingFlag();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-[neutral-900]/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="-tranneutral-x-1/2 -tranneutral-y-1/2 fixed top-1/2 left-1/2 z-50 w-full max-w-md rounded-3xl border-2 border-[neutral-200] bg-[neutral-50] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[neutral-500]/10">
            <svg
              className="h-8 w-8 text-[neutral-500]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="mb-2 font-bold text-2xl text-[neutral-900]">Booking Confirmed!</h2>
          <p className="text-[neutral-400] text-base">
            Create an account to track your booking and enjoy faster checkout next time
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          {/* Pre-filled email (read-only) */}
          <div>
            <label className="mb-2 block font-medium text-[neutral-900] text-sm">Email</label>
            <input
              className="w-full rounded-lg border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-[neutral-900] text-sm"
              disabled
              readOnly
              type="email"
              value={guestSession.email}
            />
          </div>

          {/* Password input */}
          <div>
            <label className="mb-2 block font-medium text-[neutral-900] text-sm" htmlFor="password">
              Create Password
            </label>
            <input
              autoComplete="new-password"
              className="w-full rounded-lg border border-[neutral-200] px-4 py-3 text-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
              disabled={isLoading}
              id="password"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              type="password"
              value={password}
            />
            <p className="mt-1 text-[neutral-400] text-xs">Must be at least 8 characters long</p>
          </div>

          {/* Benefits list */}
          <div className="rounded-lg bg-[neutral-50] p-4">
            <p className="mb-2 font-semibold text-[neutral-900] text-sm">
              With an account you can:
            </p>
            <ul className="space-y-1 text-[neutral-400] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[neutral-500]">✓</span>
                <span>Track your booking status in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[neutral-500]">✓</span>
                <span>Message your professional directly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[neutral-500]">✓</span>
                <span>Book again with saved preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[neutral-500]">✓</span>
                <span>Access booking history and receipts</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-lg border-2 border-[neutral-200] bg-[neutral-50] px-6 py-3 font-semibold text-[neutral-900] text-sm transition hover:border-[neutral-500] hover:text-[neutral-500]"
              disabled={isLoading}
              onClick={handleSkip}
              type="button"
            >
              Skip for now
            </button>
            <button
              className="flex-1 rounded-lg bg-[neutral-500] px-6 py-3 font-semibold text-[neutral-50] text-sm transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>

        {bookingId && (
          <p className="mt-4 text-center text-[neutral-400] text-xs">Booking ID: {bookingId}</p>
        )}
      </div>
    </>
  );
}
