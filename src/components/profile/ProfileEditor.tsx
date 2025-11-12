"use client";

import {
  Award01Icon,
  CallIcon,
  CheckmarkCircle01Icon,
  GlobeIcon,
  Mail01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

type Profile = {
  full_name: string;
  email: string;
  bio: string;
  languages: string[];
  phone_number: string;
  avatar_url: string;
  primary_services: string[];
};

type Props = {
  profile: Profile;
};

// React 19: Submission state for useActionState
type SubmissionState = {
  status: "idle" | "success" | "error";
  error: string | null;
};

const LANGUAGE_OPTIONS = ["English", "Español", "Português", "Français", "Deutsch"];
const SERVICE_OPTIONS = [
  "House cleaning",
  "Laundry",
  "Cooking",
  "Organization",
  "Childcare",
  "Pet care",
  "Errand running",
  "Gardening",
  "Elder care",
];

export function ProfileEditor({ profile: initialProfile }: Props) {
  const t = useTranslations("dashboard.pro.profileEditor");
  const [profile, setProfile] = useState(initialProfile);

  // React 19: useActionState for form submission - replaces loading, success, error states
  const [submissionState, submitAction, isPending] = useActionState<SubmissionState, Profile>(
    async (_prevState: SubmissionState, profileData: Profile): Promise<SubmissionState> => {
      const savePromise = fetch("/api/professional/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profileData.full_name,
          bio: profileData.bio,
          languages: profileData.languages,
          phone_number: profileData.phone_number,
          avatar_url: profileData.avatar_url,
          primary_services: profileData.primary_services,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update profile");
        }
        return response;
      });

      try {
        await toast.promise(savePromise, {
          loading: "Saving profile...",
          success: "Profile updated successfully",
          error: (err) => err.message || "Failed to update profile",
        });
        return { status: "success", error: null };
      } catch (err) {
        return {
          status: "error",
          error: err instanceof Error ? err.message : "Failed to update profile",
        };
      }
    },
    { status: "idle", error: null }
  );

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (submissionState.status === "success") {
      const timeout = setTimeout(() => {
        // Success message will naturally disappear when status changes
      }, 3000);
      return () => clearTimeout(timeout);
    }
    return;
  }, [submissionState.status]);

  // React 19: Simplified save handler - useActionState manages loading, success, and error
  const handleSave = () => {
    submitAction(profile);
  };

  const handleLanguageToggle = (language: string) => {
    setProfile((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleServiceToggle = (service: string) => {
    setProfile((prev) => ({
      ...prev,
      primary_services: prev.primary_services.includes(service)
        ? prev.primary_services.filter((s) => s !== service)
        : [...prev.primary_services, service],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {submissionState.status === "success" && (
        <div className="flex items-center gap-3 rounded-xl bg-[neutral-500]/10 p-4 text-[neutral-500]">
          <HugeiconsIcon className="h-5 w-5" icon={CheckmarkCircle01Icon} />
          <p className="font-semibold text-sm">{t("success")}</p>
        </div>
      )}

      {submissionState.error && (
        <div className="rounded-xl bg-[neutral-500]/10 p-4 text-[neutral-500]">
          <p className="font-semibold text-sm">{submissionState.error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-[neutral-900] text-lg">
          <HugeiconsIcon className="h-5 w-5" icon={UserIcon} />
          <h3>{t("sections.basicInfo.title")}</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block font-semibold text-[neutral-900] text-sm"
              htmlFor="profile-fullname"
            >
              {t("sections.basicInfo.fields.fullName.label")}
            </label>
            <input
              className="w-full rounded-xl border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
              id="profile-fullname"
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder={t("sections.basicInfo.fields.fullName.placeholder")}
              type="text"
              value={profile.full_name}
            />
          </div>

          <div>
            <div className="mb-2 block font-semibold text-[neutral-900] text-sm">
              {t("sections.basicInfo.fields.email.label")}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[neutral-200] bg-[neutral-50] px-4 py-3">
              <HugeiconsIcon className="h-4 w-4 text-[neutral-400]" icon={Mail01Icon} />
              <span className="text-[neutral-400] text-base">{profile.email}</span>
            </div>
            <p className="mt-1 text-[neutral-400] text-xs">
              {t("sections.basicInfo.fields.email.helper")}
            </p>
          </div>

          <div>
            <label
              className="mb-2 block font-semibold text-[neutral-900] text-sm"
              htmlFor="profile-phone"
            >
              {t("sections.basicInfo.fields.phoneNumber.label")}
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-[neutral-200] bg-[neutral-50] px-4 py-3 shadow-sm">
              <HugeiconsIcon className="h-4 w-4 text-[neutral-400]" icon={CallIcon} />
              <input
                className="flex-1 text-base focus:outline-none"
                id="profile-phone"
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                placeholder={t("sections.basicInfo.fields.phoneNumber.placeholder")}
                type="tel"
                value={profile.phone_number}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-2 block font-semibold text-[neutral-900] text-sm"
              htmlFor="profile-avatar"
            >
              {t("sections.basicInfo.fields.avatarUrl.label")}
            </label>
            <input
              className="w-full rounded-xl border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
              id="profile-avatar"
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              placeholder={t("sections.basicInfo.fields.avatarUrl.placeholder")}
              type="url"
              value={profile.avatar_url}
            />
            <p className="mt-1 text-[neutral-400] text-xs">
              {t("sections.basicInfo.fields.avatarUrl.helper")}
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-[neutral-900] text-lg">
          <HugeiconsIcon className="h-5 w-5" icon={Award01Icon} />
          <h3>{t("sections.professionalSummary.title")}</h3>
        </div>

        <div>
          <label
            className="mb-2 block font-semibold text-[neutral-900] text-sm"
            htmlFor="profile-bio"
          >
            {t("sections.professionalSummary.fields.bio.label")}
          </label>
          <textarea
            className="w-full rounded-xl border border-[neutral-200] bg-[neutral-50] px-4 py-3 text-base shadow-sm focus:border-[neutral-500] focus:outline-none focus:ring-2 focus:ring-[neutral-500]/20"
            id="profile-bio"
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder={t("sections.professionalSummary.fields.bio.placeholder")}
            rows={5}
            value={profile.bio}
          />
          <p className="mt-1 text-[neutral-400] text-xs">
            {profile.bio.length}
            {t("sections.professionalSummary.fields.bio.characterCounter")}
          </p>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-[neutral-900] text-lg">
          <HugeiconsIcon className="h-5 w-5" icon={GlobeIcon} />
          <h3>{t("sections.languages.title")}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              className={`rounded-full border-2 px-4 py-2 font-semibold text-sm transition ${
                profile.languages.includes(language)
                  ? "border-[neutral-500] bg-[neutral-500] text-[neutral-50]"
                  : "border-[neutral-200] bg-[neutral-50] text-[neutral-900] hover:border-[neutral-500] hover:text-[neutral-500]"
              }`}
              key={language}
              onClick={() => handleLanguageToggle(language)}
              type="button"
            >
              {language}
            </button>
          ))}
        </div>
        <p className="text-[neutral-400] text-xs">{t("sections.languages.helper")}</p>
      </div>

      {/* Primary Services */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-semibold text-[neutral-900] text-lg">
          <HugeiconsIcon className="h-5 w-5" icon={Award01Icon} />
          <h3>{t("sections.services.title")}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((service) => (
            <button
              className={`rounded-full border-2 px-4 py-2 font-semibold text-sm transition ${
                profile.primary_services.includes(service)
                  ? "border-[neutral-500] bg-[neutral-500] text-[neutral-50]"
                  : "border-[neutral-200] bg-[neutral-50] text-[neutral-900] hover:border-[neutral-500] hover:text-[neutral-500]"
              }`}
              key={service}
              onClick={() => handleServiceToggle(service)}
              type="button"
            >
              {service}
            </button>
          ))}
        </div>
        <p className="text-[neutral-400] text-xs">{t("sections.services.helper")}</p>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 border-[neutral-200] border-t pt-6">
        <button
          className="rounded-full bg-[neutral-500] px-8 py-3 font-semibold text-[neutral-50] text-base shadow-[0_6px_18px_rgba(244,74,34,0.22)] transition hover:bg-[neutral-500] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isPending}
          onClick={handleSave}
          type="button"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <title>Loading spinner</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  fill="none"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
              </svg>
              {t("saving")}
            </span>
          ) : (
            t("save")
          )}
        </button>
      </div>
    </div>
  );
}
