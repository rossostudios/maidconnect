"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function DataRightsPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isCheckingDeletion, setIsCheckingDeletion] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletionCheck, setDeletionCheck] = useState<{
    canDelete: boolean;
    blockers?: { activeBookings: number; pendingPayouts: number };
    message?: string;
  } | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/account/export-data");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export data");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `maidconnect_data_export_${Date.now()}.json`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Your data has been exported successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const checkDeletionEligibility = async () => {
    setIsCheckingDeletion(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to check deletion status");
      }

      const data = await response.json();
      setDeletionCheck(data);
      setShowDeleteConfirm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check deletion eligibility");
    } finally {
      setIsCheckingDeletion(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE MY ACCOUNT") {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setIsDeletingAccount(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      const data = await response.json();
      setSuccess(data.message);

      // Redirect to sign-in after 5 seconds
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="mb-2 font-bold text-3xl text-[#211f1a]">Your Data Rights</h1>
        <p className="text-[#7a6d62]">
          Under Colombian Law (Ley 1581 de 2012), you have the right to access, export, and delete
          your personal data.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-semibold">Success</p>
          <p className="text-sm">{success}</p>
        </div>
      ) : null}

      {/* Export Data Section */}
      <section className="rounded-[28px] border border-[#dcd6c7] bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff5d46]/10">
            <svg
              className="h-6 w-6 text-[#ff5d46]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 font-semibold text-[#211f1a] text-xl">Export Your Data</h2>
            <p className="mb-4 text-[#5d574b] text-sm">
              Download a complete copy of your personal data stored on MaidConnect. This includes
              your profile, bookings, messages, reviews, and consent records.
            </p>
            <ul className="mb-6 ml-4 list-disc space-y-1 text-[#5d574b] text-sm">
              <li>Profile information (name, contact details, preferences)</li>
              <li>Booking history (as customer or professional)</li>
              <li>Messages and conversations</li>
              <li>Reviews and ratings</li>
              <li>Payment history and payouts</li>
              <li>Consent records</li>
            </ul>
            <button
              className={cn(
                "rounded-full border border-[#211f1a] bg-[#211f1a] px-6 py-2.5 font-semibold text-sm text-white transition hover:bg-[#2b2624]",
                isExporting && "cursor-not-allowed opacity-60"
              )}
              disabled={isExporting}
              onClick={handleExportData}
              type="button"
            >
              {isExporting ? "Exporting..." : "Export My Data"}
            </button>
          </div>
        </div>
      </section>

      {/* Delete Account Section */}
      <section className="rounded-[28px] border border-red-200 bg-red-50 p-8 shadow-sm">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="mb-2 font-semibold text-red-900 text-xl">Delete Your Account</h2>
            <p className="mb-4 text-red-800 text-sm">
              <strong>Warning:</strong> This action will permanently delete your account and all
              associated data. This cannot be undone.
            </p>
            <ul className="mb-6 ml-4 list-disc space-y-1 text-red-700 text-sm">
              <li>Your profile and all personal information will be deleted</li>
              <li>Your booking history will be anonymized</li>
              <li>Your messages will be removed from your conversations</li>
              <li>You will not be able to access your account after deletion</li>
              <li>
                Data will be permanently deleted after 30 days (you can cancel within this period)
              </li>
            </ul>

            {showDeleteConfirm ? null : (
              <button
                className={cn(
                  "rounded-full border border-red-600 bg-red-600 px-6 py-2.5 font-semibold text-sm text-white transition hover:bg-red-700",
                  isCheckingDeletion && "cursor-not-allowed opacity-60"
                )}
                disabled={isCheckingDeletion}
                onClick={checkDeletionEligibility}
                type="button"
              >
                {isCheckingDeletion ? "Checking..." : "Delete My Account"}
              </button>
            )}

            {/* Deletion Confirmation UI */}
            {showDeleteConfirm && deletionCheck ? (
              <div className="mt-6 space-y-4 rounded-xl border border-red-300 bg-white p-6">
                {deletionCheck.canDelete ? (
                  <>
                    <p className="font-semibold text-red-900 text-sm">
                      Are you absolutely sure you want to delete your account?
                    </p>
                    <p className="text-red-700 text-sm">
                      Type <strong>DELETE MY ACCOUNT</strong> below to confirm:
                    </p>
                    <input
                      className="w-full rounded-full border border-red-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="DELETE MY ACCOUNT"
                      type="text"
                      value={confirmText}
                    />
                    <div className="flex gap-3">
                      <button
                        className={cn(
                          "rounded-full border border-red-600 bg-red-600 px-6 py-2.5 font-semibold text-sm text-white transition hover:bg-red-700",
                          isDeletingAccount && "cursor-not-allowed opacity-60"
                        )}
                        disabled={isDeletingAccount || confirmText !== "DELETE MY ACCOUNT"}
                        onClick={handleDeleteAccount}
                        type="button"
                      >
                        {isDeletingAccount ? "Deleting..." : "Confirm Deletion"}
                      </button>
                      <button
                        className="rounded-full border border-[#dcd6c7] bg-white px-6 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:bg-[#fbfaf9]"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setConfirmText("");
                          setDeletionCheck(null);
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-red-900">Cannot Delete Account</p>
                    <p className="text-red-700 text-sm">{deletionCheck.message}</p>
                    {deletionCheck.blockers &&
                    (deletionCheck.blockers.activeBookings > 0 ||
                      deletionCheck.blockers.pendingPayouts > 0) ? (
                      <ul className="ml-4 list-disc space-y-1 text-red-700 text-sm">
                        {deletionCheck.blockers.activeBookings > 0 ? (
                          <li>Active bookings: {deletionCheck.blockers.activeBookings}</li>
                        ) : null}
                        {deletionCheck.blockers.pendingPayouts > 0 ? (
                          <li>Pending payouts: {deletionCheck.blockers.pendingPayouts}</li>
                        ) : null}
                      </ul>
                    ) : null}
                    <button
                      className="rounded-full border border-[#dcd6c7] bg-white px-6 py-2.5 font-semibold text-[#211f1a] text-sm transition hover:bg-[#fbfaf9]"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletionCheck(null);
                      }}
                      type="button"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="rounded-xl bg-[#fbfaf9] p-6">
        <h3 className="mb-2 font-semibold text-[#211f1a] text-sm">
          Your Rights Under Colombian Law
        </h3>
        <p className="mb-3 text-[#7a6d62] text-sm">
          According to Ley 1581 de 2012 (Colombian Data Protection Law), you have the following
          rights:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-[#7a6d62] text-sm">
          <li>
            <strong>Right to Access:</strong> Request a copy of your personal data
          </li>
          <li>
            <strong>Right to Rectification:</strong> Request corrections to inaccurate data
          </li>
          <li>
            <strong>Right to Deletion:</strong> Request deletion of your personal data
          </li>
          <li>
            <strong>Right to Object:</strong> Object to certain data processing activities
          </li>
          <li>
            <strong>Right to Portability:</strong> Receive your data in a machine-readable format
          </li>
        </ul>
        <p className="mt-4 text-[#7a6d62] text-sm">
          For questions about your data rights, contact us at{" "}
          <a
            className="font-semibold text-[#ff5d46] underline"
            href="mailto:privacy@maidconnect.com"
          >
            privacy@maidconnect.com
          </a>
        </p>
      </section>
    </div>
  );
}
