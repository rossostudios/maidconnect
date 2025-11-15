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
    color: "text-red-700 bg-red-100 border-red-200",
  },
  feature_request: {
    icon: Idea01Icon,
    label: "Feature Request",
    color: "text-purple-700 bg-purple-100 border-purple-200",
  },
  improvement: {
    icon: AnalyticsUpIcon,
    label: "Improvement",
    color: "text-blue-700 bg-blue-100 border-blue-200",
  },
  complaint: {
    icon: Sad01Icon,
    label: "Complaint",
    color: "text-orange-700 bg-orange-100 border-orange-200",
  },
  praise: {
    icon: ThumbsUpIcon,
    label: "Praise",
    color: "text-green-700 bg-green-100 border-green-200",
  },
  other: {
    icon: AlertCircleIcon,
    label: "Other",
    color: "text-neutral-600 bg-white border-neutral-200",
  },
};

const statusBadge = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_review: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-neutral-100 text-neutral-700 border-neutral-200",
  spam: "bg-red-100 text-red-700 border-red-200",
};

const priorityBadge = {
  low: "bg-neutral-100 text-neutral-700 border-neutral-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
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
                  className={`-full flex items-center gap-2 border px-4 py-1.5 font-semibold text-sm ${typeConf.color}`}
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
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-neutral-600 text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={UserIcon} />
            <span className="font-semibold">User Information</span>
          </div>
          <dl className="space-y-1">
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-600">Email:</dt>
              <dd className="font-medium text-neutral-900">{feedback.user_email || "Anonymous"}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-neutral-600">Role:</dt>
              <dd className="font-medium text-neutral-900 capitalize">
                {feedback.user_role || "Unknown"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-neutral-600 text-sm">
            <HugeiconsIcon className="h-4 w-4" icon={Clock01Icon} />
            <span className="font-semibold">Submission Time</span>
          </div>
          <p className="font-medium text-neutral-900 text-sm">
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
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-bold text-neutral-900 text-xl">Message</h2>
        <p className="whitespace-pre-wrap text-neutral-600 leading-relaxed">{feedback.message}</p>
      </div>

      {/* Technical Context */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <HugeiconsIcon className="h-5 w-5 text-neutral-600" icon={ComputerIcon} />
          <h2 className="font-bold text-neutral-900 text-xl">Technical Context</h2>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="mb-1 font-semibold text-neutral-600 text-sm">Page URL</dt>
            <dd className="break-all font-mono text-neutral-900 text-sm">
              <a
                className="text-orange-600"
                href={feedback.page_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {feedback.page_url}
              </a>
            </dd>
          </div>

          <div>
            <dt className="mb-1 font-semibold text-neutral-600 text-sm">Page Path</dt>
            <dd className="font-mono text-neutral-900 text-sm">{feedback.page_path}</dd>
          </div>

          {feedback.user_agent && (
            <div>
              <dt className="mb-1 font-semibold text-neutral-600 text-sm">User Agent</dt>
              <dd className="break-all font-mono text-neutral-900 text-xs">
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
                  <dt className="mb-1 font-semibold text-neutral-600 text-sm">Viewport Size</dt>
                  <dd className="font-mono text-neutral-900 text-sm">
                    {viewport.width} × {viewport.height} ({viewport.pixelRatio}x)
                  </dd>
                </div>
              );
            })()}
        </dl>
      </div>

      {/* Admin Notes */}
      {feedback.admin_notes && (
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-bold text-neutral-900 text-xl">Admin Notes</h2>
          <p className="whitespace-pre-wrap text-neutral-600">{feedback.admin_notes}</p>
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
