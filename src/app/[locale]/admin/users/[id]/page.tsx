/**
 * Admin User Detail Page
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserModerationModal } from "@/components/admin/user-moderation-modal";
import { formatSuspensionDuration } from "@/lib/admin-utils";

type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
};

type Suspension = {
  id: string;
  type: string;
  reason: string;
  suspended_at: string;
  expires_at: string | null;
  suspended_by: { id: string; full_name: string | null };
};

type UserDetail = {
  user: User;
  professionalProfile: any | null;
  activeSuspension: Suspension | null;
  suspensionHistory: any[];
  stats: {
    bookings: { total: number; completed: number } | null;
    disputes: number;
  };
};

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="type-body-sm text-[#8A8985]">Loading user data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="type-body-sm text-[#8A8985]">User not found</p>
      </div>
    );
  }

  const { user, activeSuspension, suspensionHistory, stats } = userData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          className="type-ui-sm mb-4 text-[#FF5D46] hover:underline"
          onClick={() => router.back()}
        >
          ← Back to Users
        </button>
        <h1 className="type-ui-lg font-semibold text-[#121110]">User Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-[#EBE5D8] bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EBE5D8]">
                  {user.avatar_url ? (
                    <img
                      alt={user.full_name || "User"}
                      className="h-16 w-16 rounded-full object-cover"
                      src={user.avatar_url}
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
                onClick={() => setShowModerationModal(true)}
              >
                {activeSuspension ? "Manage Suspension" : "Suspend/Ban"}
              </button>
            </div>

            {activeSuspension && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="type-ui-sm mb-2 font-medium text-red-800">
                  {activeSuspension.type === "permanent" ? "Banned" : "Suspended"}
                </p>
                <p className="type-body-sm mb-1 text-red-700">Reason: {activeSuspension.reason}</p>
                <p className="type-body-sm text-red-700">
                  By: {activeSuspension.suspended_by.full_name || "Admin"}
                </p>
                {activeSuspension.expires_at && (
                  <p className="type-body-sm mt-1 text-red-700">
                    {formatSuspensionDuration(activeSuspension.expires_at)}
                  </p>
                )}
              </div>
            )}

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
          </div>

          <div className="rounded-2xl border border-[#EBE5D8] bg-white p-6">
            <h3 className="type-ui-md mb-4 font-semibold text-[#121110]">Suspension History</h3>
            {suspensionHistory.length === 0 ? (
              <p className="type-body-sm text-[#8A8985]">No suspension history</p>
            ) : (
              <div className="space-y-4">
                {suspensionHistory.map((suspension: any) => (
                  <div className="rounded-lg border border-[#EBE5D8] p-4" key={suspension.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={
                          "rounded px-2 py-1 font-medium text-xs" +
                          (suspension.suspension_type === "permanent"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800")
                        }
                      >
                        {suspension.suspension_type === "permanent" ? "Banned" : "Suspended"}
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
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
                    <p className="type-ui-lg font-bold text-green-600">
                      {stats.bookings.completed}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="type-ui-sm font-medium text-[#121110]">Disputes</p>
                <p className="type-ui-lg font-bold text-[#FF5D46]">{stats.disputes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModerationModal && (
        <UserModerationModal
          onClose={() => setShowModerationModal(false)}
          onComplete={() => {
            setShowModerationModal(false);
            loadUserData();
          }}
          user={{
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            suspension: activeSuspension
              ? {
                  type: activeSuspension.type as "temporary" | "permanent",
                  reason: activeSuspension.reason,
                  expires_at: activeSuspension.expires_at,
                }
              : null,
          }}
        />
      )}
    </div>
  );
}
