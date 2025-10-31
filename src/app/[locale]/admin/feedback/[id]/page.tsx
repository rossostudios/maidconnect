import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { FeedbackActions } from "@/components/admin/feedback/feedback-actions";
import { Bug, Lightbulb, TrendingUp, Frown, ThumbsUp, AlertCircle, Monitor, Clock, User } from "lucide-react";
import Link from "next/link";

const typeConfig = {
  bug: { icon: Bug, label: "Bug Report", color: "text-red-600 bg-red-50 border-red-200" },
  feature_request: { icon: Lightbulb, label: "Feature Request", color: "text-purple-600 bg-purple-50 border-purple-200" },
  improvement: { icon: TrendingUp, label: "Improvement", color: "text-blue-600 bg-blue-50 border-blue-200" },
  complaint: { icon: Frown, label: "Complaint", color: "text-orange-600 bg-orange-50 border-orange-200" },
  praise: { icon: ThumbsUp, label: "Praise", color: "text-green-600 bg-green-50 border-green-200" },
  other: { icon: AlertCircle, label: "Other", color: "text-gray-600 bg-gray-50 border-gray-200" },
};

const statusBadge = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_review: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
  spam: "bg-red-100 text-red-700 border-red-200",
};

const priorityBadge = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-blue-100 text-blue-600 border-blue-200",
  high: "bg-orange-100 text-orange-600 border-orange-200",
  critical: "bg-red-100 text-red-600 border-red-200",
};

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const TypeIcon = typeConf?.icon || AlertCircle;

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 text-[#211f1a]">
      {/* Header */}
      <header className="mb-8">
        <Link
          href="/admin/feedback"
          className="mb-4 inline-block font-medium text-[#5d574b] text-sm transition hover:text-[#ff5d46]"
        >
          ← Back to Feedback
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {typeConf && (
                <span className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-semibold text-sm ${typeConf.color}`}>
                  <TypeIcon className="h-4 w-4" />
                  {typeConf.label}
                </span>
              )}
              <span className={`rounded-full border px-3 py-1 font-medium text-xs capitalize ${statusBadge[feedback.status as keyof typeof statusBadge]}`}>
                {feedback.status.replace("_", " ")}
              </span>
              <span className={`rounded-full border px-3 py-1 font-medium text-xs capitalize ${priorityBadge[feedback.priority as keyof typeof priorityBadge]}`}>
                {feedback.priority}
              </span>
            </div>
            {feedback.subject && (
              <h1 className="mb-2 font-bold text-3xl">{feedback.subject}</h1>
            )}
          </div>
        </div>
      </header>

      {/* Metadata */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-[#7a6d62] text-sm">
            <User className="h-4 w-4" />
            <span className="font-semibold">User Information</span>
          </div>
          <dl className="space-y-1">
            <div className="flex justify-between text-sm">
              <dt className="text-[#7a6d62]">Email:</dt>
              <dd className="font-medium text-[#211f1a]">{feedback.user_email || "Anonymous"}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-[#7a6d62]">Role:</dt>
              <dd className="font-medium text-[#211f1a] capitalize">{feedback.user_role || "Unknown"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-[#7a6d62] text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-semibold">Submission Time</span>
          </div>
          <p className="font-medium text-[#211f1a] text-sm">
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
      <div className="mb-6 rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <h2 className="mb-4 font-bold text-[#211f1a] text-xl">Message</h2>
        <p className="whitespace-pre-wrap text-[#5d574b] leading-relaxed">{feedback.message}</p>
      </div>

      {/* Technical Context */}
      <div className="mb-6 rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5 text-[#7a6d62]" />
          <h2 className="font-bold text-[#211f1a] text-xl">Technical Context</h2>
        </div>

        <dl className="space-y-3">
          <div>
            <dt className="mb-1 font-semibold text-[#7a6d62] text-sm">Page URL</dt>
            <dd className="break-all font-mono text-[#211f1a] text-sm">
              <a
                href={feedback.page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff5d46] hover:underline"
              >
                {feedback.page_url}
              </a>
            </dd>
          </div>

          <div>
            <dt className="mb-1 font-semibold text-[#7a6d62] text-sm">Page Path</dt>
            <dd className="font-mono text-[#211f1a] text-sm">{feedback.page_path}</dd>
          </div>

          {feedback.user_agent && (
            <div>
              <dt className="mb-1 font-semibold text-[#7a6d62] text-sm">User Agent</dt>
              <dd className="break-all font-mono text-[#211f1a] text-xs">{feedback.user_agent}</dd>
            </div>
          )}

          {feedback.viewport_size && (
            <div>
              <dt className="mb-1 font-semibold text-[#7a6d62] text-sm">Viewport Size</dt>
              <dd className="font-mono text-[#211f1a] text-sm">
                {(feedback.viewport_size as any).width} × {(feedback.viewport_size as any).height} (
                {(feedback.viewport_size as any).pixelRatio}x)
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Admin Notes */}
      {feedback.admin_notes && (
        <div className="mb-6 rounded-2xl border border-[#ebe5d8] bg-[#fbfaf9] p-6">
          <h2 className="mb-4 font-bold text-[#211f1a] text-xl">Admin Notes</h2>
          <p className="whitespace-pre-wrap text-[#5d574b]">{feedback.admin_notes}</p>
        </div>
      )}

      {/* Actions */}
      <FeedbackActions feedbackId={id} currentStatus={feedback.status} currentPriority={feedback.priority} />
    </section>
  );
}
