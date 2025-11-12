import {
  AlertCircleIcon,
  AnalyticsUpIcon,
  Bug01Icon,
  Idea01Icon,
  Sad01Icon,
  ThumbsUpIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const metadata = {
  title: "Feedback Management | Admin",
  description: "Review and manage user feedback submissions",
};

type FeedbackSubmission = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  feedback_type: string;
  subject: string | null;
  message: string;
  page_url: string;
  page_path: string;
  status: "new" | "in_review" | "resolved" | "closed" | "spam";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
};

const typeConfig = {
  bug: { icon: Bug01Icon, label: "Bug", color: "text-red-700 bg-red-100" },
  feature_request: {
    icon: Idea01Icon,
    label: "Feature Request",
    color: "text-purple-700 bg-purple-100",
  },
  improvement: { icon: AnalyticsUpIcon, label: "Improvement", color: "text-blue-700 bg-blue-100" },
  complaint: { icon: Sad01Icon, label: "Complaint", color: "text-orange-700 bg-orange-100" },
  praise: { icon: ThumbsUpIcon, label: "Praise", color: "text-green-700 bg-green-100" },
  other: { icon: AlertCircleIcon, label: "Other", color: "text-neutral-700 bg-neutral-100" },
};

const statusBadge = {
  new: "bg-blue-100 text-blue-700",
  in_review: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-neutral-100 text-neutral-700",
  spam: "bg-red-100 text-red-700",
};

const priorityBadge = {
  low: "bg-neutral-100 text-neutral-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; priority?: string }>;
}) {
  await requireUser({ allowedRoles: ["admin"] });
  const supabase = await createSupabaseServerClient();
  const { status, type, priority } = await searchParams;

  // Build query based on filters
  let query = supabase
    .from("feedback_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (type) {
    query = query.eq("feedback_type", type);
  }

  if (priority) {
    query = query.eq("priority", priority);
  }

  const { data: feedback, error } = await query;

  if (error) {
    console.error("Error fetching feedback:", error);
  }

  const feedbackList = feedback || [];

  // Count by status
  const counts = {
    all: feedbackList.length,
    new: feedbackList.filter((f) => f.status === "new").length,
    in_review: feedbackList.filter((f) => f.status === "in_review").length,
    resolved: feedbackList.filter((f) => f.status === "resolved").length,
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl text-neutral-900">Feedback Management</h1>
        <p className="mt-2 text-neutral-600 text-sm">Review and manage user feedback submissions</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-neutral-200 border-b pb-4">
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status
              ? "border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              : "bg-neutral-900 text-white"
          }`}
          href="/admin/feedback"
        >
          All ({counts.all})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "new"
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
          }`}
          href="/admin/feedback?status=new"
        >
          New ({counts.new})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "in_review"
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
          }`}
          href="/admin/feedback?status=in_review"
        >
          In Review ({counts.in_review})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "resolved"
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
          }`}
          href="/admin/feedback?status=resolved"
        >
          Resolved ({counts.resolved})
        </Link>
      </div>

      {/* Feedback List */}
      {feedbackList.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
          <HugeiconsIcon
            className="mx-auto mb-4 h-12 w-12 text-neutral-400"
            icon={AlertCircleIcon}
          />
          <h3 className="mb-2 font-bold text-neutral-900 text-xl">No Feedback Yet</h3>
          <p className="text-neutral-600">Feedback submissions will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((item: FeedbackSubmission) => {
            const typeConf = typeConfig[item.feedback_type as keyof typeof typeConfig];
            if (!typeConf) {
              return null;
            }

            const TypeIcon = typeConf.icon;

            return (
              <article
                className="group rounded-lg border border-neutral-200 bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:border-neutral-300 hover:shadow-md"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium text-xs ${typeConf.color}`}
                      >
                        <HugeiconsIcon className="h-3 w-3" icon={TypeIcon} />
                        {typeConf.label}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-medium text-xs capitalize ${statusBadge[item.status]}`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-medium text-xs capitalize ${priorityBadge[item.priority]}`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-neutral-600 text-xs">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {item.subject && (
                      <h3 className="mb-2 font-bold text-lg text-neutral-900">{item.subject}</h3>
                    )}

                    <p className="mb-3 line-clamp-2 text-neutral-600 text-sm">{item.message}</p>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <span className="text-neutral-600">
                        <strong>From:</strong> {item.user_email || "Anonymous"}{" "}
                        {item.user_role && `(${item.user_role})`}
                      </span>
                      <span className="text-neutral-600">
                        <strong>Page:</strong> {item.page_path}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link
                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 font-medium text-sm text-white transition hover:bg-neutral-800"
                    href={`/admin/feedback/${item.id}`}
                  >
                    <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
                    View
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
