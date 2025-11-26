"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

export default function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [dispute, setDispute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionAction, setResolutionAction] = useState("");
  const router = useRouter();

  const loadDispute = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/disputes/${id}`);
      const data = await response.json();
      setDispute(data.dispute);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDispute();
  }, [loadDispute]);

  const handleResolve = async () => {
    try {
      await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution_notes: resolutionNotes,
          resolution_action: resolutionAction,
        }),
      });
      router.push("/admin/disputes");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  if (!dispute) {
    return <div className="container mx-auto px-4 py-8">Dispute not found</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <button
        className="type-ui-sm mb-4 text-rausch-500"
        onClick={() => router.back()}
        type="button"
      >
        ← Back
      </button>

      <h1 className="type-ui-lg mb-6 font-semibold">Dispute Details</h1>

      <div className="space-y-6">
        <div className="border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="type-ui-md mb-4 font-semibold">Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="type-ui-sm font-medium text-neutral-900">Type</p>
              <p className="type-body-sm text-neutral-500 capitalize">
                {dispute.dispute_type?.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="type-ui-sm font-medium text-neutral-900">Status</p>
              <p className="type-body-sm text-neutral-500 capitalize">{dispute.status}</p>
            </div>
            <div>
              <p className="type-ui-sm font-medium text-neutral-900">Priority</p>
              <p className="type-body-sm text-neutral-500 capitalize">{dispute.priority}</p>
            </div>
            <div>
              <p className="type-ui-sm font-medium text-neutral-900">Opened By</p>
              <p className="type-body-sm text-neutral-700">
                {dispute.opener?.full_name || dispute.opener?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="type-ui-md mb-4 font-semibold">Description</h2>
          <p className="type-body-sm text-neutral-900">{dispute.description}</p>
        </div>

        {dispute.customer_statement && (
          <div className="border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="type-ui-md mb-4 font-semibold">Customer Statement</h2>
            <p className="type-body-sm text-neutral-900">{dispute.customer_statement}</p>
          </div>
        )}

        {dispute.professional_statement && (
          <div className="border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="type-ui-md mb-4 font-semibold">Professional Statement</h2>
            <p className="type-body-sm text-neutral-900">{dispute.professional_statement}</p>
          </div>
        )}

        {dispute.status !== "resolved" && (
          <div className="border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="type-ui-md mb-4 font-semibold">Resolve Dispute</h2>
            <div className="space-y-4">
              <div>
                <label className="type-ui-sm mb-2 block font-medium" htmlFor="resolution-action">
                  Resolution Action
                </label>
                <select
                  className="w-full border border-neutral-200 px-4 py-2"
                  id="resolution-action"
                  onChange={(e) => setResolutionAction(e.target.value)}
                  value={resolutionAction}
                >
                  <option value="">Select action...</option>
                  <option value="refund">Full Refund</option>
                  <option value="partial_refund">Partial Refund</option>
                  <option value="dismiss">Dismiss</option>
                  <option value="warning">Issue Warning</option>
                </select>
              </div>
              <div>
                <label className="type-ui-sm mb-2 block font-medium" htmlFor="resolution-notes">
                  Resolution Notes
                </label>
                <textarea
                  className="w-full border border-neutral-200 px-4 py-3"
                  id="resolution-notes"
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain the resolution decision..."
                  rows={4}
                  value={resolutionNotes}
                />
              </div>
              <button
                className="type-ui-sm bg-rausch-500 px-6 py-3 font-medium text-white hover:bg-rausch-500 disabled:opacity-50"
                disabled={!(resolutionAction && resolutionNotes)}
                onClick={handleResolve}
                type="button"
              >
                Resolve Dispute
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
