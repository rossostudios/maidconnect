"use client";

import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BackgroundCheckProviderSettingsProps = {
  initialSettings: {
    provider: "checkr" | "truora";
    enabled: boolean;
    auto_initiate: boolean;
  };
};

export function BackgroundCheckProviderSettings({
  initialSettings,
}: BackgroundCheckProviderSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch("/api/admin/settings/background-check-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccessMessage("Settings saved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div>
        <label
          className="mb-2 block font-semibold text-red-700 text-sm dark:text-red-200"
          htmlFor="provider"
        >
          Background Check Provider
        </label>
        <Select
          onValueChange={(value) =>
            setSettings({ ...settings, provider: value as "checkr" | "truora" })
          }
          value={settings.provider}
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checkr">
              <div className="flex items-center gap-3">
                <div className="bg-white px-2 py-1 dark:bg-neutral-950">
                  <span className="font-semibold text-neutral-900 text-xs dark:text-neutral-100">
                    Checkr
                  </span>
                </div>
                <span className="text-neutral-600 text-sm dark:text-neutral-400">
                  Industry leader, US & Colombia coverage
                </span>
              </div>
            </SelectItem>
            <SelectItem value="truora">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-900 px-2 py-1 dark:bg-neutral-100/10">
                  <span className="font-semibold text-neutral-900 text-xs dark:text-neutral-100">
                    Truora
                  </span>
                </div>
                <span className="text-neutral-600 text-sm dark:text-neutral-400">
                  Latin America specialist, real-time checks
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-neutral-600 text-xs dark:text-neutral-400">
          Choose which provider to use for background checks. Both support Colombia.
        </p>
      </div>

      {/* Provider Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Checkr Info */}
        <div
          className={`border p-4 transition-all ${
            settings.provider === "checkr"
              ? "border-neutral-900 bg-white dark:border-neutral-100 dark:bg-neutral-950"
              : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="bg-white px-3 py-1 dark:bg-neutral-950">
              <span className="font-bold text-red-700 text-sm dark:text-red-200">Checkr</span>
            </div>
            {settings.provider === "checkr" && (
              <span className="font-semibold text-neutral-900 text-xs dark:text-neutral-100">
                ✓ Active
              </span>
            )}
          </div>
          <ul className="space-y-2 text-red-700 text-sm dark:text-red-200">
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>Global coverage (US, Colombia, 100+ countries)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>Criminal & identity verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>2-5 day turnaround time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>SOC 2 Type II certified</span>
            </li>
          </ul>
        </div>

        {/* Truora Info */}
        <div
          className={`border p-4 transition-all ${
            settings.provider === "truora"
              ? "border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100/10"
              : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="bg-neutral-900 px-3 py-1 dark:bg-neutral-100/10">
              <span className="font-bold text-red-700 text-sm dark:text-red-200">Truora</span>
            </div>
            {settings.provider === "truora" && (
              <span className="font-semibold text-neutral-900 text-xs dark:text-neutral-100">
                ✓ Active
              </span>
            )}
          </div>
          <ul className="space-y-2 text-red-700 text-sm dark:text-red-200">
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>Latin America specialist (Colombia, Mexico, Brazil)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>Real-time criminal checks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>24-48 hour turnaround time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neutral-900 dark:text-neutral-100">✓</span>
              <span>Local data compliance (GDPR, CCPA)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Enable Background Checks */}
      <div className="flex items-center justify-between border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div>
          <p className="font-semibold text-red-700 text-sm dark:text-red-200">
            Enable Background Checks
          </p>
          <p className="text-neutral-600 text-xs dark:text-neutral-400">
            Require background checks for all professional applications
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            checked={settings.enabled}
            className="peer sr-only"
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            type="checkbox"
          />
          <div className="peer -full after: h-6 w-11 bg-[neutral-200]/60 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:border after:border-neutral-400/40 after:bg-white after:transition-all after:content-[''] peer-checked:bg-neutral-900 peer-checked:after:translate-x-full peer-checked:after:border-[neutral-50] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-500/20 dark:border-neutral-500/40 dark:bg-neutral-100 dark:bg-neutral-950 dark:focus:ring-neutral-400/20" />
        </label>
      </div>

      {/* Auto-Initiate Background Checks */}
      <div className="flex items-center justify-between border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div>
          <p className="font-semibold text-red-700 text-sm dark:text-red-200">
            Auto-Initiate Checks
          </p>
          <p className="text-neutral-600 text-xs dark:text-neutral-400">
            Automatically start background checks when applications are submitted
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            checked={settings.auto_initiate}
            className="peer sr-only"
            disabled={!settings.enabled}
            onChange={(e) => setSettings({ ...settings, auto_initiate: e.target.checked })}
            type="checkbox"
          />
          <div className="peer -full after: h-6 w-11 bg-[neutral-200]/60 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:border after:border-neutral-400/40 after:bg-white after:transition-all after:content-[''] peer-checked:bg-neutral-900 peer-checked:after:translate-x-full peer-checked:after:border-[neutral-50] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-500/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:border-neutral-500/40 dark:bg-neutral-100 dark:bg-neutral-950 dark:focus:ring-neutral-400/20" />
        </label>
      </div>

      {/* Info Box */}
      <div className="border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-start gap-3">
          <HugeiconsIcon
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-900 dark:text-neutral-100"
            icon={SecurityCheckIcon}
          />
          <div>
            <p className="mb-1 font-semibold text-red-700 text-sm dark:text-red-200">
              About Background Checks
            </p>
            <p className="text-neutral-900 text-xs leading-relaxed dark:text-neutral-100">
              Background checks help ensure the safety and trustworthiness of professionals on your
              platform. Both Checkr and Truora provide comprehensive criminal background checks and
              identity verification services that comply with Colombian regulations. Checks
              typically include: national criminal database search, identity verification, and
              professional reference validation.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border border-neutral-900 bg-white p-4 dark:border-neutral-100/30 dark:bg-neutral-950">
          <p className="text-red-700 text-sm dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div className="border border-neutral-900 bg-neutral-900 p-4 dark:border-neutral-100/40 dark:bg-neutral-100/10">
          <p className="text-red-700 text-sm dark:text-red-200">{successMessage}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="bg-neutral-900 px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
          disabled={isSaving}
          onClick={handleSave}
          type="button"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
