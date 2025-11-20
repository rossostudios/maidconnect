"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";
import { Tick02Icon, Cancel01Icon, ArrowLeft01Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface IntroVideoReviewPageProps {
  params: Promise<{ professionalId: string; locale: string }>;
}

export default function IntroVideoReviewPage({ params }: IntroVideoReviewPageProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const { professionalId } = await params;
      const response = await fetch("/api/admin/intro-videos/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve video");
      }

      router.push("/admin/intro-videos");
      router.refresh();
    } catch (error) {
      console.error("Error approving video:", error);
      alert("Failed to approve video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      const { professionalId } = await params;
      const response = await fetch("/api/admin/intro-videos/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, rejectionReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject video");
      }

      router.push("/admin/intro-videos");
      router.refresh();
    } catch (error) {
      console.error("Error rejecting video:", error);
      alert("Failed to reject video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/intro-videos">
            <Button variant="ghost" size="sm">
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={ArrowLeft01Icon} />
              Back to Reviews
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-3xl text-neutral-900">Review Intro Video</h1>
            <p className="mt-2 text-base text-neutral-700">
              Watch the video and approve or reject based on quality guidelines
            </p>
          </div>
        </div>
        <Badge variant="warning">Pending Review</Badge>
      </div>

      {/* Video Player Placeholder */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-xl text-neutral-900">Video Preview</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Review the professional's intro video before approving
            </p>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <HugeiconsIcon className="mx-auto h-16 w-16 text-neutral-400" icon={Video01Icon} />
                <p className="mt-4 text-sm text-neutral-400">
                  Video player implementation pending
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Use signed URL from Supabase Storage
                </p>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600">Professional</p>
              <p className="mt-1 font-medium text-base text-neutral-900">Loading...</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Duration</p>
              <p className="mt-1 font-medium text-base text-neutral-900">-- seconds</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Uploaded</p>
              <p className="mt-1 font-medium text-base text-neutral-900">Loading...</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Market</p>
              <p className="mt-1 font-medium text-base text-neutral-900">--</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quality Guidelines */}
      <Card className="p-6 border-neutral-200 bg-neutral-50">
        <h3 className="font-semibold text-base text-neutral-900">Quality Guidelines</h3>
        <ul className="mt-4 space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>Clear audio and lighting (professional quality)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>Professional introduces themselves and services clearly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>No inappropriate content or background noise</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>Duration under 60 seconds</span>
          </li>
        </ul>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleApprove}
          disabled={isProcessing}
          className="flex items-center gap-2"
          size="lg"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Tick02Icon} />
          Approve Video
        </Button>

        <Button
          onClick={() => setShowRejectionForm(!showRejectionForm)}
          variant="outline"
          disabled={isProcessing}
          className="flex items-center gap-2"
          size="lg"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          Reject Video
        </Button>
      </div>

      {/* Rejection Form */}
      {showRejectionForm && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="font-semibold text-base text-red-900">Rejection Reason</h3>
          <p className="mt-1 text-sm text-red-700">
            Provide specific feedback so the professional can improve their video
          </p>

          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Example: Background noise is too loud, please re-record in a quiet environment"
            className={cn(
              "mt-4 w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-neutral-900",
              "placeholder:text-neutral-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            )}
            rows={4}
          />

          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              variant="destructive"
              size="sm"
            >
              Confirm Rejection
            </Button>
            <Button
              onClick={() => {
                setShowRejectionForm(false);
                setRejectionReason("");
              }}
              variant="ghost"
              size="sm"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
