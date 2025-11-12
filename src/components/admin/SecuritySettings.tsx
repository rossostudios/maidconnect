"use client";

import { LockPasswordIcon, Shield01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

export function AdminSecuritySettings() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate passwords
    if (passwords.new.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/settings/security/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }

      setSuccessMessage("Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
      setIsChangingPassword(false);
    } catch (err) {
      console.error("Password change error:", err);
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-stone-300 bg-stone-100 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-stone-800 dark:text-stone-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-stone-900 bg-stone-900 p-4 dark:border-stone-100/40 dark:bg-stone-100/10">
          <p className="text-sm text-stone-800 dark:text-stone-300">{successMessage}</p>
        </div>
      )}

      {/* Password Change */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100/10">
              <HugeiconsIcon
                className="h-5 w-5 text-stone-900 dark:text-stone-100"
                icon={LockPasswordIcon}
              />
            </div>
            <div>
              <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100">
                Password
              </h3>
              <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
                Update your password to keep your account secure
              </p>
            </div>
          </div>

          {!isChangingPassword && (
            <button
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 font-medium text-sm text-stone-800 transition-colors hover:bg-white dark:border-stone-800 dark:bg-stone-950 dark:bg-stone-950 dark:text-stone-300"
              onClick={() => setIsChangingPassword(true)}
              type="button"
            >
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword && (
          <form className="mt-6 space-y-4" onSubmit={handlePasswordChange}>
            <div>
              <label
                className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400"
                htmlFor="current-password"
              >
                Current Password
              </label>
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                id="current-password"
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                required
                type="password"
                value={passwords.current}
              />
            </div>

            <div>
              <label
                className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400"
                htmlFor="new-password"
              >
                New Password
              </label>
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                id="new-password"
                minLength={8}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                required
                type="password"
                value={passwords.new}
              />
              <p className="mt-1 text-stone-600 text-xs dark:text-stone-400">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                className="mb-2 block font-semibold text-stone-600 text-xs uppercase tracking-wider dark:text-stone-400"
                htmlFor="confirm-password"
              >
                Confirm New Password
              </label>
              <input
                className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-400"
                id="confirm-password"
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required
                type="password"
                value={passwords.confirm}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                className="flex items-center gap-2 rounded-lg bg-stone-900 px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:bg-stone-100 dark:text-stone-950"
                disabled={isSaving}
                type="submit"
              >
                <HugeiconsIcon className="h-4 w-4" icon={Tick02Icon} />
                {isSaving ? "Updating..." : "Update Password"}
              </button>
              <button
                className="rounded-lg border border-stone-200 bg-white px-6 py-2.5 font-semibold text-sm text-stone-600 transition-colors hover:bg-white dark:border-stone-800 dark:bg-stone-950 dark:bg-stone-950 dark:text-stone-400"
                disabled={isSaving}
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswords({ current: "", new: "", confirm: "" });
                  setError(null);
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Two-Factor Authentication (Coming Soon) */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 dark:bg-stone-100/10">
              <HugeiconsIcon
                className="h-5 w-5 text-stone-900 dark:text-stone-100"
                icon={Shield01Icon}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100">
                  Two-Factor Authentication (2FA)
                </h3>
                <span className="rounded-full bg-stone-900 px-2 py-0.5 font-semibold text-white text-xs dark:bg-stone-100/20 dark:text-stone-100">
                  COMING SOON
                </span>
              </div>
              <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
                Add an extra layer of security to your admin account
              </p>
            </div>
          </div>

          <button
            className="cursor-not-allowed rounded-lg border border-stone-200 bg-white px-4 py-2 font-medium text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400"
            disabled
            type="button"
          >
            Enable 2FA
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-stone-900 bg-white p-4 dark:border-stone-100 dark:bg-stone-950">
          <p className="text-sm text-stone-800 dark:text-stone-300">
            <strong>Note:</strong> Two-factor authentication requires Supabase Pro. This feature
            will be available once we upgrade to the Pro plan. It will provide additional security
            through authenticator apps like Google Authenticator or Authy.
          </p>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
        <h3 className="mb-3 font-semibold text-base text-stone-900 dark:text-stone-100">
          Security Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
          <li className="flex items-start gap-2">
            <span className="text-stone-900 dark:text-stone-100">•</span>
            <span>Use a strong, unique password that you don't use on other websites</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stone-900 dark:text-stone-100">•</span>
            <span>Change your password regularly (every 3-6 months)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stone-900 dark:text-stone-100">•</span>
            <span>Never share your admin credentials with anyone</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stone-900 dark:text-stone-100">•</span>
            <span>Always log out when using shared or public computers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stone-900 dark:text-stone-100">•</span>
            <span>Enable 2FA as soon as it becomes available</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
