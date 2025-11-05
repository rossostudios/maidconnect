"use client";

import {
  Camera01Icon,
  Cancel01Icon,
  Edit02Icon,
  Tick02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type ProfileData = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  avatar_url?: string | null;
};

type Props = {
  userId: string;
  currentProfile: ProfileData;
};

export function AdminProfileEditor({ userId: _userId, currentProfile }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState(currentProfile);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentProfile.avatar_url || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(currentProfile);
    setAvatarPreview(currentProfile.avatar_url || null);
    setIsEditing(false);
    setError(null);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const { avatarUrl } = await response.json();
      setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      setAvatarPreview(currentProfile.avatar_url || null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Avatar Upload */}
      <div>
        <label className="mb-4 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
          Profile Photo
        </label>
        <div className="flex items-center gap-6">
          <div className="group relative">
            {avatarPreview ? (
              <Image
                alt="Profile photo"
                className="h-24 w-24 rounded-full border-2 border-[#E5E5E5] object-cover"
                height={96}
                src={avatarPreview}
                width={96}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#E5E5E5] bg-[#E63946]/10">
                <HugeiconsIcon className="h-12 w-12 text-[#E63946]" icon={UserCircleIcon} />
              </div>
            )}
            <button
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity disabled:cursor-not-allowed group-hover:opacity-100"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              <HugeiconsIcon className="h-6 w-6 text-white" icon={Camera01Icon} />
            </button>
          </div>
          <div>
            <button
              className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 font-medium text-[#171717] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingAvatar ? "Uploading..." : "Change Photo"}
            </button>
            <p className="mt-2 text-[#737373] text-xs">JPG, PNG or GIF. Max size 5MB.</p>
          </div>
          <input
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            ref={fileInputRef}
            type="file"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
            Full Name
          </label>
          {isEditing ? (
            <input
              className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              type="text"
              value={formData.full_name}
            />
          ) : (
            <p className="text-[#171717]">{currentProfile.full_name || "—"}</p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
            Email
          </label>
          <p className="text-[#737373]">{currentProfile.email}</p>
          <p className="mt-1 text-[#A3A3A3] text-xs">Email cannot be changed</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Phone */}
          <div>
            <label className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
              Phone
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                type="tel"
                value={formData.phone}
              />
            ) : (
              <p className="text-[#171717]">{currentProfile.phone || "—"}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
              City
            </label>
            {isEditing ? (
              <input
                className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                type="text"
                value={formData.city}
              />
            ) : (
              <p className="text-[#171717]">{currentProfile.city || "—"}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="mb-2 block font-semibold text-[#A3A3A3] text-xs uppercase tracking-wider">
            Country
          </label>
          {isEditing ? (
            <input
              className="w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#E63946]"
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              type="text"
              value={formData.country}
            />
          ) : (
            <p className="text-[#171717]">{currentProfile.country || "—"}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        {isEditing ? (
          <>
            <button
              className="flex items-center gap-2 rounded-lg bg-[#E63946] px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[#D32F40] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
              onClick={handleSave}
            >
              <HugeiconsIcon className="h-4 w-4" icon={Tick02Icon} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-6 py-2.5 font-semibold text-[#737373] text-sm transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
              onClick={handleCancel}
            >
              <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
              Cancel
            </button>
          </>
        ) : (
          <button
            className="flex items-center gap-2 rounded-lg bg-[#171717] px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[#404040]"
            onClick={() => setIsEditing(true)}
          >
            <HugeiconsIcon className="h-4 w-4" icon={Edit02Icon} />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
