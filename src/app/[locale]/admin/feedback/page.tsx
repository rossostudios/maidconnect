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
  bug: { icon: Bug01Icon, label: "Bug", color: "text-[#E85D48] bg-[#E85D48]/10" },
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
  critical: "bg-red-100 text-[#E85D48]",
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
        <h1 className="font-bold text-3xl text-[#171717]">Feedback Management</h1>
        <p className="mt-2 text-[#737373] text-sm">Review and manage user feedback submissions</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-[#E5E5E5] border-b pb-4">
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status
              ? "border border-[#E5E5E5] text-[#737373] hover:border-[#E85D48]"
              : "bg-[#E85D48] text-white"
          }`}
          href="/admin/feedback"
        >
          All ({counts.all})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "new"
              ? "bg-[#E85D48] text-white"
              : "border border-[#E5E5E5] text-[#737373] hover:border-[#E85D48]"
          }`}
          href="/admin/feedback?status=new"
        >
          New ({counts.new})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "in_review"
              ? "bg-[#E85D48] text-white"
              : "border border-[#E5E5E5] text-[#737373] hover:border-[#E85D48]"
          }`}
          href="/admin/feedback?status=in_review"
        >
          In Review ({counts.in_review})
        </Link>
        <Link
          className={`rounded-lg px-4 py-2 font-medium text-sm transition ${
            status === "resolved"
              ? "bg-[#E85D48] text-white"
              : "border border-[#E5E5E5] text-[#737373] hover:border-[#E85D48]"
          }`}
          href="/admin/feedback?status=resolved"
        >
          Resolved ({counts.resolved})
        </Link>
      </div>

      {/* Feedback List */}
      {feedbackList.length === 0 ? (
        <div className="rounded-lg border border-[#E5E5E5] bg-white p-12 text-center">
          <HugeiconsIcon className="mx-auto mb-4 h-12 w-12 text-[#A3A3A3]" icon={AlertCircleIcon} />
          <h3 className="mb-2 font-bold text-[#171717] text-xl">No Feedback Yet</h3>
          <p className="text-[#737373]">Feedback submissions will appear here</p>
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
                className="group rounded-lg border border-[#E5E5E5] bg-white p-6 shadow-sm transition hover:border-[#E85D48]"
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
                      <span className="text-[#737373] text-xs">
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
                      <h3 className="mb-2 font-bold text-[#171717] text-lg">{item.subject}</h3>
                    )}

                    <p className="mb-3 line-clamp-2 text-[#737373] text-sm">{item.message}</p>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <span className="text-[#737373]">
                        <strong>From:</strong> {item.user_email || "Anonymous"}{" "}
                        {item.user_role && `(${item.user_role})`}
                      </span>
                      <span className="text-[#737373]">
                        <strong>Page:</strong> {item.page_path}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link
                    className="flex items-center gap-2 rounded-lg bg-[#E85D48] px-4 py-2 font-medium text-sm text-white transition hover:bg-[#D32F40]"
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
