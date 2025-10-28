"use client";

import { type ChangeEvent, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { UnexpectedError } from "@/components/feedback/unexpected-error";
import { submitDocuments } from "./actions";
import { defaultActionState, type OnboardingActionState, REQUIRED_DOCUMENTS, OPTIONAL_DOCUMENTS } from "./state";
import { cn } from "@/lib/utils";

const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-200";
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";
const MAX_FILE_SIZE_LABEL = "5MB";

function formatBytes(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (!bytes) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

const ACCEPTED_TYPE_LABEL = "PDF, JPG, PNG";

type Props = {
  inputClass: string;
};

type FieldConfig = {
  key: string;
  label: string;
  required: boolean;
};

export function DocumentUploadForm({ inputClass }: Props) {
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(submitDocuments, defaultActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const documents: FieldConfig[] = useMemo(
    () => [
      ...REQUIRED_DOCUMENTS.map((doc) => ({ key: doc.key, label: doc.label, required: true })),
      ...OPTIONAL_DOCUMENTS.map((doc) => ({ key: doc.key, label: doc.label, required: false })),
    ],
    [],
  );

  const fieldError = (key: string) => state.fieldErrors?.[key];

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} className="space-y-6" action={formAction} noValidate>
      <Feedback state={state} />
      {state.status === "error" && state.error ? <UnexpectedError message={state.error} /> : null}

      <div className="space-y-4">
        {documents.map((doc) => (
          <DocumentField
            key={doc.key}
            config={doc}
            inputClass={inputClass}
            serverError={fieldError(`document_${doc.key}`)}
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

type DocumentFieldProps = {
  config: FieldConfig;
  inputClass: string;
  serverError?: string;
};

function DocumentField({ config, inputClass, serverError }: DocumentFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const inputId = `document_${config.key}`;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setClientError(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setClientError(`File must be ${MAX_FILE_SIZE_LABEL} or smaller.`);
      return;
    }

    const mimeType = (file.type || "").toLowerCase();
    if (!mimeType.includes("pdf") && !mimeType.includes("jpeg") && !mimeType.includes("jpg") && !mimeType.includes("png")) {
      setSelectedFile(null);
      setClientError("Only PDF, JPG, or PNG files are supported.");
      return;
    }

    setClientError(null);
    setSelectedFile(file);
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-white/90 p-4",
        config.required ? "border-neutral-200 shadow-sm" : "border-dashed border-neutral-200",
      )}
    >
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-semibold text-neutral-800">
          {config.label}
        </label>
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            config.required ? "text-[#c4534d]" : "text-neutral-500",
          )}
        >
          {config.required ? "Required" : "Optional"}
        </span>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Upload {config.required ? "a clear" : "an optional"} scan or photo ({ACCEPTED_TYPE_LABEL}, max {MAX_FILE_SIZE_LABEL}).
      </p>
      <input
        id={inputId}
        name={`document_${config.key}`}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className={cn(
          inputClass,
          "cursor-pointer",
          (serverError || clientError) && errorClass,
        )}
        aria-invalid={Boolean(serverError || clientError)}
        required={config.required}
        onChange={handleFileChange}
      />
      <textarea
        name={`document_${config.key}_note`}
        rows={2}
        className={`${inputClass} mt-3`}
        placeholder="Notes (passwords, expiry date, issuing organization)"
      />
      {selectedFile ? (
        <p className="mt-2 text-xs text-neutral-600">
          Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
        </p>
      ) : null}
      {clientError ? <p className="mt-1 text-xs text-red-600">{clientError}</p> : null}
      {serverError ? <p className="mt-1 text-xs text-red-600">{serverError}</p> : null}
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
