import {
  AlertCircleIcon,
  AnalyticsUpIcon,
  Bug01Icon,
  Idea01Icon,
  Sad01Icon,
  ThumbsUpIcon,
  ViewIcon,
} from "hugeicons-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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
  bug: { icon: Bug01Icon, label: "Bug", color: "text-red-600 bg-red-50" },
  feature_request: {
    icon: Idea01Icon,
    label: "Feature Request",
    color: "text-purple-600 bg-purple-50",
  },
  improvement: { icon: AnalyticsUpIcon, label: "Improvement", color: "text-blue-600 bg-blue-50" },
  complaint: { icon: Sad01Icon, label: "Complaint", color: "text-orange-600 bg-orange-50" },
  praise: { icon: ThumbsUpIcon, label: "Praise", color: "text-green-600 bg-green-50" },
  other: { icon: AlertCircleIcon, label: "Other", color: "text-gray-600 bg-gray-50" },
};

const statusBadge = {
  new: "bg-blue-100 text-blue-700",
  in_review: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  spam: "bg-red-100 text-red-700",
};

const priorityBadge = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-600",
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
    <>
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-bold text-3xl text-[var(--foreground)]">Feedback Management</h1>
        <p className="mt-2 text-[var(--muted-foreground)] text-sm">
          Review and manage user feedback submissions
        </p>
      </header>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 border-[#ebe5d8] border-b pb-4">
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status
              ? "border border-[#ebe5d8] text-[var(--muted-foreground)] hover:border-[var(--red)]"
              : "bg-[var(--red)] text-white"
          }`}
          href="/admin/feedback"
        >
          All ({counts.all})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "new"
              ? "bg-[var(--red)] text-white"
              : "border border-[#ebe5d8] text-[var(--muted-foreground)] hover:border-[var(--red)]"
          }`}
          href="/admin/feedback?status=new"
        >
          New ({counts.new})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "in_review"
              ? "bg-[var(--red)] text-white"
              : "border border-[#ebe5d8] text-[var(--muted-foreground)] hover:border-[var(--red)]"
          }`}
          href="/admin/feedback?status=in_review"
        >
          In Review ({counts.in_review})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "resolved"
              ? "bg-[var(--red)] text-white"
              : "border border-[#ebe5d8] text-[var(--muted-foreground)] hover:border-[var(--red)]"
          }`}
          href="/admin/feedback?status=resolved"
        >
          Resolved ({counts.resolved})
        </Link>
      </div>

      {/* Feedback List */}
      {feedbackList.length === 0 ? (
        <div className="rounded-2xl border border-[#ebe5d8] bg-white p-12 text-center">
          <AlertCircleIcon className="mx-auto mb-4 h-12 w-12 text-[#7a6d62]" />
          <h3 className="mb-2 font-bold text-[var(--foreground)] text-xl">No Feedback Yet</h3>
          <p className="text-[var(--muted-foreground)]">Feedback submissions will appear here</p>
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
                className="group rounded-2xl border border-[#ebe5d8] bg-white p-6 shadow-sm transition hover:border-[var(--red)]"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium text-xs ${typeConf.color}`}
                      >
                        <TypeIcon className="h-3 w-3" />
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
                      <span className="text-[#7a6d62] text-xs">
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
                      <h3 className="mb-2 font-bold text-[var(--foreground)] text-lg">
                        {item.subject}
                      </h3>
                    )}

                    <p className="mb-3 line-clamp-2 text-[var(--muted-foreground)] text-sm">
                      {item.message}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <span className="text-[#7a6d62]">
                        <strong>From:</strong> {item.user_email || "Anonymous"}{" "}
                        {item.user_role && `(${item.user_role})`}
                      </span>
                      <span className="text-[#7a6d62]">
                        <strong>Page:</strong> {item.page_path}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link
                    className="flex items-center gap-2 rounded-lg bg-[var(--red)] px-4 py-2 font-medium text-sm text-white transition hover:bg-[var(--red)]"
                    href={`/admin/feedback/${item.id}`}
                  >
                    <ViewIcon className="h-4 w-4" />
                    View
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
