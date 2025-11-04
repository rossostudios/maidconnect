"use client";

import { Bug, Palette, Shield, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";

type Changelog = {
  id: string;
  sprint_number: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  published_at: string;
  categories: string[];
  tags: string[];
  target_audience: string[];
  featured_image_url: string | null;
};

type ChangelogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  changelog: Changelog | null;
};

const categoryConfig = {
  features: { icon: Sparkles, label: "Features", color: "text-purple-600 bg-purple-50" },
  improvements: { icon: Zap, label: "Improvements", color: "text-blue-600 bg-blue-50" },
  fixes: { icon: Bug, label: "Fixes", color: "text-green-600 bg-green-50" },
  security: { icon: Shield, label: "Security", color: "text-red-600 bg-red-50" },
  design: { icon: Palette, label: "Design", color: "text-pink-600 bg-pink-50" },
};

export function ChangelogModal({ isOpen, onClose, changelog }: ChangelogModalProps) {
  const router = useRouter();
  const t = useTranslations("changelog");

  const markAsReadMutation = useApiMutation({
    url: "/api/changelog/mark-read",
    method: "POST",
    refreshOnSuccess: true,
    onSuccess: () => {
      onClose();
    },
  });

  const handleMarkAsRead = async () => {
    if (!changelog) {
      return;
    }

    try {
      await markAsReadMutation.mutate({ changelogId: changelog.id });
    } catch (error) {
      console.error("Error marking changelog as read:", error);
    }
  };

  if (!changelog) {
    return null;
  }

  const formattedDate = new Date(changelog.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <BaseModal
      closeOnBackdropClick={true}
      closeOnEscape={true}
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      size="2xl"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-[#8B735520] px-3 py-1 font-semibold text-[#8B7355] text-sm">
            Sprint {changelog.sprint_number}
          </span>
          <span className="text-[#7a6d62] text-sm">{formattedDate}</span>
        </div>
        <h2 className="font-bold text-3xl text-[#211f1a]">{changelog.title}</h2>
        {changelog.summary && (
          <p className="mt-3 text-[#5d574b] text-lg leading-relaxed">{changelog.summary}</p>
        )}
      </div>

      {/* Categories */}
      {changelog.categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {changelog.categories.map((category: string) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            if (!config) {
              return null;
            }

            const Icon = config.icon;

            return (
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-sm ${config.color}`}
                key={category}
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Featured Image */}
      {changelog.featured_image_url && (
        <div className="mb-6 overflow-hidden rounded-2xl">
          <Image
            alt={changelog.title}
            className="h-auto w-full object-cover"
            height={300}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 600px"
            src={changelog.featured_image_url}
            width={600}
          />
        </div>
      )}

      {/* Content */}
      {/* Security: dangerouslySetInnerHTML is required to render rich HTML content from changelog entries.
          Content is admin-controlled and sanitized before storage in Supabase. */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: changelog.content }}
      />

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 border-[#ebe5d8] border-t pt-6 sm:flex-row">
        <button
          className="flex-1 rounded-full border-2 border-[#ebe5d8] bg-white px-6 py-3 font-semibold text-[#211f1a] text-base transition hover:border-[#8B7355] hover:text-[#8B7355]"
          onClick={() => router.push("/changelog")}
          type="button"
        >
          {t("viewAllUpdates")}
        </button>
        <button
          className="flex-1 rounded-full bg-[#8B7355] px-6 py-3 font-semibold text-base text-white transition hover:bg-[#8B7355] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={markAsReadMutation.isLoading}
          onClick={handleMarkAsRead}
          type="button"
        >
          {markAsReadMutation.isLoading ? t("marking") : t("gotIt")}
        </button>
      </div>
    </BaseModal>
  );
}
