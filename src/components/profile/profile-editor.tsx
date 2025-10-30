"use client";

import { useState } from "react";
import { User, Mail, Phone, Globe, Award, CheckCircle } from "lucide-react";

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
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch("/api/professional/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: profile.full_name,
          bio: profile.bio,
          languages: profile.languages,
          phone_number: profile.phone_number,
          avatar_url: profile.avatar_url,
          primary_services: profile.primary_services,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
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
      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">Profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-800">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-[#211f1a]">
          <User className="h-5 w-5" />
          <h3>Basic Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#211f1a]">
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your full name"
              className="w-full rounded-xl border border-[#ebe5d8] bg-white px-4 py-3 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#211f1a]">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-[#ebe5d8] bg-[#fbfaf9] px-4 py-3">
              <Mail className="h-4 w-4 text-[#7d7566]" />
              <span className="text-base text-[#7d7566]">{profile.email}</span>
            </div>
            <p className="mt-1 text-xs text-[#7d7566]">
              Email cannot be changed here. Contact support if needed.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#211f1a]">
              Phone Number
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-[#ebe5d8] bg-white px-4 py-3 shadow-sm">
              <Phone className="h-4 w-4 text-[#7d7566]" />
              <input
                type="tel"
                value={profile.phone_number}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                placeholder="+57 300 123 4567"
                className="flex-1 text-base focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#211f1a]">
              Avatar URL
            </label>
            <input
              type="url"
              value={profile.avatar_url}
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full rounded-xl border border-[#ebe5d8] bg-white px-4 py-3 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
            />
            <p className="mt-1 text-xs text-[#7d7566]">
              Public profile photo URL
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-[#211f1a]">
          <Award className="h-5 w-5" />
          <h3>Professional Summary</h3>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#211f1a]">
            Bio
          </label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell customers about your experience, specialties, and what makes you great..."
            rows={5}
            className="w-full rounded-xl border border-[#ebe5d8] bg-white px-4 py-3 text-base shadow-sm focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4633]"
          />
          <p className="mt-1 text-xs text-[#7d7566]">
            {profile.bio.length}/500 characters
          </p>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-[#211f1a]">
          <Globe className="h-5 w-5" />
          <h3>Languages</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language}
              onClick={() => handleLanguageToggle(language)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                profile.languages.includes(language)
                  ? "border-[#ff5d46] bg-[#ff5d46] text-white"
                  : "border-[#ebe5d8] bg-white text-[#211f1a] hover:border-[#ff5d46] hover:text-[#ff5d46]"
              }`}
            >
              {language}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#7d7566]">
          Select all languages you can communicate in
        </p>
      </div>

      {/* Primary Services */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-[#211f1a]">
          <Award className="h-5 w-5" />
          <h3>Primary Services</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((service) => (
            <button
              key={service}
              onClick={() => handleServiceToggle(service)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                profile.primary_services.includes(service)
                  ? "border-[#ff5d46] bg-[#ff5d46] text-white"
                  : "border-[#ebe5d8] bg-white text-[#211f1a] hover:border-[#ff5d46] hover:text-[#ff5d46]"
              }`}
            >
              {service}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#7d7566]">
          Select all services you offer
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 border-t border-[#ebe5d8] pt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-full bg-[#ff5d46] px-8 py-3 text-base font-semibold text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#eb6c65] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
