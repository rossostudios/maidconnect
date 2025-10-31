"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";

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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Status & Priority */}
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <h3 className="mb-4 font-bold text-[#211f1a] text-lg">Update Status & Priority</h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Status */}
          <div>
            <label htmlFor="status" className="mb-2 block font-medium text-[#211f1a] text-sm">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
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
            <label htmlFor="priority" className="mb-2 block font-medium text-[#211f1a] text-sm">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
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
      <div className="rounded-2xl border border-[#ebe5d8] bg-white p-6">
        <h3 className="mb-4 font-bold text-[#211f1a] text-lg">Add Admin Notes</h3>

        <textarea
          id="admin_notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={4}
          placeholder="Add internal notes about this feedback (optional)..."
          className="w-full rounded-xl border border-[#ebe5d8] px-4 py-3 text-[#211f1a] focus:border-[#ff5d46] focus:outline-none focus:ring-2 focus:ring-[#ff5d4620]"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-[#ff5d46] px-6 py-3 font-semibold text-white transition hover:bg-[#e54d36] disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
