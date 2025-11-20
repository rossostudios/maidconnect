"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/core";
import { videoEvents } from "@/lib/integrations/posthog";
import type { RequiredEventProperties } from "@/lib/integrations/posthog";
import { Upload01Icon, Tick02Icon, Clock01Icon, Cancel01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type VideoStatus = "none" | "pending_review" | "approved" | "rejected";

interface IntroVideoUploadProps {
  userId: string;
  countryCode: "CO" | "PY" | "UY" | "AR";
  currentVideoPath?: string | null;
  currentVideoStatus?: VideoStatus;
  currentVideoThumbnailPath?: string | null;
  rejectionReason?: string | null;
  className?: string;
}

const MAX_FILE_SIZE_MB = 100;
const MAX_DURATION_SECONDS = 60;
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

export function IntroVideoUpload({
  userId,
  countryCode,
  currentVideoPath,
  currentVideoStatus = "none",
  currentVideoThumbnailPath,
  rejectionReason,
  className,
}: IntroVideoUploadProps) {
  const t = useTranslations("dashboard.pro.profile.introVideo");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoStatus, setVideoStatus] = useState<VideoStatus>(currentVideoStatus);
  const [videoPath, setVideoPath] = useState<string | null>(currentVideoPath || null);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(currentVideoThumbnailPath || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError(t("errors.invalidType"));
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setError(t("errors.fileTooLarge", { maxSize: MAX_FILE_SIZE_MB }));
      return;
    }

    // Validate duration
    try {
      const duration = await getVideoDuration(file);
      if (duration > MAX_DURATION_SECONDS) {
        setError(t("errors.durationTooLong", { maxDuration: MAX_DURATION_SECONDS }));
        return;
      }

      // Upload video
      await uploadVideo(file, duration, fileSizeMB);
    } catch (err) {
      console.error("Error processing video:", err);
      setError(t("errors.uploadFailed"));
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => {
        reject(new Error("Failed to load video metadata"));
      };

      video.src = window.URL.createObjectURL(file);
    });
  };

  const uploadVideo = async (file: File, duration: number, fileSizeMB: number) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("video", file);
      formData.append("duration", duration.toString());

      // Upload to API route
      const response = await fetch("/api/professionals/intro-video/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Update local state
      setVideoPath(data.videoPath);
      setThumbnailPath(data.thumbnailPath);
      setVideoStatus("pending_review");

      // Track upload event
      const eventContext: RequiredEventProperties = {
        country_code: countryCode,
        role: "professional",
      };

      videoEvents.uploaded({
        ...eventContext,
        professionalId: userId,
        durationSeconds: Math.round(duration),
        fileSizeMb: Math.round(fileSizeMB * 10) / 10, // Round to 1 decimal
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : t("errors.uploadFailed"));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusBadge = () => {
    switch (videoStatus) {
      case "pending_review":
        return (
          <Badge variant="warning" className="flex items-center gap-2">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            {t("status.pendingReview")}
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="success" className="flex items-center gap-2">
            <HugeiconsIcon className="h-4 w-4" icon={Tick02Icon} />
            {t("status.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-2">
            <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
            {t("status.rejected")}
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="flex items-center gap-2">
            <HugeiconsIcon className="h-4 w-4" icon={Video01Icon} />
            {t("status.noVideo")}
          </Badge>
        );
    }
  };

  return (
    <Card className={cn("p-8 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="font-semibold text-xl text-neutral-900">{t("title")}</h2>
          <p className="text-base text-neutral-700 leading-relaxed">{t("description")}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Video Preview (if exists) */}
      {videoPath && thumbnailPath && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
          <img
            src={thumbnailPath}
            alt={t("thumbnailAlt")}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
              <HugeiconsIcon className="h-8 w-8 text-neutral-900" icon={Video01Icon} />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {videoStatus === "rejected" && rejectionReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="font-semibold text-sm text-red-900">{t("rejectionReasonTitle")}</h3>
          <p className="mt-1 text-sm text-red-700">{rejectionReason}</p>
        </div>
      )}

      {/* Guidelines */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 space-y-4">
        <h3 className="font-semibold text-base text-neutral-900">{t("guidelines.title")}</h3>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>{t("guidelines.duration", { maxDuration: MAX_DURATION_SECONDS })}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>{t("guidelines.fileSize", { maxSize: MAX_FILE_SIZE_MB })}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>{t("guidelines.content")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>{t("guidelines.quality")}</span>
          </li>
        </ul>
      </div>

      {/* Upload Button */}
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_VIDEO_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("uploading", { progress: uploadProgress })}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <HugeiconsIcon className="h-5 w-5" icon={Upload01Icon} />
              {videoStatus === "none" ? t("uploadButton") : t("replaceButton")}
            </span>
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
