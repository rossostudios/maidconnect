"use client";

import { Camera01Icon, CheckmarkCircle02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";
import { Button, Form, Input, Label, TextField } from "react-aria-components";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

type ProfileData = {
  fullName: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
};

type Props = {
  initialData: ProfileData;
  onSave: (data: Partial<ProfileData>) => Promise<{ success: boolean; error?: string }>;
};

export function ProfileEditForm({ initialData, onSave }: Props) {
  const t = useTranslations("dashboard.customer.settings.profile");
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: initialData.fullName || "",
    phone: initialData.phone || "",
    city: initialData.city || "",
  });

  const handleSave = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await onSave({
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
      });

      if (result.success) {
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save");
      }
    });
  }, [formData, onSave]);

  const handleCancel = () => {
    setFormData({
      fullName: initialData.fullName || "",
      phone: initialData.phone || "",
      city: initialData.city || "",
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      {/* Header with gradient accent */}
      <div className="relative border-neutral-100 border-b bg-gradient-to-r from-neutral-50 to-rausch-50/30 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar with edit overlay */}
            <div className="group relative">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md ring-2 ring-neutral-100">
                {initialData.avatarUrl ? (
                  <Image
                    alt={initialData.fullName || "Profile"}
                    className="object-cover"
                    fill
                    src={initialData.avatarUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rausch-100 to-rausch-200">
                    <span
                      className={cn("font-semibold text-2xl text-rausch-600", geistSans.className)}
                    >
                      {(initialData.fullName || initialData.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Avatar edit overlay */}
              <button
                aria-label="Change avatar"
                className="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-900/60 opacity-0 transition-opacity group-hover:opacity-100"
                type="button"
              >
                <HugeiconsIcon className="h-6 w-6 text-white" icon={Camera01Icon} />
              </button>
            </div>

            <div>
              <h2 className={cn("font-semibold text-neutral-900 text-xl", geistSans.className)}>
                {initialData.fullName || t("title")}
              </h2>
              <p className="mt-0.5 text-neutral-500 text-sm">{initialData.email}</p>
            </div>
          </div>

          {/* Edit/Save buttons */}
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-green-600 text-sm">
                <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle02Icon} />
                <span className="font-medium">Saved</span>
              </div>
            )}

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-600 text-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:opacity-50"
                  isDisabled={isPending}
                  onPress={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="flex items-center gap-2 rounded-lg bg-rausch-500 px-5 py-2 font-medium text-sm text-white shadow-sm transition hover:bg-rausch-600 focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2 disabled:opacity-50"
                  isDisabled={isPending}
                  onPress={handleSave}
                >
                  {isPending && (
                    <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
                  )}
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                className="rounded-lg border border-neutral-200 bg-white px-5 py-2 font-medium text-neutral-700 text-sm shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-rausch-500 focus:ring-offset-2"
                onPress={() => setIsEditing(true)}
              >
                {t("edit") || "Edit Profile"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="p-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Form className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Full Name */}
            <TextField
              className="group"
              isDisabled={!isEditing}
              onChange={(value) => setFormData((prev) => ({ ...prev, fullName: value }))}
              value={formData.fullName}
            >
              <Label className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("fullName")}
              </Label>
              <Input
                className={cn(
                  "w-full rounded-lg border bg-neutral-50 px-4 py-3 text-base text-neutral-900 transition",
                  "focus:border-rausch-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                  isEditing
                    ? "border-neutral-200 hover:border-neutral-300"
                    : "cursor-default border-transparent"
                )}
                placeholder="Enter your full name"
              />
            </TextField>

            {/* Email (read-only) */}
            <TextField className="group" isDisabled value={initialData.email}>
              <Label className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("email")}
              </Label>
              <div className="relative">
                <Input className="w-full cursor-not-allowed rounded-lg border border-transparent bg-neutral-50 px-4 py-3 text-base text-neutral-500" />
                <span className="-translate-y-1/2 absolute top-1/2 right-3 rounded-full bg-neutral-200 px-2 py-0.5 text-neutral-500 text-xs">
                  Cannot change
                </span>
              </div>
            </TextField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Phone */}
            <TextField
              className="group"
              isDisabled={!isEditing}
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
              value={formData.phone}
            >
              <Label className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("phone")}
              </Label>
              <Input
                className={cn(
                  "w-full rounded-lg border bg-neutral-50 px-4 py-3 text-base text-neutral-900 transition",
                  "focus:border-rausch-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                  isEditing
                    ? "border-neutral-200 hover:border-neutral-300"
                    : "cursor-default border-transparent"
                )}
                placeholder="+57 300 123 4567"
                type="tel"
              />
            </TextField>

            {/* City */}
            <TextField
              className="group"
              isDisabled={!isEditing}
              onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
              value={formData.city}
            >
              <Label className="mb-2 block font-semibold text-neutral-700 text-xs uppercase tracking-wider">
                {t("city")}
              </Label>
              <Input
                className={cn(
                  "w-full rounded-lg border bg-neutral-50 px-4 py-3 text-base text-neutral-900 transition",
                  "focus:border-rausch-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rausch-500/20",
                  isEditing
                    ? "border-neutral-200 hover:border-neutral-300"
                    : "cursor-default border-transparent"
                )}
                placeholder="Bogotá"
              />
            </TextField>
          </div>
        </Form>

        {/* Helper note */}
        {!isEditing && (
          <div className="mt-8 rounded-lg bg-neutral-50 p-4">
            <p className="text-neutral-500 text-sm">
              <strong className="text-neutral-700">{t("note")}:</strong> {t("noteDescription")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
