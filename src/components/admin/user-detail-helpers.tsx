// Helper components to reduce complexity in UserDetailPage

import Image from "next/image";
import { formatSuspensionDuration } from "@/lib/admin-utils";

type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  role: string;
  created_at: string;
};

type Suspension = {
  id: string;
  type: string;
  reason: string;
  expires_at: string | null;
  suspended_by: {
    full_name: string | null;
  };
};

type SuspensionHistoryItem = {
  id: string;
  suspension_type: string;
  reason: string;
  suspended_at: string;
  lifted_at: string | null;
};

export function UserProfileHeader({
  user,
  activeSuspension,
  onManageSuspension,
  onVerify,
  onSendMessage,
  onExportData,
}: {
  user: User;
  activeSuspension: Suspension | null;
  onManageSuspension: () => void;
  onVerify?: () => void;
  onSendMessage?: () => void;
  onExportData?: () => void;
}) {
  const isProfessional = user.role === "professional";

  return (
    <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
          {user.avatar_url ? (
            <Image
              alt={user.full_name || "User"}
              className="h-16 w-16 object-cover"
              height={64}
              src={user.avatar_url}
              width={64}
            />
          ) : (
            <span className="font-medium text-2xl text-neutral-400">
              {(user.full_name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900 text-xl tracking-tight">
            {user.full_name || "Unnamed User"}
          </h2>
          <p className="text-neutral-500 text-sm">{user.email}</p>
          <span className="mt-2 inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium text-neutral-900 text-xs capitalize">
            {user.role}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {isProfessional && onVerify && (
          <button
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-700 text-sm transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            onClick={onVerify}
            type="button"
          >
            Verify Professional
          </button>
        )}
        {onSendMessage && (
          <button
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-700 text-sm transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            onClick={onSendMessage}
            type="button"
          >
            Send Message
          </button>
        )}
        {onExportData && (
          <button
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-700 text-sm transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            onClick={onExportData}
            type="button"
          >
            Export Data
          </button>
        )}
        <button
          className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-neutral-800"
          onClick={onManageSuspension}
          type="button"
        >
          {activeSuspension ? "Manage Suspension" : "Suspend/Ban"}
        </button>
      </div>
    </div>
  );
}

export function SuspensionAlert({ suspension }: { suspension: Suspension }) {
  const isPermanent = suspension.type === "permanent";

  return (
    <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2 w-2 rounded-full bg-red-500" />
        <div>
          <p className="font-semibold text-red-900 text-sm">
            {isPermanent ? "Account Banned" : "Account Suspended"}
          </p>
          <p className="mt-1 text-red-700 text-sm">Reason: {suspension.reason}</p>
          <div className="mt-2 flex items-center gap-3 text-red-600 text-xs">
            <span>By: {suspension.suspended_by.full_name || "Admin"}</span>
            {suspension.expires_at && (
              <span>• Expires: {formatSuspensionDuration(suspension.expires_at)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserDetailsGrid({ user }: { user: User }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">Phone</p>
        <p className="font-medium text-neutral-900 text-sm">{user.phone || "—"}</p>
      </div>
      <div>
        <p className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">City</p>
        <p className="font-medium text-neutral-900 text-sm">{user.city || "—"}</p>
      </div>
      <div>
        <p className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">
          Address
        </p>
        <p className="font-medium text-neutral-900 text-sm">{user.address || "—"}</p>
      </div>
      <div>
        <p className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">Joined</p>
        <p className="font-medium text-neutral-900 text-sm">
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export function SuspensionHistoryList({
  suspensionHistory,
}: {
  suspensionHistory: SuspensionHistoryItem[];
}) {
  if (suspensionHistory.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-neutral-200 border-dashed bg-neutral-50">
        <p className="text-neutral-500 text-sm">No suspension history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suspensionHistory.map((suspension) => (
        <SuspensionHistoryCard key={suspension.id} suspension={suspension} />
      ))}
    </div>
  );
}

function SuspensionHistoryCard({ suspension }: { suspension: SuspensionHistoryItem }) {
  const isPermanent = suspension.suspension_type === "permanent";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
            isPermanent ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
          }`}
        >
          {isPermanent ? "Banned" : "Suspended"}
        </span>
        {suspension.lifted_at && (
          <span className="text-neutral-500 text-xs">
            Lifted on {new Date(suspension.lifted_at).toLocaleDateString()}
          </span>
        )}
      </div>
      <p className="mb-2 font-medium text-neutral-900 text-sm">{suspension.reason}</p>
      <p className="text-neutral-500 text-xs">
        Suspended on {new Date(suspension.suspended_at).toLocaleDateString()}
      </p>
    </div>
  );
}

export function UserStatsCard({
  stats,
}: {
  stats: {
    bookings: { total: number; completed: number } | null;
    disputes: number;
  };
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <h3 className="mb-4 font-semibold text-lg text-neutral-900 tracking-tight">Activity Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.bookings && (
          <>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">
                Total Bookings
              </p>
              <p className="font-bold text-2xl text-neutral-900">{stats.bookings.total}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">
                Completed
              </p>
              <p className="font-bold text-2xl text-neutral-900">{stats.bookings.completed}</p>
            </div>
          </>
        )}
        <div className="rounded-lg bg-neutral-50 p-4">
          <p className="mb-1 font-medium text-neutral-500 text-xs uppercase tracking-wider">
            Disputes
          </p>
          <p className="font-bold text-2xl text-neutral-900">{stats.disputes}</p>
        </div>
      </div>
    </div>
  );
}
