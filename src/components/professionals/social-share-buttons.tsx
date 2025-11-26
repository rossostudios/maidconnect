"use client";

import {
  CheckmarkCircle02Icon,
  Facebook01Icon,
  Linkedin01Icon,
  MessageMultiple02Icon,
  NewTwitterIcon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { trackSocialShareClicked } from "@/lib/analytics/professional-events";
import { cn } from "@/lib/utils/core";

// ========================================
// Types
// ========================================

type SocialShareButtonsProps = {
  /**
   * URL to share
   */
  url: string;

  /**
   * Title/headline for the share
   */
  title: string;

  /**
   * Description/text for the share
   */
  description?: string;

  /**
   * Compact mode (icon-only buttons)
   */
  compact?: boolean;

  /**
   * Custom class name
   */
  className?: string;

  /**
   * Professional ID for analytics tracking
   */
  professionalId?: string;

  /**
   * Whether the profile has earnings badge enabled
   */
  hasEarningsBadge?: boolean;
};

// ========================================
// Social Share URLs
// ========================================

/**
 * Generates WhatsApp share URL
 * Opens WhatsApp with pre-filled message
 */
function getWhatsAppUrl(text: string, url: string): string {
  const message = `${text}\n\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Generates Facebook share URL
 * Opens Facebook share dialog
 */
function getFacebookUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/**
 * Generates Twitter/X share URL
 * Opens Twitter compose with pre-filled text
 */
function getTwitterUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/**
 * Generates LinkedIn share URL
 * Opens LinkedIn share dialog
 */
function getLinkedInUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

// ========================================
// Social Share Buttons Component
// ========================================

/**
 * SocialShareButtons - Share professional profile on social media
 *
 * Features:
 * - WhatsApp sharing (mobile-optimized)
 * - Facebook sharing
 * - Twitter/X sharing
 * - LinkedIn sharing
 * - Copy link to clipboard
 * - Toast notifications
 * - Compact mode for minimal UI
 *
 * @example
 * ```tsx
 * <SocialShareButtons
 *   url="https://casaora.co/pro/maria-garcia-abc123"
 *   title="María García - House Cleaning Professional"
 *   description="Book verified cleaning services in Bogotá"
 * />
 * ```
 */
export function SocialShareButtons({
  url,
  title,
  description,
  compact = false,
  className,
  professionalId,
  hasEarningsBadge = false,
}: SocialShareButtonsProps) {
  const t = useTranslations("components.socialShare");
  const [copied, setCopied] = useState(false);

  // ========================================
  // Share Handlers
  // ========================================

  const handleWhatsAppShare = () => {
    const shareText = description ? `${title}\n${description}` : title;
    const shareUrl = getWhatsAppUrl(shareText, url);
    window.open(shareUrl, "_blank", "noopener,noreferrer");

    // Track analytics
    if (professionalId) {
      trackSocialShareClicked({
        professionalId,
        platform: "whatsapp",
        profileUrl: url,
        hasEarningsBadge,
      });
    }
  };

  const handleFacebookShare = () => {
    const shareUrl = getFacebookUrl(url);
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");

    // Track analytics
    if (professionalId) {
      trackSocialShareClicked({
        professionalId,
        platform: "facebook",
        profileUrl: url,
        hasEarningsBadge,
      });
    }
  };

  const handleTwitterShare = () => {
    const shareUrl = getTwitterUrl(title, url);
    window.open(shareUrl, "_blank", "width=600,height=400,noopener,noreferrer");

    // Track analytics
    if (professionalId) {
      trackSocialShareClicked({
        professionalId,
        platform: "twitter",
        profileUrl: url,
        hasEarningsBadge,
      });
    }
  };

  const handleLinkedInShare = () => {
    const shareUrl = getLinkedInUrl(url);
    window.open(shareUrl, "_blank", "width=600,height=600,noopener,noreferrer");

    // Track analytics
    if (professionalId) {
      trackSocialShareClicked({
        professionalId,
        platform: "linkedin",
        profileUrl: url,
        hasEarningsBadge,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("copySuccess"));

      // Track analytics
      if (professionalId) {
        trackSocialShareClicked({
          professionalId,
          platform: "copy_link",
          profileUrl: url,
          hasEarningsBadge,
        });
      }

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error(t("copyError"));
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });

        // Track analytics
        if (professionalId) {
          trackSocialShareClicked({
            professionalId,
            platform: "native",
            profileUrl: url,
            hasEarningsBadge,
          });
        }
      } catch (error) {
        // User cancelled share or error occurred
        console.error("Native share error:", error);
      }
    }
  };

  // ========================================
  // Render
  // ========================================

  const buttonSize = compact ? "sm" : "default";
  const iconSize = compact ? "size-4" : "size-5";

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      data-testid="social-share-buttons"
    >
      {/* Native Share (Mobile) */}
      {typeof navigator !== "undefined" && navigator.share && (
        <Button className="gap-2" onClick={handleNativeShare} size={buttonSize} variant="outline">
          <HugeiconsIcon className={iconSize} icon={Share01Icon} />
          {!compact && t("share")}
        </Button>
      )}

      {/* WhatsApp */}
      <Button
        aria-label={t("whatsapp")}
        className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
        data-testid="share-whatsapp"
        onClick={handleWhatsAppShare}
        size={buttonSize}
        variant="outline"
      >
        <HugeiconsIcon className={iconSize} icon={MessageMultiple02Icon} />
        {!compact && t("whatsapp")}
      </Button>

      {/* Facebook */}
      <Button
        aria-label={t("facebook")}
        className="gap-2 border-babu-200 bg-babu-50 text-babu-700 hover:bg-babu-100 hover:text-babu-800"
        data-testid="share-facebook"
        onClick={handleFacebookShare}
        size={buttonSize}
        variant="outline"
      >
        <HugeiconsIcon className={iconSize} icon={Facebook01Icon} />
        {!compact && t("facebook")}
      </Button>

      {/* Twitter/X */}
      <Button
        aria-label={t("twitter")}
        className="gap-2 border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800"
        onClick={handleTwitterShare}
        size={buttonSize}
        variant="outline"
      >
        <HugeiconsIcon className={iconSize} icon={NewTwitterIcon} />
        {!compact && t("twitter")}
      </Button>

      {/* LinkedIn */}
      <Button
        aria-label={t("linkedin")}
        className="gap-2 border-babu-200 bg-babu-50 text-babu-700 hover:bg-babu-100 hover:text-babu-800"
        onClick={handleLinkedInShare}
        size={buttonSize}
        variant="outline"
      >
        <HugeiconsIcon className={iconSize} icon={Linkedin01Icon} />
        {!compact && t("linkedin")}
      </Button>

      {/* Copy Link */}
      <Button
        aria-label={t("copyLink")}
        className={cn(
          "gap-2",
          copied &&
            "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
        )}
        data-testid="copy-profile-url"
        onClick={handleCopyLink}
        size={buttonSize}
        variant="outline"
      >
        {copied ? (
          <>
            <HugeiconsIcon className={iconSize} icon={CheckmarkCircle02Icon} />
            {!compact && t("copied")}
          </>
        ) : (
          <>
            <HugeiconsIcon className={iconSize} icon={Share01Icon} />
            {!compact && t("copyLink")}
          </>
        )}
      </Button>
    </div>
  );
}

// ========================================
// Share Section Component
// ========================================

type ShareSectionProps = {
  url: string;
  professionalName: string;
  service?: string;
  className?: string;
};

/**
 * ShareSection - Call-to-action section for sharing professional profile
 *
 * Displays a prominent share section with heading, description, and share buttons
 *
 * @example
 * ```tsx
 * <ShareSection
 *   url="https://casaora.co/pro/maria-garcia-abc123"
 *   professionalName="María García"
 *   service="House Cleaning"
 * />
 * ```
 */
export function ShareSection({ url, professionalName, service, className }: ShareSectionProps) {
  const t = useTranslations("components.shareSection");

  const title = service
    ? `${professionalName} - ${service} · Casaora`
    : `${professionalName} · Casaora`;

  const description = t("description", { name: professionalName });

  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-8 shadow-sm", className)}>
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="flex size-12 items-center justify-center rounded-full bg-rausch-100">
          <HugeiconsIcon className="size-6 text-rausch-600" icon={Share01Icon} />
        </div>

        {/* Heading */}
        <h3 className={cn("mt-4 font-semibold text-neutral-900 text-xl", geistSans.className)}>
          {t("title")}
        </h3>

        {/* Description */}
        <p className={cn("mt-2 max-w-md text-neutral-600", geistSans.className)}>{description}</p>

        {/* Share Buttons */}
        <div className="mt-6">
          <SocialShareButtons description={description} title={title} url={url} />
        </div>

        {/* URL Preview */}
        <div className="mt-6 w-full max-w-lg rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className={cn("truncate text-neutral-500 text-sm", geistSans.className)}>{url}</p>
        </div>
      </div>
    </div>
  );
}
