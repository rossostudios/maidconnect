"use client";

import { useActionState } from "react";
import { submitDocuments, defaultActionState, type OnboardingActionState, REQUIRED_DOCUMENTS, OPTIONAL_DOCUMENTS } from "./actions";
import { cn } from "@/lib/utils";

type Props = {
  inputClass: string;
};

const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-200";

export function DocumentUploadForm({ inputClass }: Props) {
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(submitDocuments, defaultActionState);

  const fieldError = (key: string) => state.fieldErrors?.[key];

  return (
    <form className="space-y-6" action={formAction} noValidate>
      <Feedback state={state} />

      <div className="space-y-4">
        {REQUIRED_DOCUMENTS.map((doc) => (
          <DocumentField
            key={doc.key}
            label={doc.label}
            required
            inputClass={inputClass}
            error={fieldError(`document_${doc.key}`)}
            name={doc.key}
          />
        ))}

        {OPTIONAL_DOCUMENTS.map((doc) => (
          <DocumentField
            key={doc.key}
            label={doc.label}
            inputClass={inputClass}
            name={doc.key}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-md bg-[#fd857f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#eb6c65]",
            pending && "cursor-not-allowed opacity-70",
          )}
        >
          {pending ? "Submitting…" : "Submit documents"}
        </button>
      </div>
    </form>
  );
}

function DocumentField({
  label,
  required = false,
  inputClass,
  error,
  name,
}: {
  label: string;
  required?: boolean;
  inputClass: string;
  error?: string;
  name: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white/90 p-4",
        required ? "shadow-sm" : "border-dashed",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            required ? "text-[#c4534d]" : "text-neutral-500",
          )}
        >
          {required ? "Required" : "Optional"}
        </span>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Paste a secure link to your file or describe how we can access it.
      </p>
      <input
        type="text"
        name={`document_${name}`}
        className={cn(inputClass, error && errorClass)}
        placeholder="https://drive.google.com/..."
        aria-invalid={Boolean(error)}
        required={required}
      />
      <textarea
        name={`document_${name}_note`}
        rows={2}
        className={`${inputClass} mt-3`}
        placeholder="Notes (passwords, expiry date, issuing organization)"
      />
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function Feedback({ state }: { state: OnboardingActionState }) {
  if (state.status === "error" && state.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {state.error}
      </div>
    );
  }
  if (state.status === "success" && state.message) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
        {state.message}
      </div>
    );
  }
  return null;
}
