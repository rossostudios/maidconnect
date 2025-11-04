"use client";

import { Location01Icon, MapsIcon } from "hugeicons-react";
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
export function ServiceRadiusEditor({
  travelBuffer,
  onUpdate,
}: ServiceRadiusEditorProps) {
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
    <div className="rounded-[24px] border-2 border-[#e5e7eb] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapsIcon className="h-6 w-6 text-[var(--red)]" />
          <h3 className="font-semibold text-[var(--foreground)] text-lg">
            {t("title")}
          </h3>
        </div>

        {!editing ? (
          <button
            className="rounded-xl bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#cc3333]"
            onClick={() => setEditing(true)}
            type="button"
          >
            {t("edit")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="rounded-xl border-2 border-[#e5e7eb] bg-white px-4 py-2 font-medium text-sm text-[var(--foreground)] transition hover:bg-[#f9fafb]"
              onClick={handleCancel}
              type="button"
            >
              {t("cancel")}
            </button>
            <button
              className="rounded-xl bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#cc3333] disabled:opacity-50"
              disabled={saving}
              onClick={handleSave}
              type="button"
            >
              {saving ? t("saving") : t("save")}
            </button>
          </div>
        )}
      </div>

      {/* Service Radius Slider */}
      <div className="mb-6">
        <label className="mb-2 block font-medium text-[var(--foreground)] text-sm">
          {t("radiusLabel")}
        </label>
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
          <span className="w-16 text-right font-semibold text-[var(--foreground)] text-lg">
            {localBuffer.serviceRadiusKm} km
          </span>
        </div>
        <p className="mt-2 text-[#6b7280] text-xs">
          {t("radiusDescription", { radius: localBuffer.serviceRadiusKm || 10 })}
        </p>
      </div>

      {/* Travel Buffers */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium text-[var(--foreground)] text-sm">
            {t("bufferBeforeLabel")}
          </label>
          <select
            className="w-full rounded-lg border-2 border-[#d1d5db] px-3 py-2 text-sm disabled:bg-[#f3f4f6]"
            disabled={!editing}
            onChange={(e) =>
              setLocalBuffer({
                ...localBuffer,
                travelBufferBeforeMinutes: Number.parseInt(e.target.value),
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
          <label className="mb-2 block font-medium text-[var(--foreground)] text-sm">
            {t("bufferAfterLabel")}
          </label>
          <select
            className="w-full rounded-lg border-2 border-[#d1d5db] px-3 py-2 text-sm disabled:bg-[#f3f4f6]"
            disabled={!editing}
            onChange={(e) =>
              setLocalBuffer({
                ...localBuffer,
                travelBufferAfterMinutes: Number.parseInt(e.target.value),
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
        <label className="mb-2 flex items-center gap-2 font-medium text-[var(--foreground)] text-sm">
          <Location01Icon className="h-4 w-4" />
          {t("locationLabel")}
        </label>
        <div className="rounded-lg border-2 border-[#d1d5db] bg-[#f9fafb] p-4">
          <p className="text-[#6b7280] text-sm">
            {travelBuffer?.serviceLocation
              ? `${t("currentLocation")}: ${travelBuffer.serviceLocation.lat.toFixed(4)}, ${travelBuffer.serviceLocation.lng.toFixed(4)}`
              : t("noLocationSet")}
          </p>
          {editing && (
            <button
              className="mt-3 rounded-lg bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#cc3333]"
              type="button"
            >
              {t("updateLocation")}
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-xl bg-blue-50 p-4 text-blue-900 text-sm">
        <p className="font-semibold">{t("helpTitle")}</p>
        <p className="mt-1 text-blue-800">{t("helpDescription")}</p>
      </div>
    </div>
  );
}
