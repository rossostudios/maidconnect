"use client";

import { Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { RequiredEventProperties } from "@/lib/integrations/posthog";
import { videoEvents } from "@/lib/integrations/posthog";
import { cn } from "@/lib/utils/core";

interface IntroVideoPlayerProps {
  professionalId: string;
  professionalName: string;
  videoPath: string;
  durationSeconds: number;
  countryCode: "CO" | "PY" | "UY" | "AR";
  className?: string;
}

export function IntroVideoPlayer({
  professionalId,
  professionalName,
  videoPath,
  durationSeconds,
  countryCode,
  className,
}: IntroVideoPlayerProps) {
  const t = useTranslations("pages.professionalProfile.introVideo");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch signed URL on mount
  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        const response = await fetch("/api/professionals/intro-video/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoPath }),
        });

        if (!response.ok) {
          throw new Error("Failed to load video");
        }

        const data = await response.json();
        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error("Error fetching signed URL:", err);
        setError(t("loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchSignedUrl();
  }, [videoPath, t]);

  // Track video view when video starts playing
  const handlePlay = () => {
    if (!hasTrackedView) {
      const eventContext: RequiredEventProperties = {
        country_code: countryCode,
        role: "customer",
      };

      videoEvents.viewed({
        ...eventContext,
        professionalId,
        durationSeconds,
      });

      setHasTrackedView(true);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("rounded-lg border border-neutral-200 bg-white p-8", className)}>
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-neutral-100">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-orange-500" />
            <p className="text-neutral-500 text-sm">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !signedUrl) {
    return null; // Silently fail - don't show error to customers
  }

  return (
    <div className={cn("rounded-lg border border-neutral-200 bg-white p-8", className)}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <HugeiconsIcon className="h-6 w-6 text-orange-500" icon={Video01Icon} />
        <h2 className="font-semibold text-2xl text-neutral-900">{t("title")}</h2>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-900 shadow-[0_10px_40px_rgba(22,22,22,0.08)]">
        <video
          className="h-full w-full"
          controls
          controlsList="nodownload"
          onPlay={handlePlay}
          preload="metadata"
          ref={videoRef}
          src={signedUrl}
        >
          <track kind="captions" />
          {t("browserNotSupported")}
        </video>
      </div>

      {/* Video Info */}
      <div className="mt-4 flex items-center justify-between text-neutral-500 text-sm">
        <span>{t("introductionFrom", { name: professionalName })}</span>
        <span>
          {Math.floor(durationSeconds / 60)}:{String(durationSeconds % 60).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
