"use client";

/**
 * CredentialsManager - Professional Credentials Management
 *
 * Airbnb host dashboard-style credentials management component.
 * Professionals can add, edit, and verify their certifications.
 *
 * Features:
 * - Add certifications, licenses, training
 * - Upload verification documents
 * - Track verification status
 * - Display expiration dates
 *
 * Following Lia Design System:
 * - rounded-lg containers
 * - rausch-500 primary accent
 * - neutral color palette
 */

import {
  Add01Icon,
  Calendar03Icon,
  Certificate01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete02Icon,
  Edit02Icon,
  FileAttachmentIcon,
  MoreHorizontalIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format, isPast, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { geistSans } from "@/app/fonts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/core";

// ============================================================================
// Types
// ============================================================================

export type CredentialType = "certification" | "license" | "training" | "course" | "other";

export type VerificationStatus = "pending" | "verified" | "rejected" | "expired";

export type Credential = {
  id: string;
  type: CredentialType;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  documentUrl?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
};

export type CredentialsManagerProps = {
  credentials: Credential[];
  professionalId: string;
  onUpdate?: (credentials: Credential[]) => void;
  className?: string;
};

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; bgColor: string }> =
  {
    pending: {
      label: "Pending Review",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50 border-yellow-200",
    },
    verified: {
      label: "Verified",
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-200",
    },
    rejected: {
      label: "Rejected",
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
    },
    expired: {
      label: "Expired",
      color: "text-neutral-500",
      bgColor: "bg-neutral-50 border-neutral-200",
    },
  };

const TYPE_LABELS: Record<CredentialType, string> = {
  certification: "Certification",
  license: "License",
  training: "Training",
  course: "Course",
  other: "Other",
};

// ============================================================================
// Main Component
// ============================================================================

export function CredentialsManager({
  credentials: initialCredentials,
  professionalId,
  onUpdate,
  className,
}: CredentialsManagerProps) {
  const t = useTranslations("dashboard.pro.portfolio.credentials");
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for expired credentials
  const credentialsWithStatus = credentials.map((cred) => {
    if (cred.expirationDate && isPast(parseISO(cred.expirationDate))) {
      return { ...cred, verificationStatus: "expired" as VerificationStatus };
    }
    return cred;
  });

  const verifiedCount = credentialsWithStatus.filter(
    (c) => c.verificationStatus === "verified"
  ).length;

  const handleSave = async (credential: Partial<Credential>) => {
    setIsLoading(true);
    try {
      // Create or update credential
      const isNew = !credential.id;
      const newCredential: Credential = {
        id: credential.id || crypto.randomUUID(),
        type: credential.type || "certification",
        name: credential.name || "",
        issuer: credential.issuer || "",
        issueDate: credential.issueDate || new Date().toISOString(),
        expirationDate: credential.expirationDate,
        documentUrl: credential.documentUrl,
        verificationStatus: isNew ? "pending" : credential.verificationStatus || "pending",
        createdAt: credential.createdAt || new Date().toISOString(),
      };

      const updatedCredentials = isNew
        ? [...credentials, newCredential]
        : credentials.map((c) => (c.id === credential.id ? { ...c, ...credential } : c));

      setCredentials(updatedCredentials);
      onUpdate?.(updatedCredentials);

      toast.success(isNew ? "Credential added" : "Credential updated");
      setIsAddModalOpen(false);
      setEditingCredential(null);
    } catch (error) {
      toast.error("Failed to save credential");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this credential?")) {
      return;
    }

    const updatedCredentials = credentials.filter((c) => c.id !== id);
    setCredentials(updatedCredentials);
    onUpdate?.(updatedCredentials);
    toast.success("Credential deleted");
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={cn("font-semibold text-foreground text-lg", geistSans.className)}>
            {t("title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {verifiedCount} of {credentials.length} credentials verified
          </p>
        </div>
        <Button className="gap-2" onPress={() => setIsAddModalOpen(true)} size="sm">
          <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
          Add Credential
        </Button>
      </div>

      {/* Credentials List */}
      {credentialsWithStatus.length > 0 ? (
        <div className="space-y-3">
          {credentialsWithStatus.map((credential) => (
            <CredentialCard
              credential={credential}
              key={credential.id}
              onDelete={() => handleDelete(credential.id)}
              onEdit={() => setEditingCredential(credential)}
            />
          ))}
        </div>
      ) : (
        <EmptyCredentialsState onAdd={() => setIsAddModalOpen(true)} />
      )}

      {/* Verification Tips */}
      <VerificationTips />

      {/* Add/Edit Modal */}
      <CredentialModal
        credential={editingCredential}
        isLoading={isLoading}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCredential(null);
        }}
        onSave={handleSave}
        open={isAddModalOpen || !!editingCredential}
      />
    </div>
  );
}

