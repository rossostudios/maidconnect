"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { geistSans } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { sanitizeHTML } from "@/lib/utils/sanitize";

type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

type BulkAction = "suspend" | "verify" | "message" | "export";

type BulkOperationProgress = {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
};

type BulkOperationRequest = {
  endpoint: string;
  body: Record<string, unknown>;
};

/**
 * Create initial progress state
 */
function createInitialProgress(totalUsers: number): BulkOperationProgress {
  return {
    total: totalUsers,
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [],
  };
}

/**
 * Create progress state from API result
 */
function createResultProgress(
  total: number,
  result: {
    successful?: number;
    failed?: number;
    errors?: Array<{ userId: string; error: string }>;
  }
): BulkOperationProgress {
  return {
    total,
    processed: total,
    successful: result.successful ?? 0,
    failed: result.failed ?? 0,
    errors: result.errors ?? [],
  };
}

/**
 * Build the API request for a bulk operation
 * Extracted to reduce cognitive complexity of executeBulkOperation
 */
function buildBulkOperationRequest(
  action: BulkAction,
  userIds: string[],
  options: {
    suspensionReason: string;
    suspensionType: "temporary" | "permanent";
    suspensionDays: number;
    messageSubject: string;
    messageContent: string;
  }
): BulkOperationRequest | null {
  const baseBody = { user_ids: userIds };

  switch (action) {
    case "suspend":
      return {
        endpoint: "/api/admin/bulk/suspend",
        body: {
          ...baseBody,
          reason: options.suspensionReason,
          type: options.suspensionType,
          expires_at:
            options.suspensionType === "temporary"
              ? new Date(Date.now() + options.suspensionDays * 24 * 60 * 60 * 1000).toISOString()
              : null,
        },
      };
    case "verify":
      return {
        endpoint: "/api/admin/bulk/verify",
        body: { ...baseBody, approved: true },
      };
    case "message":
      return {
        endpoint: "/api/admin/bulk/message",
        body: {
          ...baseBody,
          subject: options.messageSubject,
          message: sanitizeHTML(options.messageContent),
        },
      };
    case "export":
      return null; // Export handled separately
    default:
      return null;
  }
}

/**
 * Get error message from unknown error
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Bulk operation failed";
}

/**
 * Execute API request and return result
 */
async function executeApiRequest(request: BulkOperationRequest): Promise<{
  ok: boolean;
  result: {
    successful?: number;
    failed?: number;
    errors?: Array<{ userId: string; error: string }>;
    error?: string;
  };
}> {
  const response = await fetch(request.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request.body),
  });
  const result = await response.json();
  return { ok: response.ok, result };
}

/**
 * Progress Display Component - extracted to reduce cognitive complexity
 */
