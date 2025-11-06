/**
 * Admin User Detail Page
 */

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  SuspensionAlert,
  SuspensionHistoryList,
  UserDetailsGrid,
  UserProfileHeader,
  UserStatsCard,
} from "@/components/admin/user-detail-helpers";
import { UserModerationModal } from "@/components/admin/user-moderation-modal";

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

  const loadUserData = useCallback(async () => {
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
  }, [params.id]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

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
          type="button"
        >
          ← Back to Users
        </button>
        <h1 className="type-ui-lg font-semibold text-[#121110]">User Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-[#EBE5D8] bg-white p-6">
            <UserProfileHeader
              activeSuspension={activeSuspension}
              onManageSuspension={() => setShowModerationModal(true)}
              user={user}
            />

            {activeSuspension && <SuspensionAlert suspension={activeSuspension} />}

            <UserDetailsGrid user={user} />
          </div>

          <div className="rounded-2xl border border-[#EBE5D8] bg-white p-6">
            <h3 className="type-ui-md mb-4 font-semibold text-[#121110]">Suspension History</h3>
            <SuspensionHistoryList suspensionHistory={suspensionHistory} />
          </div>
        </div>

        <div className="space-y-6">
          <UserStatsCard stats={stats} />
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
