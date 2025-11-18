"use client";

import { useState } from "react";
import { BaseModal } from "@/components/shared/base-modal";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useModalForm } from "@/hooks/use-modal-form";
import { sanitizeHTML } from "@/lib/utils/sanitize";

type Props = {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  onClose: () => void;
  onComplete: () => void;
};

type MessageFormData = {
  subject: string;
  message: string;
  priority: "normal" | "urgent";
  template: string;
  scheduledAt: string;
  sendImmediately: boolean;
};

const MESSAGE_TEMPLATES = {
  none: {
    subject: "",
    message: "",
  },
  account_warning: {
    subject: "Important Notice Regarding Your Account",
    message: `Hello {name},\n\nWe're reaching out regarding your Casaora account. [Explain the issue here]\n\nPlease review this matter at your earliest convenience.\n\nBest regards,\nThe Casaora Team`,
  },
  verification_pending: {
    subject: "Action Required: Complete Your Professional Verification",
    message:
      "Hello {name},\n\nWe noticed your professional verification is pending. To complete your verification, please:\n\n1. Upload your professional certifications\n2. Complete identity verification\n3. Submit required documents\n\nComplete these steps to start receiving booking requests.\n\nBest regards,\nThe Casaora Team",
  },
  payment_issue: {
    subject: "Payment Information Update Required",
    message: `Hello {name},\n\nThere's an issue with your payment information on file. Please update your payment method to avoid service interruption.\n\nBest regards,\nThe Casaora Team`,
  },
  policy_update: {
    subject: "Important Policy Update",
    message: `Hello {name},\n\nWe've updated our policies. Please review the changes at your convenience.\n\nBest regards,\nThe Casaora Team`,
  },
  custom: {
    subject: "",
    message: "",
  },
};

