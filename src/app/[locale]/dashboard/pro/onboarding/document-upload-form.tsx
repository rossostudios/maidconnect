"use client";

import { useTranslations } from "next-intl";
import { type ChangeEvent, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { UnexpectedError } from "@/components/feedback/unexpected-error";
import { cn } from "@/lib/utils";
import { submitDocuments } from "./actions";
import {
  defaultActionState,
  type OnboardingActionState,
  OPTIONAL_DOCUMENTS,
  REQUIRED_DOCUMENTS,
} from "./state";

const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-200";
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";
const MAX_FILE_SIZE_LABEL = "5MB";

function formatBytes(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (!bytes) {
    return "0 B";
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** i;
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
  const t = useTranslations("dashboard.pro.documentUploadForm");
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    submitDocuments,
    defaultActionState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const documents: FieldConfig[] = useMemo(
    () => [
      ...REQUIRED_DOCUMENTS.map((doc) => ({ key: doc.key, label: doc.label, required: true })),
      ...OPTIONAL_DOCUMENTS.map((doc) => ({ key: doc.key, label: doc.label, required: false })),
    ],
    []
  );

  const fieldError = (key: string) => state.fieldErrors?.[key];

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form action={formAction} className="space-y-8" noValidate ref={formRef}>
      <Feedback state={state} />
      {state.status === "error" && state.error ? <UnexpectedError message={state.error} /> : null}

      <div className="space-y-6">
        {documents.map((doc) => (
          <DocumentField
            config={doc}
            inputClass={inputClass}
            key={doc.key}
            serverError={fieldError(`document_${doc.key}`)}
          />
        ))}
      </div>

      <div className="flex justify-end border-[#ebe5d8] border-t pt-8">
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-[#8B7355] px-8 py-4 font-semibold text-base text-white shadow-[0_6px_18px_rgba(255,93,70,0.22)] transition hover:bg-[#9B8B7E]",
            pending && "cursor-not-allowed opacity-70"
          )}
          disabled={pending}
          type="submit"
        >
          {pending ? t("footer.submitting") : t("footer.submit")}
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
  const t = useTranslations("dashboard.pro.documentUploadForm");
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
      setClientError(t("errors.fileSize", { size: MAX_FILE_SIZE_LABEL }));
      return;
    }

    const mimeType = (file.type || "").toLowerCase();
    if (
      !(
        mimeType.includes("pdf") ||
        mimeType.includes("jpeg") ||
        mimeType.includes("jpg") ||
        mimeType.includes("png")
      )
    ) {
      setSelectedFile(null);
      setClientError(t("errors.fileType"));
      return;
    }

    setClientError(null);
    setSelectedFile(file);
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md",
        config.required ? "border-[#ebe5d8]" : "border-[#ebe5d8] border-dashed"
      )}
    >
      <div className="flex items-center justify-between">
        <label className="font-semibold text-[#211f1a] text-lg" htmlFor={inputId}>
          {config.label}
        </label>
        <span
          className={cn(
            "rounded-full px-3 py-1 font-semibold text-xs",
            config.required ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-600"
          )}
        >
          {config.required ? t("badges.required") : t("badges.optional")}
        </span>
      </div>
      <p className="mt-3 text-[#5d574b] text-sm">
        {t(config.required ? "uploadInstruction.required" : "uploadInstruction.optional", {
          formats: ACCEPTED_TYPE_LABEL,
          maxSize: MAX_FILE_SIZE_LABEL,
        })}
      </p>
      <input
        accept={ACCEPTED_EXTENSIONS}
        aria-invalid={Boolean(serverError || clientError)}
        className={cn(
          inputClass,
          "mt-4 cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-[#8B7355] file:px-4 file:py-2 file:font-semibold file:text-sm file:text-white hover:file:bg-[#9B8B7E]",
          (serverError || clientError) && errorClass
        )}
        id={inputId}
        name={`document_${config.key}`}
        onChange={handleFileChange}
        required={config.required}
        type="file"
      />
      <textarea
        className={`${inputClass} mt-4`}
        name={`document_${config.key}_note`}
        placeholder={t("notePlaceholder")}
        rows={2}
      />
      {selectedFile ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
          <svg
            aria-label="Check mark icon"
            className="h-5 w-5 text-green-600"
            fill="currentColor"
            role="img"
            viewBox="0 0 20 20"
          >
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              fillRule="evenodd"
            />
          </svg>
          <p className="text-green-800 text-sm">
            {t("selectedFile", { name: selectedFile.name, size: formatBytes(selectedFile.size) })}
          </p>
        </div>
      ) : null}
      {clientError ? (
        <p className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <svg
            aria-label="Error icon"
            className="h-4 w-4"
            fill="currentColor"
            role="img"
            viewBox="0 0 20 20"
          >
            <path
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              fillRule="evenodd"
            />
          </svg>
          {clientError}
        </p>
      ) : null}
      {serverError ? (
        <p className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <svg
            aria-label="Error icon"
            className="h-4 w-4"
            fill="currentColor"
            role="img"
            viewBox="0 0 20 20"
          >
            <path
              clipRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              fillRule="evenodd"
            />
          </svg>
          {serverError}
        </p>
      ) : null}
    </div>
  );
}

function Feedback({ state }: { state: OnboardingActionState }) {
  if (state.status === "error" && state.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm" role="alert">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg
              aria-label="Error icon"
              className="h-5 w-5 text-red-600"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="flex-1 text-base text-red-800 leading-relaxed">{state.error}</p>
        </div>
      </div>
    );
  }
  if (state.status === "success" && state.message) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm" role="status">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <svg
              aria-label="Success icon"
              className="h-5 w-5 text-green-600"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="flex-1 text-base text-green-800 leading-relaxed">{state.message}</p>
        </div>
      </div>
    );
  }
  return null;
}
