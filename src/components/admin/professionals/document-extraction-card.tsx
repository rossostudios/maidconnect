"use client";

/**
 * Document Extraction Card
 *
 * AI-powered document upload and extraction component for admin professional vetting.
 * Automatically extracts structured data from ID cards, certifications, and background checks.
 *
 * Features:
 * - Drag & drop file upload
 * - Real-time extraction progress
 * - Structured data display
 * - Confidence scoring
 * - Auto-fill professional profile
 * - Manual override for corrections
 */

import {
  AlertCircleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  EyeIcon,
  Loading03Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DocumentExtraction = {
  documentType:
    | "national_id"
    | "passport"
    | "background_check_report"
    | "certification"
    | "reference_letter"
    | "unknown";
  confidence: number;
  personalInfo?: {
    fullName?: string;
    idNumber?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
    expirationDate?: string;
  }>;
  backgroundCheckResults?: {
    status: "clear" | "conditional" | "flagged" | "pending";
    issueDate?: string;
    findings?: string[];
  };
  warnings?: string[];
};

type DocumentExtractionCardProps = {
  professionalId?: string;
  onExtractionComplete?: (data: DocumentExtraction) => void;
  onAutoFill?: (
    data: Partial<{
      fullName: string;
      idNumber: string;
      dateOfBirth: string;
    }>
  ) => void;
};

export function DocumentExtractionCard({
  professionalId,
  onExtractionComplete,
  onAutoFill,
}: DocumentExtractionCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG, PNG, WebP, or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtraction(null);

    // Generate preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }

    // Auto-extract after file selection
    extractDocument(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const extractDocument = async (fileToExtract: File) => {
    setExtracting(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(fileToExtract);

      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];

        // Call document extraction API
        const response = await fetch("/api/admin/professionals/extract-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64Data,
            imageType: "base64",
            professionalId,
          }),
        });

        if (!response.ok) {
          throw new Error("Extraction failed");
        }

        const data: DocumentExtraction = await response.json();
        setExtraction(data);

        // Trigger callback
        if (onExtractionComplete) {
          onExtractionComplete(data);
        }
      };

      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const handleAutoFill = () => {
    if (!(extraction?.personalInfo && onAutoFill)) {
      return;
    }

    onAutoFill({
      fullName: extraction.personalInfo.fullName,
      idNumber: extraction.personalInfo.idNumber,
      dateOfBirth: extraction.personalInfo.dateOfBirth,
    });
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtraction(null);
    setError(null);
  };

  return (
    <Card className="border-neutral-200 bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg text-neutral-900">AI Document Extraction</h3>
          <p className="text-neutral-600 text-sm">
            Upload ID, certifications, or background check reports
          </p>
        </div>
        {file && (
          <button
            className="text-neutral-400 transition-colors hover:text-neutral-600"
            onClick={handleReset}
            type="button"
          >
            <HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Upload Area */}
      {file ? (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="border border-neutral-200 bg-neutral-50 p-4">
            {previewUrl ? (
              <div className="flex items-center gap-4">
                <img
                  alt="Document preview"
                  className="h-32 w-32 border border-neutral-200 bg-white object-cover"
                  src={previewUrl}
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 text-sm">{file.name}</p>
                  <p className="text-neutral-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex h-32 w-32 items-center justify-center border border-neutral-200 bg-white">
                  <HugeiconsIcon
                    className="h-12 w-12 text-neutral-400"
                    icon={EyeIcon}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 text-sm">{file.name}</p>
                  <p className="text-neutral-500 text-xs">
                    {(file.size / 1024).toFixed(1)} KB • PDF Document
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Extraction Progress */}
          {extracting && (
            <div className="flex items-center gap-3 border border-orange-200 bg-orange-50 px-4 py-3">
              <HugeiconsIcon className="h-4 w-4 animate-spin" icon={Loading03Icon} />
              <span className="text-neutral-700 text-sm">Extracting document data...</span>
            </div>
          )}

          {/* Extraction Results */}
          {extraction && (
            <div className="space-y-3 border border-neutral-200 bg-white p-4">
              {/* Document Type & Confidence */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    className="h-5 w-5 text-green-600"
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={1.5}
                  />
                  <span className="font-semibold text-neutral-900 text-sm">
                    {extraction.documentType
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden bg-neutral-200">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${extraction.confidence}%` }}
                    />
                  </div>
                  <span className="text-neutral-500 text-xs">{extraction.confidence}%</span>
                </div>
              </div>

              {/* Personal Info */}
              {extraction.personalInfo && (
                <div className="space-y-2 border-neutral-200 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      className="h-4 w-4 text-neutral-600"
                      icon={UserIcon}
                      strokeWidth={1.5}
                    />
                    <span className="font-medium text-neutral-700 text-sm">
                      Personal Information
                    </span>
                  </div>
                  {extraction.personalInfo.fullName && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 text-sm">Full Name:</span>
                      <span className="font-medium text-neutral-900 text-sm">
                        {extraction.personalInfo.fullName}
                      </span>
                    </div>
                  )}
                  {extraction.personalInfo.idNumber && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 text-sm">ID Number:</span>
                      <span className="font-medium text-neutral-900 text-sm">
                        {extraction.personalInfo.idNumber}
                      </span>
                    </div>
                  )}
                  {extraction.personalInfo.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 text-sm">Date of Birth:</span>
                      <span className="font-medium text-neutral-900 text-sm">
                        {extraction.personalInfo.dateOfBirth}
                      </span>
                    </div>
                  )}
                  {extraction.personalInfo.nationality && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 text-sm">Nationality:</span>
                      <span className="font-medium text-neutral-900 text-sm">
                        {extraction.personalInfo.nationality}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Certifications */}
              {extraction.certifications && extraction.certifications.length > 0 && (
                <div className="space-y-2 border-neutral-200 border-t pt-3">
                  <span className="font-medium text-neutral-700 text-sm">Certifications</span>
                  {extraction.certifications.map((cert, index) => (
                    <div className="border border-neutral-200 bg-neutral-50 px-3 py-2" key={index}>
                      <p className="font-medium text-neutral-900 text-sm">{cert.name}</p>
                      <p className="text-neutral-600 text-xs">Issued by: {cert.issuer}</p>
                      {cert.issueDate && (
                        <p className="text-neutral-500 text-xs">Issued: {cert.issueDate}</p>
                      )}
                      {cert.expirationDate && (
                        <p className="text-neutral-500 text-xs">Expires: {cert.expirationDate}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Background Check */}
              {extraction.backgroundCheckResults && (
                <div className="space-y-2 border-neutral-200 border-t pt-3">
                  <span className="font-medium text-neutral-700 text-sm">Background Check</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-3 py-1 font-medium text-xs ${
                        extraction.backgroundCheckResults.status === "clear"
                          ? "border border-green-200 bg-green-50 text-green-700"
                          : extraction.backgroundCheckResults.status === "flagged"
                            ? "border border-red-200 bg-red-50 text-red-700"
                            : "border border-yellow-200 bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {extraction.backgroundCheckResults.status.toUpperCase()}
                    </span>
                    {extraction.backgroundCheckResults.issueDate && (
                      <span className="text-neutral-500 text-xs">
                        {extraction.backgroundCheckResults.issueDate}
                      </span>
                    )}
                  </div>
                  {extraction.backgroundCheckResults.findings &&
                    extraction.backgroundCheckResults.findings.length > 0 && (
                      <ul className="ml-4 list-disc space-y-1 text-neutral-600 text-xs">
                        {extraction.backgroundCheckResults.findings.map((finding, index) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {/* Warnings */}
              {extraction.warnings && extraction.warnings.length > 0 && (
                <div className="border border-yellow-200 bg-yellow-50 px-3 py-2">
                  <div className="flex items-start gap-2">
                    <HugeiconsIcon
                      className="mt-0.5 h-4 w-4 text-yellow-700"
                      icon={AlertCircleIcon}
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="font-medium text-sm text-yellow-900">Warnings</p>
                      <ul className="mt-1 ml-4 list-disc space-y-1 text-xs text-yellow-700">
                        {extraction.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-Fill Button */}
              {extraction.personalInfo && onAutoFill && (
                <Button className="w-full" onClick={handleAutoFill} type="button" variant="default">
                  Auto-Fill Professional Profile
                </Button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  className="mt-0.5 h-4 w-4"
                  icon={AlertCircleIcon}
                  strokeWidth={1.5}
                />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center border-2 border-neutral-300 border-dashed bg-neutral-50 px-6 py-8 transition-colors hover:border-orange-500 hover:bg-orange-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <HugeiconsIcon
            className="mb-4 h-12 w-12 text-neutral-400"
            icon={CloudUploadIcon}
            strokeWidth={1.5}
          />
          <p className="mb-2 text-center font-medium text-neutral-900">
            Drop document here or click to browse
          </p>
          <p className="mb-4 text-center text-neutral-500 text-sm">
            Supports JPG, PNG, WebP, PDF (max 10MB)
          </p>
          <input
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            className="hidden"
            id="document-upload"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                handleFileSelect(selectedFile);
              }
            }}
            type="file"
          />
          <label htmlFor="document-upload">
            <Button className="cursor-pointer" type="button" variant="outline">
              Select File
            </Button>
          </label>
        </div>
      )}
    </Card>
  );
}
