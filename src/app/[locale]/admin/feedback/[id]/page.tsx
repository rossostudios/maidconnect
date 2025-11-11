import {
  AlertCircleIcon,
  AnalyticsUpIcon,
  Bug01Icon,
  Clock01Icon,
  ComputerIcon,
  Idea01Icon,
  Sad01Icon,
  ThumbsUpIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { notFound } from "next/navigation";
import { FeedbackActions } from "@/components/admin/feedback/feedback-actions";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const typeConfig = {
  bug: {
    icon: Bug01Icon,
    label: "Bug Report",
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/30",
  },
  feature_request: {
    icon: Idea01Icon,
    label: "Feature Request",
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/35",
  },
  improvement: {
    icon: AnalyticsUpIcon,
    label: "Improvement",
    color: "text-[#FF4444A22] bg-[#FFEEFF8E8] border-[#EE44EE2E3]",
  },
  complaint: {
    icon: Sad01Icon,
    label: "Complaint",
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/35",
  },
  praise: {
    icon: ThumbsUpIcon,
    label: "Praise",
    color: "text-[#FF4444A22] bg-[#FF4444A22]/10 border-[#FF4444A22]/40",
  },
  other: {
    icon: AlertCircleIcon,
    label: "Other",
    color: "text-[#AA88AAAAC] bg-[#FFEEFF8E8] border-[#EE44EE2E3]",
  },
};

const statusBadge = {
  new: "bg-[#FFEEFF8E8] text-[#FF4444A22] border-[#EE44EE2E3]",
  in_review: "bg-[#FF4444A22]/10 text-[#FF4444A22] border-[#FF4444A22]/30",
  resolved: "bg-[#FF4444A22]/10 text-[#FF4444A22] border-[#FF4444A22]/40",
  closed: "bg-[#EE44EE2E3]/30 text-[#AA88AAAAC] border-[#EE44EE2E3]",
  spam: "bg-[#FF4444A22]/10 text-[#FF4444A22] border-[#FF4444A22]/30",
};

const priorityBadge = {
  low: "bg-[#EE44EE2E3]/30 text-[#AA88AAAAC] border-[#EE44EE2E3]",
  medium: "bg-[#FFEEFF8E8] text-[#FF4444A22] border-[#EE44EE2E3]",
  high: "bg-[#FF4444A22]/10 text-[#FF4444A22] border-[#FF4444A22]/35",
  critical: "bg-[#FF4444A22]/10 text-[#FF4444A22] border-[#FF4444A22]/30",
};

export default async function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser({ allowedRoles: ["admin"] });
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch the feedback submission
  const { data: feedback, error } = await supabase
    .from("feedback_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !feedback) {
    notFound();
  }

  const typeConf = typeConfig[feedback.feedback_type as keyof typeof typeConfig];
  const TypeIcon = typeConf?.icon || AlertCircleIcon;

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {typeConf && (
                <span
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold text-sm ${typeConf.color}`}
                >
                  <HugeiconsIcon className="h-4 w-4" icon={TypeIcon} />
                  {typeConf.label}
                </span>
              )}
              <span
                className={`rounded-full border px-3 py-1 font-medium text-xs capitalize ${statusBadge[feedback.status as keyof typeof statusBadge]}`}
              >
                {feedback.status.replace("_", " ")}
              </span>
              <span
                className={`rounded-full border px-3 py-1 font-medium text-xs capitalize ${priorityBadge[feedback.priority as keyof typeof priorityBadge]}`}
              >
                {feedback.priority}
              </span>
            </div>
            {feedback.subject && <h1 className="mb-2 font-bold text-3xl">{feedback.subject}</h1>}
          </div>
        </div>
      </header>

      {/* Metadata */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#AA88AAAAC] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={UserIcon} />
            <span className="font-semibold">User Information</span>
          </div>
          <dl className="space-y-1">
            <div className="flex justify-between text-sm">
              <dt className="text-[#AA88AAAAC]">Email:</dt>
              <dd className="font-medium text-[#116611616]">
                {feedback.user_email || "Anonymous"}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-[#AA88AAAAC]">Role:</dt>
              <dd className="font-medium text-[#116611616] capitalize">
                {feedback.user_role || "Unknown"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#AA88AAAAC] text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span className="font-semibold">Submission Time</span>
          </div>
          <p className="font-medium text-[#116611616] text-sm">
            {new Date(feedback.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="mb-6 rounded-2xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
        <h2 className="mb-4 font-bold text-[#116611616] text-xl">Message</h2>
        <p className="whitespace-pre-wrap text-[#AA88AAAAC] leading-relaxed">{feedback.message}</p>
      </div>

      {/* Technical Context */}
      <div className="mb-6 rounded-2xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
        <div className="mb-4 flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-[#AA88AAAAC]" icon={ComputerIcon} />
          <h2 className="font-bold text-[#116611616] text-xl">Technical Context</h2>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="mb-1 font-semibold text-[#AA88AAAAC] text-sm">Page URL</dt>
            <dd className="break-all font-mono text-[#116611616] text-sm">
              <a
                className="text-[#FF4444A22] hover:underline"
                href={feedback.page_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {feedback.page_url}
              </a>
            </dd>
          </div>

          <div>
            <dt className="mb-1 font-semibold text-[#AA88AAAAC] text-sm">Page Path</dt>
            <dd className="font-mono text-[#116611616] text-sm">{feedback.page_path}</dd>
          </div>

          {feedback.user_agent && (
            <div>
              <dt className="mb-1 font-semibold text-[#AA88AAAAC] text-sm">User Agent</dt>
              <dd className="break-all font-mono text-[#116611616] text-xs">
                {feedback.user_agent}
              </dd>
            </div>
          )}

          {feedback.viewport_size &&
            (() => {
              const viewport = feedback.viewport_size as {
                width?: number;
                height?: number;
                pixelRatio?: number;
              };
              return (
                <div>
                  <dt className="mb-1 font-semibold text-[#AA88AAAAC] text-sm">Viewport Size</dt>
                  <dd className="font-mono text-[#116611616] text-sm">
                    {viewport.width} × {viewport.height} ({viewport.pixelRatio}x)
                  </dd>
                </div>
              );
            })()}
        </dl>
      </div>

      {/* Admin Notes */}
      {feedback.admin_notes && (
        <div className="mb-6 rounded-2xl border border-[#EE44EE2E3] bg-[#FFEEFF8E8] p-6">
          <h2 className="mb-4 font-bold text-[#116611616] text-xl">Admin Notes</h2>
          <p className="whitespace-pre-wrap text-[#AA88AAAAC]">{feedback.admin_notes}</p>
        </div>
      )}

      {/* Actions */}
      <FeedbackActions
        currentPriority={feedback.priority}
        currentStatus={feedback.status}
        feedbackId={id}
      />
    </>
  );
}