// ============================================================================
// Credential Card
// ============================================================================

type CredentialCardProps = {
  credential: Credential;
  onEdit: () => void;
  onDelete: () => void;
};

function CredentialCard({ credential, onEdit, onDelete }: CredentialCardProps) {
  const status = STATUS_CONFIG[credential.verificationStatus];

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all",
        credential.verificationStatus === "verified"
          ? "border-green-200 bg-white dark:border-green-500/30 dark:bg-neutral-900"
          : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Credential Info */}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              credential.verificationStatus === "verified"
                ? "bg-green-50 dark:bg-green-500/10"
                : "bg-neutral-50 dark:bg-neutral-800"
            )}
          >
            <HugeiconsIcon
              className={cn(
                "h-5 w-5",
                credential.verificationStatus === "verified" ? "text-green-500" : "text-neutral-500"
              )}
              icon={Certificate01Icon}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className={cn("font-semibold text-foreground", geistSans.className)}>
                {credential.name}
              </h4>
              <Badge
                className={cn("border text-xs", status.bgColor, status.color)}
                variant="secondary"
              >
                {credential.verificationStatus === "verified" && (
                  <HugeiconsIcon className="mr-1 h-3 w-3" icon={CheckmarkCircle02Icon} />
                )}
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{credential.issuer}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
              <span className="inline-flex items-center gap-1">
                <HugeiconsIcon className="h-3.5 w-3.5" icon={Calendar03Icon} />
                Issued: {format(parseISO(credential.issueDate), "MMM yyyy")}
              </span>
              {credential.expirationDate && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    isPast(parseISO(credential.expirationDate)) && "text-red-500"
                  )}
                >
                  <HugeiconsIcon className="h-3.5 w-3.5" icon={Clock01Icon} />
                  Expires: {format(parseISO(credential.expirationDate), "MMM yyyy")}
                </span>
              )}
              {credential.documentUrl && (
                <span className="inline-flex items-center gap-1 text-rausch-600">
                  <HugeiconsIcon className="h-3.5 w-3.5" icon={FileAttachmentIcon} />
                  Document attached
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8" size="icon" variant="ghost">
              <HugeiconsIcon className="h-4 w-4" icon={MoreHorizontalIcon} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={Edit02Icon} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={onDelete}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={Delete02Icon} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rejection Reason */}
      {credential.verificationStatus === "rejected" && credential.rejectionReason && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-500/10">
          <p className="text-red-700 text-sm dark:text-red-400">
            <strong>Rejection reason:</strong> {credential.rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyCredentialsState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-300 border-dashed bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rausch-100 dark:bg-rausch-500/20">
        <HugeiconsIcon className="h-6 w-6 text-rausch-500" icon={Certificate01Icon} />
      </div>
      <h3 className={cn("mb-2 font-semibold text-foreground text-lg", geistSans.className)}>
        No Credentials Yet
      </h3>
      <p className="mb-4 max-w-sm text-muted-foreground text-sm">
        Add your certifications, licenses, and training to build trust with clients and stand out
        from other professionals.
      </p>
      <Button className="gap-2" onPress={onAdd}>
        <HugeiconsIcon className="h-4 w-4" icon={Add01Icon} />
        Add Your First Credential
      </Button>
    </div>
  );
}

// ============================================================================
// Verification Tips
// ============================================================================

function VerificationTips() {
  return (
    <div className="rounded-lg border border-babu-200 bg-babu-50 p-4 dark:border-babu-500/30 dark:bg-babu-500/10">
      <h4
        className={cn(
          "font-semibold text-babu-900 text-sm dark:text-babu-400",
          geistSans.className
        )}
      >
        💡 Verification Tips
      </h4>
      <ul className="mt-2 space-y-1 text-babu-700 text-sm dark:text-babu-300">
        <li>• Upload clear, legible copies of your certificates</li>
        <li>• Include both sides if applicable</li>
        <li>• Verification typically takes 1-2 business days</li>
        <li>• Verified credentials display a green badge on your profile</li>
      </ul>
    </div>
  );
}

// ============================================================================
// Add/Edit Modal
// ============================================================================

type CredentialModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (credential: Partial<Credential>) => void;
  credential: Credential | null;
  isLoading: boolean;
};