function ProgressDisplay({
  progress,
  onClose,
}: {
  progress: BulkOperationProgress;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="mb-2 flex justify-between">
          <span className="font-medium text-neutral-900 text-sm">Progress:</span>
          <span className="font-medium text-neutral-900 text-sm">
            {progress.processed} / {progress.total}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-rausch-500 transition-all"
            style={{ width: `${(progress.processed / progress.total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="mb-1 font-medium text-neutral-900 text-sm">Successful</p>
          <p className="font-bold text-green-600 text-lg">{progress.successful}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="mb-1 font-medium text-neutral-900 text-sm">Failed</p>
          <p className="font-bold text-lg text-red-600">{progress.failed}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4">
          <p className="mb-1 font-medium text-neutral-900 text-sm">Total</p>
          <p className="font-bold text-lg text-neutral-900">{progress.total}</p>
        </div>
      </div>

      {progress.errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-2 font-medium text-red-900 text-sm">Errors:</p>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {progress.errors.map((error, idx) => (
              <p className="type-body-sm text-red-700" key={idx}>
                User {error.userId}: {error.error}
              </p>
            ))}
          </div>
        </div>
      )}

      {progress.processed === progress.total && (
        <button
          className="w-full rounded-lg bg-rausch-500 px-6 py-3 font-semibold text-sm text-white transition hover:bg-rausch-600"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      )}
    </div>
  );
}

/**
 * Users Table Component - extracted to reduce cognitive complexity
 */
function UsersTable({
  users,
  selectedUserIds,
  onToggleUser,
  onSelectAll,
  isLoading,
}: {
  users: User[];
  selectedUserIds: Set<string>;
  onToggleUser: (userId: string) => void;
  onSelectAll: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-neutral-200 border-b bg-neutral-50">
              <th className="type-ui-sm px-4 py-3 text-left font-semibold text-neutral-900">
                <input
                  checked={selectedUserIds.size === users.length && users.length > 0}
                  className="h-5 w-5 border-neutral-200"
                  onChange={onSelectAll}
                  type="checkbox"
                />
              </th>
              <th className="type-ui-sm px-4 py-3 text-left font-semibold text-neutral-900">
                Name
              </th>
              <th className="type-ui-sm px-4 py-3 text-left font-semibold text-neutral-900">
                Email
              </th>
              <th className="type-ui-sm px-4 py-3 text-left font-semibold text-neutral-900">
                Role
              </th>
              <th className="type-ui-sm px-4 py-3 text-left font-semibold text-neutral-900">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="type-body-sm px-4 py-8 text-center text-neutral-700" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td className="type-body-sm px-4 py-8 text-center text-neutral-700" colSpan={5}>
                  No users found
                </td>
              </tr>
            )}
            {!isLoading &&
              users.map((user) => (
                <tr className="border-neutral-200 border-b hover:bg-neutral-50" key={user.id}>
                  <td className="px-4 py-3">
                    <input
                      checked={selectedUserIds.has(user.id)}
                      className="h-5 w-5 border-neutral-200"
                      onChange={() => onToggleUser(user.id)}
                      type="checkbox"
                    />
                  </td>
                  <td className="type-ui-sm px-4 py-3 text-neutral-900">{user.full_name || "—"}</td>
                  <td className="type-body-sm px-4 py-3 text-neutral-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-rausch-500 px-3 py-1 font-medium text-white text-xs capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="type-body-sm px-4 py-3 text-neutral-700">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BulkOperationsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);

  // Bulk action form states
  const [suspensionReason, setSuspensionReason] = useState("");
  const [suspensionType, setSuspensionType] = useState<"temporary" | "permanent">("temporary");
  const [suspensionDays, setSuspensionDays] = useState(7);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Toggle user selection
  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  // Select all filtered users
  const selectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  // Handle bulk action initiation
  const handleBulkAction = (action: BulkAction) => {
    if (selectedUserIds.size === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setBulkAction(action);
    setShowConfirmModal(true);
  };

  // Execute bulk operation
  const executeBulkOperation = async () => {
    if (!bulkAction || selectedUserIds.size === 0) {
      return;
    }

    // Handle export separately
    if (bulkAction === "export") {
      toast.info("Export functionality coming soon!");
      setShowConfirmModal(false);
      return;
    }

    setIsProcessing(true);
    setProgress(createInitialProgress(selectedUserIds.size));

    const userIdArray = Array.from(selectedUserIds);
    const request = buildBulkOperationRequest(bulkAction, userIdArray, {
      suspensionReason,
      suspensionType,
      suspensionDays,
      messageSubject,
      messageContent,
    });

    if (!request) {
      setIsProcessing(false);
      return;
    }

    try {
      const { ok, result } = await executeApiRequest(request);

      if (!ok) {
        throw new Error(result.error || "Bulk operation failed");
      }

      // Update progress with results
      setProgress(createResultProgress(selectedUserIds.size, result));

      // Clear selection after successful operation
      setSelectedUserIds(new Set());

      // Reload users to reflect changes
      await loadUsers();
    } catch (error) {
      console.error("Bulk operation error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setBulkAction(null);
    setProgress(null);
    setSuspensionReason("");
    setMessageSubject("");
    setMessageContent("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          className="type-ui-sm mb-4 text-rausch-600 transition hover:text-rausch-700"
          onClick={() => router.back()}
          type="button"
        >
          ← Back to Admin
        </button>
        <h1
          className={cn(
            "font-semibold text-3xl text-neutral-900 tracking-tight",
            geistSans.className
          )}
        >
          Bulk Operations
        </h1>
        <p className={cn("mt-2 text-neutral-700 text-sm", geistSans.className)}>
          Select multiple users to perform bulk actions
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              className="type-ui-sm mb-2 block font-medium text-neutral-900"
              htmlFor="search-users"
            >
              Search
            </label>
            <input
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rausch-500"
              id="search-users"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              type="text"
              value={searchQuery}
            />
          </div>
          <div>
            <label
              className="type-ui-sm mb-2 block font-medium text-neutral-900"
              htmlFor="role-filter"
            >
              Role
            </label>
            <select
              className="w-full rounded-lg border border-neutral-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rausch-500"
              id="role-filter"
              onChange={(e) => setRoleFilter(e.target.value)}
              value={roleFilter}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="professional">Professional</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm transition hover:bg-neutral-50"
              onClick={selectAll}
              type="button"
            >
              {selectedUserIds.size === filteredUsers.length ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        {/* Selection Count */}
        {selectedUserIds.size > 0 && (
          <div className="mt-4 rounded-lg border border-rausch-200 bg-rausch-50 p-3">
            <p className="font-medium text-rausch-900 text-sm">
              {selectedUserIds.size} user(s) selected
            </p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className={cn("mb-4 font-semibold text-lg text-neutral-900", geistSans.className)}>
          Bulk Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <button
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 font-medium text-neutral-900 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectedUserIds.size === 0}
            onClick={() => handleBulkAction("suspend")}
            type="button"
          >
            Suspend Users
          </button>
          <button
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 font-medium text-neutral-900 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectedUserIds.size === 0}
            onClick={() => handleBulkAction("verify")}
            type="button"
          >
            Verify Professionals
          </button>
          <button
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 font-medium text-neutral-900 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectedUserIds.size === 0}
            onClick={() => handleBulkAction("message")}
            type="button"
          >
            Send Message
          </button>
          <button
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 font-medium text-neutral-900 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectedUserIds.size === 0}
            onClick={() => handleBulkAction("export")}
            type="button"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        isLoading={isLoading}
        onSelectAll={selectAll}
        onToggleUser={toggleUser}
        selectedUserIds={selectedUserIds}
        users={filteredUsers}
      />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className={cn("mb-4 font-semibold text-lg text-neutral-900", geistSans.className)}>
              Confirm Bulk Operation
            </h2>

            {!progress && (
              <>
                <p className="type-body-sm mb-6 text-neutral-700">
                  You are about to perform a <strong>{bulkAction}</strong> operation on{" "}
                  <strong>{selectedUserIds.size}</strong> user(s).
                </p>

                {/* Action-specific forms */}
                {bulkAction === "suspend" && (
                  <div className="mb-6 space-y-4">
                    <fieldset>
                      <legend className="type-ui-sm mb-2 block font-medium text-neutral-900">
                        Suspension Type
                      </legend>
                      <div className="flex gap-3" role="group">
                        <button
                          className={cn(
                            "flex-1 rounded-lg border-2 px-4 py-2 font-medium text-sm transition",
                            suspensionType === "temporary"
                              ? "border-rausch-500 bg-rausch-500 text-white"
                              : "border-neutral-200 bg-white text-neutral-900"
                          )}
                          onClick={() => setSuspensionType("temporary")}
                          type="button"
                        >
                          Temporary
                        </button>
                        <button
                          className={cn(
                            "flex-1 rounded-lg border-2 px-4 py-2 font-medium text-sm transition",
                            suspensionType === "permanent"
                              ? "border-rausch-500 bg-rausch-500 text-white"
                              : "border-neutral-200 bg-white text-neutral-900"
                          )}
                          onClick={() => setSuspensionType("permanent")}
                          type="button"
                        >
                          Permanent
                        </button>
                      </div>
                    </fieldset>

                    {suspensionType === "temporary" && (
                      <div>
                        <label
                          className="type-ui-sm mb-2 block font-medium text-neutral-900"
                          htmlFor="suspension-duration"
                        >
                          Duration (days)
                        </label>
                        <select
                          className="w-full rounded-lg border border-neutral-200 px-4 py-2"
                          id="suspension-duration"
                          onChange={(e) => setSuspensionDays(Number.parseInt(e.target.value, 10))}
                          value={suspensionDays}
                        >
                          <option value="1">1 day</option>
                          <option value="3">3 days</option>
                          <option value="7">7 days</option>
                          <option value="14">14 days</option>
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label
                        className="type-ui-sm mb-2 block font-medium text-neutral-900"
                        htmlFor="suspension-reason"
                      >
                        Reason <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3"
                        id="suspension-reason"
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        placeholder="Provide a reason for suspension..."
                        rows={4}
                        value={suspensionReason}
                      />
                    </div>
                  </div>
                )}

                {bulkAction === "message" && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label
                        className="type-ui-sm mb-2 block font-medium text-neutral-900"
                        htmlFor="message-subject"
                      >
                        Subject <span className="text-red-600">*</span>
                      </label>
                      <input
                        className="w-full rounded-lg border border-neutral-200 px-4 py-2"
                        id="message-subject"
                        onChange={(e) => setMessageSubject(e.target.value)}
                        placeholder="Message subject..."
                        type="text"
                        value={messageSubject}
                      />
                    </div>

                    <div>
                      <label
                        className="type-ui-sm mb-2 block font-medium text-neutral-900"
                        htmlFor="message-content"
                      >
                        Message <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3"
                        id="message-content"
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Message content..."
                        rows={6}
                        value={messageContent}
                      />
                    </div>
                  </div>
                )}

                {/* Confirm/Cancel Buttons */}
                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-900 text-sm transition hover:bg-neutral-50"
                    onClick={closeConfirmModal}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-rausch-500 px-6 py-3 font-semibold text-sm text-white transition hover:bg-rausch-600 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isProcessing}
                    onClick={executeBulkOperation}
                    type="button"
                  >
                    {isProcessing ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </>
            )}

            {/* Progress Display */}
            {progress && <ProgressDisplay onClose={closeConfirmModal} progress={progress} />}
          </div>
        </div>
      )}
    </div>
  );
}
