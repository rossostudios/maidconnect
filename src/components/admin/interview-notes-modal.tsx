"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel01Icon, CheckmarkCircle02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeHTML } from "@/lib/utils/sanitize";

const interviewNotesSchema = z.object({
  professionalism: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  technicalKnowledge: z.number().min(1).max(5),
  customerService: z.number().min(1).max(5),
  notes: z.string().min(10, "Please provide detailed notes (at least 10 characters)"),
  recommendation: z.enum(["approve", "reject", "second_interview"]),
  interviewDate: z.string(),
  interviewTime: z.string(),
  interviewerName: z.string().optional(),
});

type InterviewNotesFormData = z.infer<typeof interviewNotesSchema>;

type InterviewNotesModalProps = {
  applicationId: string;
  professionalName: string;
  interviewDate?: string;
  interviewTime?: string;
  existingNotes?: Partial<InterviewNotesFormData>;
  onClose: () => void;
  onSave: () => void;
};

export function InterviewNotesModal({
  applicationId,
  professionalName,
  interviewDate,
  interviewTime,
  existingNotes,
  onClose,
  onSave,
}: InterviewNotesModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InterviewNotesFormData>({
    resolver: zodResolver(interviewNotesSchema),
    defaultValues: {
      professionalism: existingNotes?.professionalism || 3,
      communication: existingNotes?.communication || 3,
      technicalKnowledge: existingNotes?.technicalKnowledge || 3,
      customerService: existingNotes?.customerService || 3,
      notes: existingNotes?.notes || "",
      recommendation: existingNotes?.recommendation || "approve",
      interviewDate: existingNotes?.interviewDate || interviewDate || "",
      interviewTime: existingNotes?.interviewTime || interviewTime || "",
      interviewerName: existingNotes?.interviewerName || "",
    },
  });

  const ratings = {
    professionalism: watch("professionalism"),
    communication: watch("communication"),
    technicalKnowledge: watch("technicalKnowledge"),
    customerService: watch("customerService"),
  };

  const recommendation = watch("recommendation");

  const onSubmit = async (data: InterviewNotesFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      // Sanitize notes before submission
      const sanitizedNotes = sanitizeHTML(data.notes);

      const response = await fetch(`/api/admin/applications/${applicationId}/interview-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ratings: {
            professionalism: data.professionalism,
            communication: data.communication,
            technical_knowledge: data.technicalKnowledge,
            customer_service: data.customerService,
          },
          notes: sanitizedNotes,
          recommendation: data.recommendation,
          interview_date: data.interviewDate,
          interview_time: data.interviewTime,
          interviewer_name: data.interviewerName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save interview notes");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save interview notes");
    } finally {
      setIsSaving(false);
    }
  };

  const RatingInput = ({
    name,
    label,
    value,
  }: {
    name: keyof typeof ratings;
    label: string;
    value: number;
  }) => (
    <div className="space-y-3">
      <Label className="font-medium text-neutral-900 text-sm">{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            className={`flex h-12 w-12 items-center justify-center rounded-lg border font-medium text-sm transition-colors ${
              value >= rating
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-500 hover:bg-orange-50"
            }`}
            key={rating}
            onClick={() => setValue(name, rating)}
            type="button"
          >
            {rating}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-neutral-600 text-xs">
          {value === 5
            ? "Excellent"
            : value === 4
              ? "Good"
              : value === 3
                ? "Average"
                : value === 2
                  ? "Below Average"
                  : "Poor"}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
      <Card className="relative w-full max-w-3xl border-neutral-200 bg-white">
        <button
          className="absolute top-4 right-4 rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          onClick={onClose}
          type="button"
        >
          <HugeiconsIcon className="h-6 w-6" icon={Cancel01Icon} />
        </button>

        <CardHeader className="pb-6">
          <h2 className="font-medium text-2xl text-neutral-900">Interview Notes & Scoring</h2>
          <p className="text-neutral-600 text-sm">{professionalName}</p>
        </CardHeader>

        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Interview Date & Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Interview Date</Label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900 text-sm transition-colors focus:border-orange-500 focus:outline-none"
                  id="interviewDate"
                  type="date"
                  {...register("interviewDate")}
                />
                {errors.interviewDate && (
                  <p className="text-red-600 text-xs">{errors.interviewDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewTime">Interview Time</Label>
                <input
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900 text-sm transition-colors focus:border-orange-500 focus:outline-none"
                  id="interviewTime"
                  type="time"
                  {...register("interviewTime")}
                />
                {errors.interviewTime && (
                  <p className="text-red-600 text-xs">{errors.interviewTime.message}</p>
                )}
              </div>
            </div>

            {/* Interviewer Name */}
            <div className="space-y-2">
              <Label htmlFor="interviewerName">Interviewer Name (Optional)</Label>
              <input
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900 text-sm transition-colors focus:border-orange-500 focus:outline-none"
                id="interviewerName"
                placeholder="Enter interviewer name"
                type="text"
                {...register("interviewerName")}
              />
            </div>

            {/* Rating Scales */}
            <div className="space-y-6">
              <h3 className="font-medium text-lg text-neutral-900">Rate the Candidate</h3>

              <RatingInput
                label="Professionalism"
                name="professionalism"
                value={ratings.professionalism}
              />
              <RatingInput
                label="Communication Skills"
                name="communication"
                value={ratings.communication}
              />
              <RatingInput
                label="Technical Knowledge"
                name="technicalKnowledge"
                value={ratings.technicalKnowledge}
              />
              <RatingInput
                label="Customer Service Orientation"
                name="customerService"
                value={ratings.customerService}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Interview Notes</Label>
              <Textarea
                className="min-h-[150px]"
                id="notes"
                placeholder="Detailed notes about the interview, candidate's responses, and observations..."
                {...register("notes")}
              />
              {errors.notes && <p className="text-red-600 text-xs">{errors.notes.message}</p>}
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <Label>Recommendation</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setValue("recommendation", value as InterviewNotesFormData["recommendation"])
                }
                value={recommendation}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="approve" value="approve" />
                  <Label
                    className="cursor-pointer font-normal text-neutral-900 text-sm"
                    htmlFor="approve"
                  >
                    Approve - Candidate meets all requirements
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="reject" value="reject" />
                  <Label
                    className="cursor-pointer font-normal text-neutral-900 text-sm"
                    htmlFor="reject"
                  >
                    Reject - Candidate does not meet requirements
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="second_interview" value="second_interview" />
                  <Label
                    className="cursor-pointer font-normal text-neutral-900 text-sm"
                    htmlFor="second_interview"
                  >
                    Request Second Interview - Need additional evaluation
                  </Label>
                </div>
              </RadioGroup>
              {errors.recommendation && (
                <p className="text-red-600 text-xs">{errors.recommendation.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon className="h-4 w-4" icon={CheckmarkCircle02Icon} />
                    Save Interview Notes
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