function CredentialModal({ open, onClose, onSave, credential, isLoading }: CredentialModalProps) {
  const [formData, setFormData] = useState<Partial<Credential>>(
    credential || {
      type: "certification",
      name: "",
      issuer: "",
      issueDate: new Date().toISOString().split("T")[0],
    }
  );

  // Reset form when credential changes
  useState(() => {
    if (credential) {
      setFormData(credential);
    } else {
      setFormData({
        type: "certification",
        name: "",
        issuer: "",
        issueDate: new Date().toISOString().split("T")[0],
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={open}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{credential ? "Edit Credential" : "Add Credential"}</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Type */}
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as CredentialType })
                }
                value={formData.type}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Credential Name</Label>
              <Input
                className="mt-1"
                id="name"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., CPR Certification"
                required
                value={formData.name || ""}
              />
            </div>

            {/* Issuer */}
            <div>
              <Label htmlFor="issuer">Issuing Organization</Label>
              <Input
                className="mt-1"
                id="issuer"
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g., American Red Cross"
                required
                value={formData.issuer || ""}
              />
            </div>

            {/* Issue Date */}
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                className="mt-1"
                id="issueDate"
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
                type="date"
                value={formData.issueDate?.split("T")[0] || ""}
              />
            </div>

            {/* Expiration Date */}
            <div>
              <Label htmlFor="expirationDate">Expiration Date (optional)</Label>
              <Input
                className="mt-1"
                id="expirationDate"
                onChange={(e) =>
                  setFormData({ ...formData, expirationDate: e.target.value || undefined })
                }
                type="date"
                value={formData.expirationDate?.split("T")[0] || ""}
              />
            </div>

            {/* Document Upload */}
            <div>
              <Label>Verification Document</Label>
              <div className="mt-1 flex items-center justify-center rounded-lg border border-neutral-300 border-dashed bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="text-center">
                  <HugeiconsIcon
                    className="mx-auto h-8 w-8 text-neutral-400 dark:text-neutral-500"
                    icon={Upload01Icon}
                  />
                  <p className="mt-2 text-muted-foreground text-sm">
                    Upload PDF or image (max 5MB)
                  </p>
                  <Button className="mt-2" size="sm" type="button" variant="outline">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button onPress={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button isDisabled={isLoading} type="submit">
              {isLoading ? "Saving..." : credential ? "Save Changes" : "Add Credential"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Credentials Summary Badge
// ============================================================================

export type CredentialsSummaryProps = {
  total: number;
  verified: number;
  className?: string;
};

export function CredentialsSummary({ total, verified, className }: CredentialsSummaryProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <HugeiconsIcon
        className={cn(
          "h-4 w-4",
          verified > 0 ? "text-green-500" : "text-neutral-400 dark:text-neutral-500"
        )}
        icon={Certificate01Icon}
      />
      <span className="text-muted-foreground text-sm">
        {verified}/{total} credentials verified
      </span>
    </div>
  );
}
