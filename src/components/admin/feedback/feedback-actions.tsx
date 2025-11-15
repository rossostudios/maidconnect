"use client";

import { FloppyDiskIcon, Loading01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FeedbackActionsProps = {
  feedbackId: string;
  currentStatus: string;
  currentPriority: string;
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export function FeedbackActions({
  feedbackId,
  currentStatus,
  currentPriority,
}: FeedbackActionsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [adminNotes, setAdminNotes] = useState("");

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          priority,
          admin_notes: adminNotes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update feedback");
      }

      router.refresh();
      setAdminNotes(""); // Clear notes after saving
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Status & Priority */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="mb-4 font-bold text-lg text-neutral-900 dark:text-neutral-100">
          Update Status & Priority
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Status */}
          <div>
            <label
              className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
              htmlFor="status"
            >
              Status
            </label>
            <select
              className="w-full border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-400/20"
              id="status"
              onChange={(e) => setStatus(e.target.value)}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label
              className="mb-2 block font-medium text-red-700 text-sm dark:text-red-200"
              htmlFor="priority"
            >
              Priority
            </label>
            <select
              className="w-full border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-400/20"
              id="priority"
              onChange={(e) => setPriority(e.target.value)}
              value={priority}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
        <h3 className="mb-4 font-bold text-lg text-neutral-900 dark:text-neutral-100">
          Add Admin Notes
        </h3>

        <textarea
          className="w-full border border-neutral-200 px-4 py-3 text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:focus:ring-neutral-400/20"
          id="admin_notes"
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add internal notes about this feedback (optional)..."
          rows={4}
          value={adminNotes}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="-full flex items-center gap-2 bg-neutral-900 px-6 py-3 font-semibold text-white transition hover:bg-neutral-900 disabled:opacity-50 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
          disabled={saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? (
            <>
              <HugeiconsIcon className="h-5 w-5 animate-spin" icon={Loading01Icon} />
              Saving...
            </>
          ) : (
            <>
              <HugeiconsIcon className="h-5 w-5" icon={FloppyDiskIcon} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
