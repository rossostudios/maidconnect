"use client";

import { Location01Icon, MapsIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { TravelBuffer } from "@/types";

type ServiceRadiusEditorProps = {
  travelBuffer: TravelBuffer | null;
  onUpdate: (buffer: Partial<TravelBuffer>) => Promise<void>;
};

/**
 * Service Radius Editor Component
 *
 * Allows professionals to set their service area radius and center location.
 * Includes travel time buffers for calendar conflict detection.
 */
export function ServiceRadiusEditor({ travelBuffer, onUpdate }: ServiceRadiusEditorProps) {
  const t = useTranslations("components.serviceRadiusEditor");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [localBuffer, setLocalBuffer] = useState<Partial<TravelBuffer>>({
    serviceRadiusKm: travelBuffer?.serviceRadiusKm || 10,
    serviceLocation: travelBuffer?.serviceLocation || { lat: 0, lng: 0 },
    travelBufferBeforeMinutes: travelBuffer?.travelBufferBeforeMinutes || 30,
    travelBufferAfterMinutes: travelBuffer?.travelBufferAfterMinutes || 30,
    avgTravelSpeedKmh: travelBuffer?.avgTravelSpeedKmh || 30,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(localBuffer);
      setEditing(false);
    } catch (error) {
      console.error("Failed to save service radius:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalBuffer({
      serviceRadiusKm: travelBuffer?.serviceRadiusKm || 10,
      serviceLocation: travelBuffer?.serviceLocation || { lat: 0, lng: 0 },
      travelBufferBeforeMinutes: travelBuffer?.travelBufferBeforeMinutes || 30,
      travelBufferAfterMinutes: travelBuffer?.travelBufferAfterMinutes || 30,
      avgTravelSpeedKmh: travelBuffer?.avgTravelSpeedKmh || 30,
    });
    setEditing(false);
  };

  return (
    <div className="rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HugeiconsIcon className="h-6 w-6 text-[#64748b]" icon={MapsIcon} />
          <h3 className="font-semibold text-[#0f172a] text-lg">{t("title")}</h3>
        </div>

        {editing ? (
          <div className="flex gap-2">
            <button
              className="rounded-xl border-2 border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 font-medium text-[#0f172a] text-sm transition hover:bg-[#f8fafc]"
              onClick={handleCancel}
              type="button"
            >
              {t("cancel")}
            </button>
            <button
              className="rounded-xl bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b] disabled:opacity-50"
              disabled={saving}
              onClick={handleSave}
              type="button"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        ) : (
          <button
            className="rounded-xl bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
            onClick={() => setEditing(true)}
            type="button"
          >
            {t("edit")}
          </button>
        )}
      </div>

      {/* Service Radius Slider */}
      <div className="mb-6">
        <label className="mb-2 block font-medium text-[#0f172a] text-sm">{t("radiusLabel")}</label>
        <div className="flex items-center gap-4">
          <input
            className="flex-1"
            disabled={!editing}
            max={100}
            min={1}
            onChange={(e) =>
              setLocalBuffer({
                ...localBuffer,
                serviceRadiusKm: Number.parseFloat(e.target.value),
              })
            }
            step={0.5}
            type="range"
            value={localBuffer.serviceRadiusKm}
          />
          <span className="w-16 text-right font-semibold text-[#0f172a] text-lg">
            {localBuffer.serviceRadiusKm} km
          </span>
        </div>
        <p className="mt-2 text-[#94a3b8] text-xs">
          {t("radiusDescription", { radius: localBuffer.serviceRadiusKm || 10 })}
        </p>
      </div>

      {/* Travel Buffers */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-[#0f172a] text-sm">
            {t("bufferBeforeLabel")}
          </label>
          <select
            className="w-full rounded-lg border-2 border-[#e2e8f0] px-3 py-2 text-sm disabled:bg-[#f8fafc]"
            disabled={!editing}
            onChange={(e) =>
              setLocalBuffer({
                ...localBuffer,
                travelBufferBeforeMinutes: Number.parseInt(e.target.value, 10),
              })
            }
            value={localBuffer.travelBufferBeforeMinutes}
          >
            <option value={15}>15 {t("minutes")}</option>
            <option value={30}>30 {t("minutes")}</option>
            <option value={45}>45 {t("minutes")}</option>
            <option value={60}>60 {t("minutes")}</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium text-[#0f172a] text-sm">
            {t("bufferAfterLabel")}
          </label>
          <select
            className="w-full rounded-lg border-2 border-[#e2e8f0] px-3 py-2 text-sm disabled:bg-[#f8fafc]"
            disabled={!editing}
            onChange={(e) =>
              setLocalBuffer({
                ...localBuffer,
                travelBufferAfterMinutes: Number.parseInt(e.target.value, 10),
              })
            }
            value={localBuffer.travelBufferAfterMinutes}
          >
            <option value={15}>15 {t("minutes")}</option>
            <option value={30}>30 {t("minutes")}</option>
            <option value={45}>45 {t("minutes")}</option>
            <option value={60}>60 {t("minutes")}</option>
          </select>
        </div>
      </div>

      {/* Service Location (Placeholder - would integrate with map in real implementation) */}
      <div className="mb-6">
        <label className="mb-2 flex items-center gap-2 font-medium text-[#0f172a] text-sm">
          <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
          {t("locationLabel")}
        </label>
        <div className="rounded-lg border-2 border-[#e2e8f0] bg-[#f8fafc] p-4">
          <p className="text-[#94a3b8] text-sm">
            {travelBuffer?.serviceLocation
              ? `${t("currentLocation")}: ${travelBuffer.serviceLocation.lat.toFixed(4)}, ${travelBuffer.serviceLocation.lng.toFixed(4)}`
              : t("noLocationSet")}
          </p>
          {editing && (
            <button
              className="mt-3 rounded-lg bg-[#64748b] px-4 py-2 font-medium text-[#f8fafc] text-sm transition hover:bg-[#64748b]"
              type="button"
            >
              {t("updateLocation")}
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-xl bg-[#f8fafc] p-4 text-[#64748b] text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-[#64748b]">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
