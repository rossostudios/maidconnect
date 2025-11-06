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
}: {
  user: User;
  activeSuspension: Suspension | null;
  onManageSuspension: () => void;
}) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EBE5D8]">
          {user.avatar_url ? (
            <Image
              alt={user.full_name || "User"}
              className="h-16 w-16 rounded-full object-cover"
              height={64}
              src={user.avatar_url}
              width={64}
            />
          ) : (
            <span className="type-ui-lg font-medium text-[#8A8985]">
              {(user.full_name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="type-ui-md font-semibold text-[#121110]">
            {user.full_name || "Unnamed User"}
          </h2>
          <p className="type-body-sm text-[#8A8985]">{user.email}</p>
          <span className="type-ui-sm mt-2 inline-block rounded-lg bg-[#FFE8D9] px-3 py-1 font-medium text-[#FF5D46] capitalize">
            {user.role}
          </span>
        </div>
      </div>
      <button
        className="type-ui-sm rounded-lg bg-[#FF5D46] px-4 py-2 font-medium text-white transition-colors hover:bg-[#E54A35]"
        onClick={onManageSuspension}
        type="button"
      >
        {activeSuspension ? "Manage Suspension" : "Suspend/Ban"}
      </button>
    </div>
  );
}

export function SuspensionAlert({ suspension }: { suspension: Suspension }) {
  const isPermanent = suspension.type === "permanent";

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-[#E85D48]/10 p-4">
      <p className="type-ui-sm mb-2 font-medium text-red-800">
        {isPermanent ? "Banned" : "Suspended"}
      </p>
      <p className="type-body-sm mb-1 text-red-700">Reason: {suspension.reason}</p>
      <p className="type-body-sm text-red-700">
        By: {suspension.suspended_by.full_name || "Admin"}
      </p>
      {suspension.expires_at && (
        <p className="type-body-sm mt-1 text-red-700">
          {formatSuspensionDuration(suspension.expires_at)}
        </p>
      )}
    </div>
  );
}

export function UserDetailsGrid({ user }: { user: User }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="type-ui-sm mb-1 font-medium text-[#121110]">Phone</p>
        <p className="type-body-sm text-[#8A8985]">{user.phone || "—"}</p>
      </div>
      <div>
        <p className="type-ui-sm mb-1 font-medium text-[#121110]">City</p>
        <p className="type-body-sm text-[#8A8985]">{user.city || "—"}</p>
      </div>
      <div>
        <p className="type-ui-sm mb-1 font-medium text-[#121110]">Address</p>
        <p className="type-body-sm text-[#8A8985]">{user.address || "—"}</p>
      </div>
      <div>
        <p className="type-ui-sm mb-1 font-medium text-[#121110]">Joined</p>
        <p className="type-body-sm text-[#8A8985]">
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
    return <p className="type-body-sm text-[#8A8985]">No suspension history</p>;
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
  const statusBgColor = isPermanent ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className="rounded-lg border border-[#EBE5D8] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`rounded px-2 py-1 font-medium text-xs ${statusBgColor}`}>
          {isPermanent ? "Banned" : "Suspended"}
        </span>
        {suspension.lifted_at && (
          <span className="rounded bg-green-100 px-2 py-1 font-medium text-green-800 text-xs">
            Lifted
          </span>
        )}
      </div>
      <p className="type-body-sm mb-1 text-[#121110]">Reason: {suspension.reason}</p>
      <p className="type-body-sm text-[#8A8985]">
        Date: {new Date(suspension.suspended_at).toLocaleDateString()}
      </p>
      {suspension.lifted_at && (
        <p className="type-body-sm text-[#8A8985]">
          Lifted: {new Date(suspension.lifted_at).toLocaleDateString()}
        </p>
      )}
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
    <div className="rounded-2xl border border-[#EBE5D8] bg-white p-6">
      <h3 className="type-ui-md mb-4 font-semibold text-[#121110]">Stats</h3>
      <div className="space-y-4">
        {stats.bookings && (
          <>
            <div>
              <p className="type-ui-sm font-medium text-[#121110]">Total Bookings</p>
              <p className="type-ui-lg font-bold text-[#FF5D46]">{stats.bookings.total}</p>
            </div>
            <div>
              <p className="type-ui-sm font-medium text-[#121110]">Completed</p>
              <p className="type-ui-lg font-bold text-green-600">{stats.bookings.completed}</p>
            </div>
          </>
        )}
        <div>
          <p className="type-ui-sm font-medium text-[#121110]">Disputes</p>
          <p className="type-ui-lg font-bold text-[#FF5D46]">{stats.disputes}</p>
        </div>
      </div>
    </div>
  );
}
