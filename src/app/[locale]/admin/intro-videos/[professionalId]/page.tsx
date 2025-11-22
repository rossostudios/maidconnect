"use client";

import { ArrowLeft01Icon, Cancel01Icon, Tick02Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils/core";

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
            <Button size="sm" variant="ghost">
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
            <h2 className="font-semibold text-neutral-900 text-xl">Video Preview</h2>
            <p className="mt-2 text-neutral-600 text-sm">
              Review the professional's intro video before approving
            </p>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <HugeiconsIcon className="mx-auto h-16 w-16 text-neutral-400" icon={Video01Icon} />
                <p className="mt-4 text-neutral-400 text-sm">Video player implementation pending</p>
                <p className="mt-1 text-neutral-500 text-xs">
                  Use signed URL from Supabase Storage
                </p>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-neutral-600 text-sm">Professional</p>
              <p className="mt-1 font-medium text-base text-neutral-900">Loading...</p>
            </div>
            <div>
              <p className="text-neutral-600 text-sm">Duration</p>
              <p className="mt-1 font-medium text-base text-neutral-900">-- seconds</p>
            </div>
            <div>
              <p className="text-neutral-600 text-sm">Uploaded</p>
              <p className="mt-1 font-medium text-base text-neutral-900">Loading...</p>
            </div>
            <div>
              <p className="text-neutral-600 text-sm">Market</p>
              <p className="mt-1 font-medium text-base text-neutral-900">--</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quality Guidelines */}
      <Card className="border-neutral-200 bg-neutral-50 p-6">
        <h3 className="font-semibold text-base text-neutral-900">Quality Guidelines</h3>
        <ul className="mt-4 space-y-2 text-neutral-700 text-sm">
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
          className="flex items-center gap-2"
          disabled={isProcessing}
          onClick={handleApprove}
          size="lg"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Tick02Icon} />
          Approve Video
        </Button>

        <Button
          className="flex items-center gap-2"
          disabled={isProcessing}
          onClick={() => setShowRejectionForm(!showRejectionForm)}
          size="lg"
          variant="outline"
        >
          <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
          Reject Video
        </Button>
      </div>

      {/* Rejection Form */}
      {showRejectionForm && (
        <Card className="border-red-200 bg-red-50 p-6">
          <h3 className="font-semibold text-base text-red-900">Rejection Reason</h3>
          <p className="mt-1 text-red-700 text-sm">
            Provide specific feedback so the professional can improve their video
          </p>

          <textarea
            className={cn(
              "mt-4 w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-neutral-900 text-sm",
              "placeholder:text-neutral-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            )}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Example: Background noise is too loud, please re-record in a quiet environment"
            rows={4}
            value={rejectionReason}
          />

          <div className="mt-4 flex items-center gap-3">
            <Button
              disabled={isProcessing || !rejectionReason.trim()}
              onClick={handleReject}
              size="sm"
              variant="destructive"
            >
              Confirm Rejection
            </Button>
            <Button
              disabled={isProcessing}
              onClick={() => {
                setShowRejectionForm(false);
                setRejectionReason("");
              }}
              size="sm"
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
