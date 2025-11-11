"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const FILENAME_REGEX = /filename="(.+)"/;

type DeletionCheck = {
  canDelete: boolean;
  blockers?: { activeBookings: number; pendingPayouts: number };
  message?: string;
};

function extractFilenameFromResponse(response: Response): string {
  const contentDisposition = response.headers.get("Content-Disposition");
  const filenameMatch = contentDisposition?.match(FILENAME_REGEX);
  return filenameMatch?.[1] || `casaora_data_export_${Date.now()}.json`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (
    onSuccess: (message: string) => void,
    onError: (error: string) => void
  ) => {
    setIsExporting(true);

    try {
      const response = await fetch("/api/account/export-data");

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export data");
      }

      const filename = extractFilenameFromResponse(response);
      const blob = await response.blob();
      downloadBlob(blob, filename);

      onSuccess("Your data has been exported successfully!");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, exportData };
}

function useAccountDeletion(router: ReturnType<typeof useRouter>) {
  const [isCheckingDeletion, setIsCheckingDeletion] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletionCheck, setDeletionCheck] = useState<DeletionCheck | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const checkEligibility = async (onError: (error: string) => void) => {
    setIsCheckingDeletion(true);

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
      onError(err instanceof Error ? err.message : "Failed to check deletion eligibility");
    } finally {
      setIsCheckingDeletion(false);
    }
  };

  const deleteAccount = async (
    confirmText: string,
    onSuccess: (message: string) => void,
    onError: (error: string) => void
  ) => {
    if (confirmText !== "DELETE MY ACCOUNT") {
      onError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setIsDeletingAccount(true);

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
      onSuccess(data.message);

      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 5000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const cancelDeletion = () => {
    setShowDeleteConfirm(false);
    setDeletionCheck(null);
  };

  return {
    isCheckingDeletion,
    isDeletingAccount,
    deletionCheck,
    showDeleteConfirm,
    checkEligibility,
    deleteAccount,
    cancelDeletion,
  };
}

export default function DataRightsPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { isExporting, exportData } = useDataExport();
  const {
    isCheckingDeletion,
    isDeletingAccount,
    deletionCheck,
    showDeleteConfirm,
    checkEligibility,
    deleteAccount,
    cancelDeletion,
  } = useAccountDeletion(router);

  const handleExportData = () => {
    setError(null);
    setSuccess(null);
    exportData(setSuccess, setError);
  };

  const checkDeletionEligibility = () => {
    setError(null);
    checkEligibility(setError);
  };

  const handleDeleteAccount = () => {
    setError(null);
    deleteAccount(confirmText, setSuccess, setError);
  };

  const handleCancelDeletion = () => {
    cancelDeletion();
    setConfirmText("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <PageHeader />
      <StatusMessages error={error} success={success} />

      <ExportDataSection isExporting={isExporting} onExport={handleExportData} />
      <DeleteAccountSection
        confirmText={confirmText}
        deletionCheck={deletionCheck}
        isCheckingDeletion={isCheckingDeletion}
        isDeletingAccount={isDeletingAccount}
        onCancel={handleCancelDeletion}
        onCheckEligibility={checkDeletionEligibility}
        onConfirmDelete={handleDeleteAccount}
        onConfirmTextChange={setConfirmText}
        showDeleteConfirm={showDeleteConfirm}
      />
      <LegalNoticeSection />
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="mb-2 font-bold text-3xl text-[#116611616]">Your Data Rights</h1>
      <p className="text-[#AA88AAAAC]">
        Under Colombian Law (Ley 1581 de 2012), you have the right to access, export, and delete
        your personal data.
      </p>
    </div>
  );
}

function StatusMessages({ error, success }: { error: string | null; success: string | null }) {
  if (error) {
    return (
      <div className="rounded-xl border border-[#FF4444A22]/30 bg-[#FF4444A22]/10 p-4 text-[#FF4444A22]">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-[#FF4444A22]/40 bg-[#FF4444A22]/10 p-4 text-[#FF4444A22]">
        <p className="font-semibold">Success</p>
        <p className="text-sm">{success}</p>
      </div>
    );
  }

  return null;
}

function ExportDataSection({
  isExporting,
  onExport,
}: {
  isExporting: boolean;
  onExport: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-8 shadow-sm">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF4444A22]/10">
          <svg
            aria-label="Export data icon"
            className="h-6 w-6 text-[#FF4444A22]"
            fill="none"
            role="img"
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
          <h2 className="mb-2 font-semibold text-[#116611616] text-xl">Export Your Data</h2>
          <p className="mb-4 text-[#AA88AAAAC] text-sm">
            Download a complete copy of your personal data stored on Casaora. This includes your
            profile, bookings, messages, reviews, and consent records.
          </p>
          <ul className="mb-6 ml-4 list-disc space-y-1 text-[#AA88AAAAC] text-sm">
            <li>Profile information (name, contact details, preferences)</li>
            <li>Booking history (as customer or professional)</li>
            <li>Messages and conversations</li>
            <li>Reviews and ratings</li>
            <li>Payment history and payouts</li>
            <li>Consent records</li>
          </ul>
          <button
            className={cn(
              "rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-6 py-2.5 font-semibold text-[#FFEEFF8E8] text-sm transition hover:bg-[#116611616]",
              isExporting && "cursor-not-allowed opacity-60"
            )}
            disabled={isExporting}
            onClick={onExport}
            type="button"
          >
            {isExporting ? "Exporting..." : "Export My Data"}
          </button>
        </div>
      </div>
    </section>
  );
}

function DeleteAccountSection({
  showDeleteConfirm,
  isCheckingDeletion,
  deletionCheck,
  confirmText,
  isDeletingAccount,
  onCheckEligibility,
  onConfirmTextChange,
  onConfirmDelete,
  onCancel,
}: {
  showDeleteConfirm: boolean;
  isCheckingDeletion: boolean;
  deletionCheck: DeletionCheck | null;
  confirmText: string;
  isDeletingAccount: boolean;
  onCheckEligibility: () => void;
  onConfirmTextChange: (text: string) => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-[#FF4444A22]/30 bg-[#FF4444A22]/10 p-8 shadow-sm">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FF4444A22]/10">
          <svg
            aria-label="Delete account icon"
            className="h-6 w-6 text-[#FF4444A22]"
            fill="none"
            role="img"
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
          <h2 className="mb-2 font-semibold text-[#FF4444A22] text-xl">Delete Your Account</h2>
          <p className="mb-4 text-[#FF4444A22] text-sm">
            <strong>Warning:</strong> This action will permanently delete your account and all
            associated data. This cannot be undone.
          </p>
          <ul className="mb-6 ml-4 list-disc space-y-1 text-[#FF4444A22] text-sm">
            <li>Your profile and all personal information will be deleted</li>
            <li>Your booking history will be anonymized</li>
            <li>Your messages will be removed from your conversations</li>
            <li>You will not be able to access your account after deletion</li>
            <li>
              Data will be permanently deleted after 30 days (you can cancel within this period)
            </li>
          </ul>

          {!showDeleteConfirm && (
            <button
              className={cn(
                "rounded-full border border-[#FF4444A22] bg-[#FF4444A22] px-6 py-2.5 font-semibold text-[#FFEEFF8E8] text-sm transition hover:bg-[#FF4444A22]",
                isCheckingDeletion && "cursor-not-allowed opacity-60"
              )}
              disabled={isCheckingDeletion}
              onClick={onCheckEligibility}
              type="button"
            >
              {isCheckingDeletion ? "Checking..." : "Delete My Account"}
            </button>
          )}

          {showDeleteConfirm && deletionCheck && (
            <DeletionConfirmation
              canDelete={deletionCheck.canDelete}
              confirmText={confirmText}
              deletionCheck={deletionCheck}
              isDeletingAccount={isDeletingAccount}
              onCancel={onCancel}
              onConfirmDelete={onConfirmDelete}
              onConfirmTextChange={onConfirmTextChange}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function DeletionConfirmation({
  canDelete,
  confirmText,
  isDeletingAccount,
  deletionCheck,
  onConfirmTextChange,
  onConfirmDelete,
  onCancel,
}: {
  canDelete: boolean;
  confirmText: string;
  isDeletingAccount: boolean;
  deletionCheck: DeletionCheck;
  onConfirmTextChange: (text: string) => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
}) {
  if (canDelete) {
    return (
      <div className="mt-6 space-y-4 rounded-xl border border-[#FF4444A22]/50 bg-[#FFEEFF8E8] p-6">
        <p className="font-semibold text-[#FF4444A22] text-sm">
          Are you absolutely sure you want to delete your account?
        </p>
        <p className="text-[#FF4444A22] text-sm">
          Type <strong>DELETE MY ACCOUNT</strong> below to confirm:
        </p>
        <input
          className="w-full rounded-full border border-[#FF4444A22]/50 bg-[#FFEEFF8E8] px-4 py-2 text-sm focus:border-[#FF4444A22]/100 focus:outline-none focus:ring-2 focus:ring-[#FF4444A22]/30"
          onChange={(e) => onConfirmTextChange(e.target.value)}
          placeholder="DELETE MY ACCOUNT"
          type="text"
          value={confirmText}
        />
        <div className="flex gap-3">
          <button
            className={cn(
              "rounded-full border border-[#FF4444A22] bg-[#FF4444A22] px-6 py-2.5 font-semibold text-[#FFEEFF8E8] text-sm transition hover:bg-[#FF4444A22]",
              isDeletingAccount && "cursor-not-allowed opacity-60"
            )}
            disabled={isDeletingAccount || confirmText !== "DELETE MY ACCOUNT"}
            onClick={onConfirmDelete}
            type="button"
          >
            {isDeletingAccount ? "Deleting..." : "Confirm Deletion"}
          </button>
          <button
            className="rounded-full border border-[#EE44EE2E3] bg-[#FFEEFF8E8] px-6 py-2.5 font-semibold text-[#116611616] text-sm transition hover:bg-[#FFEEFF8E8]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-[#FF4444A22]/50 bg-[#FFEEFF8E8] p-6">
      <p className="font-semibold text-[#FF4444A22]">Cannot Delete Account</p>
      <p className="text-[#FF4444A22] text-sm">{deletionCheck.message}</p>
      {deletionCheck.blockers &&
        (deletionCheck.blockers.activeBookings > 0 ||
          deletionCheck.blockers.pendingPayouts > 0) && (
          <ul className="ml-4 list-disc space-y-1 text-[#FF4444A22] text-sm">
            {deletionCheck.blockers.activeBookings > 0 && (
              <li>Active bookings: {deletionCheck.blockers.activeBookings}</li>
            )}
            {deletionCheck.blockers.pendingPayouts > 0 && (
              <li>Pending payouts: {deletionCheck.blockers.pendingPayouts}</li>
            )}
          </ul>
        )}
      <button
        className="rounded-full border border-[#EE44EE2E3] bg-[#FFEEFF8E8] px-6 py-2.5 font-semibold text-[#116611616] text-sm transition hover:bg-[#FFEEFF8E8]"
        onClick={onCancel}
        type="button"
      >
        Close
      </button>
    </div>
  );
}

function LegalNoticeSection() {
  return (
    <section className="rounded-xl bg-[#FFEEFF8E8] p-6">
      <h3 className="mb-2 font-semibold text-[#116611616] text-sm">
        Your Rights Under Colombian Law
      </h3>
      <p className="mb-3 text-[#AA88AAAAC] text-sm">
        According to Ley 1581 de 2012 (Colombian Data Protection Law), you have the following
        rights:
      </p>
      <ul className="ml-4 list-disc space-y-1 text-[#AA88AAAAC] text-sm">
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
      <p className="mt-4 text-[#AA88AAAAC] text-sm">
        For questions about your data rights, contact us at{" "}
        <a className="font-semibold text-[#FF4444A22] underline" href="mailto:privacy@casaora.com">
          privacy@casaora.com
        </a>
      </p>
    </section>
  );
}
