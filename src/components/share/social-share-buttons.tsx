"use client";

/**
 * Social Share Buttons Component
 *
 * Reusable social sharing buttons for professional profiles.
 * Supports WhatsApp, Facebook, Twitter/X, LinkedIn, and copy link.
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 *
 * @example
 * ```tsx
 * <SocialShareButtons
 *   url="https://casaora.co/pro/maria-garcia"
 *   title="María García - Professional Cleaner"
 *   description="Hire María for professional cleaning services"
 * />
 * ```
 */

import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  Link01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { geistSans } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/core";

// ============================================================================
// Types
// ============================================================================

export type SharePlatform = "whatsapp" | "facebook" | "twitter" | "linkedin" | "copy";

export type SocialShareButtonsProps = {
  /** URL to share */
  url: string;
  /** Title for the share (used in Twitter, LinkedIn) */
  title?: string;
  /** Description for the share */
  description?: string;
  /** Custom hashtags for Twitter (without #) */
  hashtags?: string[];
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show labels */
  showLabels?: boolean;
  /** Platforms to show (defaults to all) */
  platforms?: SharePlatform[];
  /** Callback when share is triggered */
  onShare?: (platform: SharePlatform) => void;
  /** Additional CSS classes */
  className?: string;
};

export type ShareButtonProps = {
  platform: SharePlatform;
  url: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onShare?: (platform: SharePlatform) => void;
  className?: string;
};

// ============================================================================
// Platform Configuration
// ============================================================================

const PLATFORM_CONFIG = {
  whatsapp: {
    name: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#20BD5A]",
    textColor: "text-white",
  },
  facebook: {
    name: "Facebook",
    color: "bg-[#1877F2] hover:bg-[#166AD5]",
    textColor: "text-white",
  },
  twitter: {
    name: "X (Twitter)",
    color: "bg-black hover:bg-neutral-800",
    textColor: "text-white",
  },
  linkedin: {
    name: "LinkedIn",
    color: "bg-[#0A66C2] hover:bg-[#0958A8]",
    textColor: "text-white",
  },
  copy: {
    name: "Copy Link",
    color: "bg-neutral-100 hover:bg-neutral-200",
    textColor: "text-neutral-900",
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    button: "h-8 px-3 text-xs",
    icon: "h-3.5 w-3.5",
    iconOnly: "h-8 w-8",
  },
  md: {
    button: "h-10 px-4 text-sm",
    icon: "h-4 w-4",
    iconOnly: "h-10 w-10",
  },
  lg: {
    button: "h-12 px-5 text-base",
    icon: "h-5 w-5",
    iconOnly: "h-12 w-12",
  },
} as const;

// ============================================================================
// URL Builders
// ============================================================================

