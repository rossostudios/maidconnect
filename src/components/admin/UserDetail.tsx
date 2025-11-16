// Helper components to reduce complexity in UserDetailPage

import Image from "next/image";
import { formatSuspensionDuration } from "@/lib/adminUtils";

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
        <div className="rounded-full flex h-16 w-16 items-center justify-center bg-[neutral-200]">
          {user.avatar_url ? (
            <Image
              alt={user.full_name || "User"}
              className="rounded-full h-16 w-16 object-cover"
              height={64}
              src={user.avatar_url}
              width={64}
            />
          ) : (
            <span className="type-ui-lg font-medium text-neutral-600 dark:text-neutral-400">
              {(user.full_name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="type-ui-md font-semibold text-neutral-900 dark:text-neutral-100">
            {user.full_name || "Unnamed User"}
          </h2>
          <p className="type-body-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
          <span className="type-ui-sm mt-2 inline-block bg-neutral-900 px-3 py-1 font-medium text-white capitalize dark:bg-neutral-100/10 dark:text-neutral-100">
            {user.role}
          </span>
        </div>
      </div>
      <button
        className="type-ui-sm bg-neutral-900 px-4 py-2 font-medium text-white transition-colors hover:bg-neutral-900 dark:bg-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
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
    <div className="mb-6 border border-neutral-300 bg-neutral-100 p-4 dark:border-red-800 dark:bg-red-950">
      <p className="type-ui-sm mb-2 font-medium text-neutral-900 dark:text-neutral-100">
        {isPermanent ? "Banned" : "Suspended"}
      </p>
      <p className="type-body-sm mb-1 text-neutral-900 dark:text-neutral-100">
        Reason: {suspension.reason}
      </p>
      <p className="type-body-sm text-neutral-800 dark:text-neutral-300">
        By: {suspension.suspended_by.full_name || "Admin"}
      </p>
      {suspension.expires_at && (
        <p className="type-body-sm mt-1 text-neutral-900 dark:text-neutral-100">
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
        <p className="type-ui-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">Phone</p>
        <p className="type-body-sm text-neutral-600 dark:text-neutral-400">{user.phone || "—"}</p>
      </div>
      <div>
        <p className="type-ui-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">City</p>
        <p className="type-body-sm text-neutral-600 dark:text-neutral-400">{user.city || "—"}</p>
      </div>
      <div>
        <p className="type-ui-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">
          Address
        </p>
        <p className="type-body-sm text-neutral-600 dark:text-neutral-400">{user.address || "—"}</p>
      </div>
      <div>
        <p className="type-ui-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">Joined</p>
        <p className="type-body-sm text-neutral-600 dark:text-neutral-400">
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
      <p className="type-body-sm text-neutral-600 dark:text-neutral-400">No suspension history</p>
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
  const statusBgColor = isPermanent
    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
    : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100";

  return (
    <div className="border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="mb-2 flex items-center justify-between">
        <span className={`px-2 py-1 font-medium text-xs ${statusBgColor}`}>
          {isPermanent ? "Banned" : "Suspended"}
        </span>
        {suspension.lifted_at && (
          <span className="bg-neutral-900 px-2 py-1 font-medium text-white text-xs dark:bg-neutral-100/10 dark:text-neutral-100">
            Lifted
          </span>
        )}
      </div>
      <p className="type-body-sm mb-1 text-neutral-900 dark:text-neutral-100">
        Reason: {suspension.reason}
      </p>
      <p className="type-body-sm text-neutral-600 dark:text-neutral-400">
        Date: {new Date(suspension.suspended_at).toLocaleDateString()}
      </p>
      {suspension.lifted_at && (
        <p className="type-body-sm text-neutral-600 dark:text-neutral-400">
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
    <div className="border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h3 className="type-ui-md mb-4 font-semibold text-neutral-900 dark:text-neutral-100">
        Stats
      </h3>
      <div className="space-y-4">
        {stats.bookings && (
          <>
            <div>
              <p className="type-ui-sm font-medium text-neutral-900 dark:text-neutral-100">
                Total Bookings
              </p>
              <p className="type-ui-lg font-bold text-neutral-900 dark:text-neutral-100">
                {stats.bookings.total}
              </p>
            </div>
            <div>
              <p className="type-ui-sm font-medium text-neutral-900 dark:text-neutral-100">
                Completed
              </p>
              <p className="type-ui-lg font-bold text-neutral-900 dark:text-neutral-100">
                {stats.bookings.completed}
              </p>
            </div>
          </>
        )}
        <div>
          <p className="type-ui-sm font-medium text-neutral-900 dark:text-neutral-100">Disputes</p>
          <p className="type-ui-lg font-bold text-neutral-900 dark:text-neutral-100">
            {stats.disputes}
          </p>
        </div>
      </div>
    </div>
  );
}
