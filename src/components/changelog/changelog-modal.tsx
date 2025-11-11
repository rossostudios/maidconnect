"use client";

import {
  Bug01Icon,
  FlashIcon,
  MagicWand01Icon,
  PaintBoardIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { sanitizeRichContent } from "@/lib/sanitize";

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
  features: { icon: MagicWand01Icon, label: "Features", color: "text-[#64748b] bg-[#64748b]/10" },
  improvements: { icon: FlashIcon, label: "Improvements", color: "text-[#64748b] bg-[#f8fafc]" },
  fixes: { icon: Bug01Icon, label: "Fixes", color: "text-[#64748b] bg-[#64748b]/10" },
  security: { icon: Shield01Icon, label: "Security", color: "text-[#64748b] bg-[#64748b]/10" },
  design: { icon: PaintBoardIcon, label: "Design", color: "text-[#64748b] bg-[#64748b]/10" },
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
          <span className="rounded-full bg-[#64748b]/20 px-3 py-1 font-semibold text-[#64748b] text-sm">
            Sprint {changelog.sprint_number}
          </span>
          <span className="text-[#94a3b8] text-sm">{formattedDate}</span>
        </div>
        <h2 className="font-bold text-3xl text-[#0f172a]">{changelog.title}</h2>
        {changelog.summary && (
          <p className="mt-3 text-[#94a3b8] text-lg leading-relaxed">{changelog.summary}</p>
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
                <HugeiconsIcon className="h-4 w-4" icon={Icon} />
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
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeRichContent(changelog.content) }}
      />

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 border-[#e2e8f0] border-t pt-6 sm:flex-row">
        <button
          className="flex-1 rounded-full border-2 border-[#e2e8f0] bg-[#f8fafc] px-6 py-3 font-semibold text-[#0f172a] text-base transition hover:border-[#64748b] hover:text-[#64748b]"
          onClick={() => router.push("/changelog")}
          type="button"
        >
          {t("viewAllUpdates")}
        </button>
        <button
          className="flex-1 rounded-full bg-[#64748b] px-6 py-3 font-semibold text-[#f8fafc] text-base transition hover:bg-[#64748b] disabled:cursor-not-allowed disabled:opacity-70"
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