export function DirectMessageModal({ userId, userName, userEmail, onClose, onComplete }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  const form = useModalForm<MessageFormData>({
    initialData: {
      subject: "",
      message: "",
      priority: "normal",
      template: "none",
      scheduledAt: "",
      sendImmediately: true,
    },
    resetOnClose: true,
  });

  const messageMutation = useApiMutation({
    url: `/api/admin/users/${userId}/message`,
    method: "POST",
    onSuccess: () => {
      onComplete();
    },
  });

  const handleTemplateChange = (templateKey: string) => {
    form.updateField("template", templateKey);
    const template = MESSAGE_TEMPLATES[templateKey as keyof typeof MESSAGE_TEMPLATES];
    if (template) {
      const personalizedMessage = template.message.replace(
        "{name}",
        userName || userEmail || "User"
      );
      form.updateField("subject", template.subject);
      form.updateField("message", personalizedMessage);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.formData.subject.trim()) {
      form.setError("Subject is required");
      return;
    }

    if (!form.formData.message.trim()) {
      form.setError("Message is required");
      return;
    }

    // Validate scheduled date if not sending immediately
    if (!(form.formData.sendImmediately || form.formData.scheduledAt)) {
      form.setError("Scheduled date is required when not sending immediately");
      return;
    }

    try {
      // Sanitize message content before sending
      const sanitizedMessage = sanitizeHTML(form.formData.message);

      await messageMutation.mutate({
        subject: form.formData.subject,
        message: sanitizedMessage,
        priority: form.formData.priority,
        scheduled_at: form.formData.sendImmediately ? null : form.formData.scheduledAt,
      });
    } catch (error) {
      form.setError(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const previewContent = () => {
    const sanitized = sanitizeHTML(form.formData.message);
    return { __html: sanitized };
  };

  return (
    <BaseModal
      description={`Send a direct message to ${userName || userEmail || "User"}`}
      isOpen={true}
      onClose={onClose}
      size="xl"
      title="Send Direct Message"
    >
      <div className="space-y-6">
        {/* Recipient Info */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="type-ui-sm mb-1 font-medium text-neutral-900">Sending to:</p>
          <p className="type-body-sm text-neutral-700">{userName || "Unnamed User"}</p>
          <p className="type-body-sm text-neutral-600">{userEmail}</p>
        </div>

        {/* Template Selector */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Message Template (optional)
          </label>
          <select
            className="w-full rounded-lg border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => handleTemplateChange(e.target.value)}
            value={form.formData.template}
          >
            <option value="none">No template (blank message)</option>
            <option value="account_warning">Account Warning</option>
            <option value="verification_pending">Verification Pending</option>
            <option value="payment_issue">Payment Issue</option>
            <option value="policy_update">Policy Update</option>
            <option value="custom">Custom Message</option>
          </select>
        </div>

        {/* Priority Level */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Priority Level
          </label>
          <div className="flex gap-3">
            <button
              className={
                "type-ui-sm flex-1 rounded-lg border-2 px-4 py-2 font-medium transition" +
                (form.formData.priority === "normal"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900")
              }
              onClick={() => form.updateField("priority", "normal")}
              type="button"
            >
              Normal
            </button>
            <button
              className={
                "type-ui-sm flex-1 rounded-lg border-2 px-4 py-2 font-medium transition" +
                (form.formData.priority === "urgent"
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-neutral-200 bg-white text-neutral-900 hover:border-orange-500")
              }
              onClick={() => form.updateField("priority", "urgent")}
              type="button"
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Subject <span className="text-red-600">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => form.updateField("subject", e.target.value)}
            placeholder="Enter message subject..."
            type="text"
            value={form.formData.subject}
          />
        </div>

        {/* Message Content */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="type-ui-sm font-medium text-neutral-900">
              Message <span className="text-red-600">*</span>
            </label>
            <button
              className="type-ui-sm text-orange-600 transition hover:text-orange-700"
              onClick={() => setShowPreview(!showPreview)}
              type="button"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>

          {showPreview ? (
            <div
              className="min-h-[240px] rounded-lg border border-neutral-200 bg-neutral-50 p-4"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Message is sanitized before display
              dangerouslySetInnerHTML={previewContent()}
            />
          ) : (
            <textarea
              className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => form.updateField("message", e.target.value)}
              placeholder="Enter your message here... You can use basic HTML formatting."
              rows={10}
              value={form.formData.message}
            />
          )}
          <p className="type-body-sm mt-2 text-neutral-600">
            HTML formatting is supported and will be automatically sanitized for security.
          </p>
        </div>

        {/* Scheduling */}
        <div>
          <label className="type-ui-sm mb-2 block font-medium text-neutral-900">
            Delivery Timing
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                checked={form.formData.sendImmediately}
                className="h-5 w-5 border-neutral-200 focus:ring-2 focus:ring-orange-500"
                onChange={(e) => form.updateField("sendImmediately", e.target.checked)}
                type="checkbox"
              />
              <span className="type-ui-sm text-neutral-900">Send immediately</span>
            </label>

            {!form.formData.sendImmediately && (
              <div>
                <label className="type-body-sm mb-1 block text-neutral-700">
                  Schedule for later:
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => form.updateField("scheduledAt", e.target.value)}
                  type="datetime-local"
                  value={form.formData.scheduledAt}
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {form.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="type-body-sm text-red-700">{form.error}</p>
          </div>
        )}

        {/* Warning for Urgent Messages */}
        {form.formData.priority === "urgent" && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="type-ui-sm mb-1 font-medium text-orange-900">Urgent Priority Notice</p>
            <p className="type-body-sm text-orange-700">
              This message will be flagged as urgent and may trigger push notifications to the user.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 border-neutral-200 border-t pt-6">
          <button
            className="type-ui-sm flex-1 rounded-lg border border-neutral-200 bg-white px-6 py-3 font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={messageMutation.isLoading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={
              "type-ui-sm flex-1 rounded-lg px-6 py-3 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50" +
              (form.formData.priority === "urgent"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-neutral-900 hover:bg-neutral-800")
            }
            disabled={messageMutation.isLoading}
            onClick={handleSubmit}
            type="button"
          >
            {messageMutation.isLoading
              ? "Sending..."
              : form.formData.sendImmediately
                ? "Send Message"
                : "Schedule Message"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
