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
        <label className="mb-2 block font-semibold text-[#171717] text-sm" htmlFor="provider">
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
                <div className="rounded bg-blue-50 px-2 py-1">
                  <span className="font-semibold text-blue-600 text-xs">Checkr</span>
                </div>
                <span className="text-[#737373] text-sm">
                  Industry leader, US & Colombia coverage
                </span>
              </div>
            </SelectItem>
            <SelectItem value="truora">
              <div className="flex items-center gap-3">
                <div className="rounded bg-purple-50 px-2 py-1">
                  <span className="font-semibold text-purple-600 text-xs">Truora</span>
                </div>
                <span className="text-[#737373] text-sm">
                  Latin America specialist, real-time checks
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-2 text-[#737373] text-xs">
          Choose which provider to use for background checks. Both support Colombia.
        </p>
      </div>

      {/* Provider Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Checkr Info */}
        <div
          className={`rounded-lg border p-4 transition-all ${
            settings.provider === "checkr"
              ? "border-blue-500 bg-blue-50"
              : "border-[#E5E5E5] bg-[#FAFAF9]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded bg-blue-100 px-3 py-1">
              <span className="font-bold text-blue-700 text-sm">Checkr</span>
            </div>
            {settings.provider === "checkr" && (
              <span className="font-semibold text-blue-600 text-xs">✓ Active</span>
            )}
          </div>
          <ul className="space-y-2 text-[#171717] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Global coverage (US, Colombia, 100+ countries)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Criminal & identity verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>2-5 day turnaround time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>SOC 2 Type II certified</span>
            </li>
          </ul>
        </div>

        {/* Truora Info */}
        <div
          className={`rounded-lg border p-4 transition-all ${
            settings.provider === "truora"
              ? "border-purple-500 bg-purple-50"
              : "border-[#E5E5E5] bg-[#FAFAF9]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded bg-purple-100 px-3 py-1">
              <span className="font-bold text-purple-700 text-sm">Truora</span>
            </div>
            {settings.provider === "truora" && (
              <span className="font-semibold text-purple-600 text-xs">✓ Active</span>
            )}
          </div>
          <ul className="space-y-2 text-[#171717] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Latin America specialist (Colombia, Mexico, Brazil)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Real-time criminal checks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>24-48 hour turnaround time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Local data compliance (GDPR, CCPA)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Enable Background Checks */}
      <div className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white p-4">
        <div>
          <p className="font-semibold text-[#171717] text-sm">Enable Background Checks</p>
          <p className="text-[#737373] text-xs">
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
          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#E85D48] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#E85D48]/20" />
        </label>
      </div>

      {/* Auto-Initiate Background Checks */}
      <div className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white p-4">
        <div>
          <p className="font-semibold text-[#171717] text-sm">Auto-Initiate Checks</p>
          <p className="text-[#737373] text-xs">
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
          <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#E85D48] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#E85D48]/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
        </label>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <HugeiconsIcon
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600"
            icon={SecurityCheckIcon}
          />
          <div>
            <p className="mb-1 font-semibold text-blue-900 text-sm">About Background Checks</p>
            <p className="text-blue-800 text-xs leading-relaxed">
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="rounded-lg bg-[#E85D48] px-6 py-3 font-semibold text-sm text-white transition-colors hover:bg-[#D32F40] disabled:opacity-50"
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