function buildWhatsAppUrl(url: string, text?: string): string {
  const shareText = text ? `${text} ${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
}

function buildFacebookUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function buildTwitterUrl(url: string, title?: string, hashtags?: string[]): string {
  const params = new URLSearchParams();
  params.set("url", url);
  if (title) {
    params.set("text", title);
  }
  if (hashtags && hashtags.length > 0) {
    params.set("hashtags", hashtags.join(","));
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function buildLinkedInUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

// ============================================================================
// Custom SVG Icons for Social Platforms
// ============================================================================

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ============================================================================
// Share Button Component
// ============================================================================

export function ShareButton({
  platform,
  url,
  title,
  description,
  hashtags,
  size = "md",
  showLabel = true,
  onShare,
  className,
}: ShareButtonProps) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const config = PLATFORM_CONFIG[platform];
  const sizeConfig = SIZE_CONFIG[size];

  const handleClick = useCallback(async () => {
    onShare?.(platform);

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
      return;
    }

    let shareUrl: string;
    switch (platform) {
      case "whatsapp":
        shareUrl = buildWhatsAppUrl(url, title || description);
        break;
      case "facebook":
        shareUrl = buildFacebookUrl(url);
        break;
      case "twitter":
        shareUrl = buildTwitterUrl(url, title, hashtags);
        break;
      case "linkedin":
        shareUrl = buildLinkedInUrl(url);
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  }, [platform, url, title, description, hashtags, onShare]);

  const getIcon = () => {
    const iconClass = cn(sizeConfig.icon, config.textColor);

    switch (platform) {
      case "whatsapp":
        return <WhatsAppIcon className={iconClass} />;
      case "facebook":
        return <FacebookIcon className={iconClass} />;
      case "twitter":
        return <TwitterXIcon className={iconClass} />;
      case "linkedin":
        return <LinkedInIcon className={iconClass} />;
      case "copy":
        return copied ? (
          <HugeiconsIcon
            className={cn(sizeConfig.icon, "text-green-600")}
            icon={CheckmarkCircle02Icon}
          />
        ) : (
          <HugeiconsIcon className={cn(sizeConfig.icon, config.textColor)} icon={Copy01Icon} />
        );
    }
  };

  const getLabel = () => {
    if (platform === "copy") {
      return copied ? t("copied") : t("copyLink");
    }
    return config.name;
  };

  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2 font-medium transition-all",
        // Rounded corners (Lia Design System)
        "rounded-lg",
        // Focus states
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rausch-500 focus-visible:ring-offset-2",
        // Platform colors
        config.color,
        config.textColor,
        // Size
        showLabel ? sizeConfig.button : sizeConfig.iconOnly,
        // Copied state for copy button
        platform === "copy" && copied && "bg-green-50 text-green-600",
        className
      )}
      onClick={handleClick}
      type="button"
    >
      {getIcon()}
      {showLabel && <span className={geistSans.className}>{getLabel()}</span>}
    </button>
  );
}

// ============================================================================
// Social Share Buttons Component
// ============================================================================

const DEFAULT_PLATFORMS: SharePlatform[] = ["whatsapp", "facebook", "twitter", "linkedin", "copy"];

export function SocialShareButtons({
  url,
  title,
  description,
  hashtags,
  direction = "horizontal",
  size = "md",
  showLabels = true,
  platforms = DEFAULT_PLATFORMS,
  onShare,
  className,
}: SocialShareButtonsProps) {
  const _t = useTranslations("share");

  return (
    <div
      className={cn(
        "flex gap-2",
        direction === "vertical" ? "flex-col" : "flex-row flex-wrap",
        className
      )}
    >
      {platforms.map((platform) => (
        <ShareButton
          description={description}
          hashtags={hashtags}
          key={platform}
          onShare={onShare}
          platform={platform}
          showLabel={showLabels}
          size={size}
          title={title}
          url={url}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Compact Share Button (Single button that opens share menu)
// ============================================================================

export type CompactShareButtonProps = {
  /** URL to share */
  url: string;
  /** Title for the share */
  title?: string;
  /** Description for the share */
  description?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Callback when share is triggered */
  onShare?: (platform: SharePlatform | "native") => void;
  /** Additional CSS classes */
  className?: string;
};

export function CompactShareButton({
  url,
  title,
  description,
  size = "md",
  onShare,
  className,
}: CompactShareButtonProps) {
  const t = useTranslations("share");
  const sizeConfig = SIZE_CONFIG[size];

  const handleClick = useCallback(async () => {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "",
          text: description || "",
          url,
        });
        onShare?.("native");
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(url);
      onShare?.("copy");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [url, title, description, onShare]);

  return (
    <Button
      className={cn("gap-2", sizeConfig.button, className)}
      onClick={handleClick}
      variant="outline"
    >
      <HugeiconsIcon className={sizeConfig.icon} icon={Share01Icon} />
      <span className={geistSans.className}>{t("shareProfile")}</span>
    </Button>
  );
}

// ============================================================================
// Share Link Input (Copy-to-clipboard input field)
// ============================================================================

export type ShareLinkInputProps = {
  /** URL to display and copy */
  url: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Callback when link is copied */
  onCopy?: () => void;
  /** Additional CSS classes */
  className?: string;
};

export function ShareLinkInput({ url, size = "md", onCopy, className }: ShareLinkInputProps) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);
  const _sizeConfig = SIZE_CONFIG[size];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [url, onCopy]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <HugeiconsIcon className="h-4 w-4 flex-shrink-0 text-neutral-400" icon={Link01Icon} />
        <span className={cn("truncate text-neutral-700 text-sm", geistSans.className)}>{url}</span>
      </div>
      <Button
        className={cn(
          "flex-shrink-0 gap-1.5",
          copied && "bg-green-500 text-white hover:bg-green-600"
        )}
        onClick={handleCopy}
        size="sm"
      >
        {copied ? (
          <>
            <HugeiconsIcon className="h-3.5 w-3.5" icon={CheckmarkCircle02Icon} />
            <span className={geistSans.className}>{t("copied")}</span>
          </>
        ) : (
          <>
            <HugeiconsIcon className="h-3.5 w-3.5" icon={Copy01Icon} />
            <span className={geistSans.className}>{t("copy")}</span>
          </>
        )}
      </Button>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default SocialShareButtons;
