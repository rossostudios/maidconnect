/**
 * Admin User Detail Page - Enhanced with Tab Architecture
 *
 * Features:
 * - Tab-based navigation (Overview, Activity, Finances, Reviews)
 * - Lazy loading of tab data (fetched only when clicked)
 * - Role-aware content (Professional vs Customer views)
 * - Lia Design System compliant (sharp corners, clean layout)
 */

"use client";

import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { DirectMessageModal } from "@/components/admin/direct-message-modal";
import { ProfessionalVerificationModal } from "@/components/admin/professional-verification-modal";
import { SuspensionAlert, UserProfileHeader } from "@/components/admin/user-detail-helpers";
import { UserDetailsTabs } from "@/components/admin/user-details-tabs";
import { UserModerationModal } from "@/components/admin/user-moderation-modal";
import { useRealtimeUserStatus } from "@/hooks/useRealtimeUserStatus";

type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "customer" | "professional" | "admin";
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

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const router = useRouter();

  // Real-time subscription for suspension status updates
  const { activeSuspension: realtimeSuspension, isConnected } = useRealtimeUserStatus({
    userId: id,
    initialSuspension: userData?.activeSuspension
      ? {
          id: userData.activeSuspension.id,
          user_id: id,
          suspension_type: userData.activeSuspension.type as "temporary" | "permanent",
          reason: userData.activeSuspension.reason,
          suspended_at: userData.activeSuspension.suspended_at,
          expires_at: userData.activeSuspension.expires_at,
          is_active: true,
          suspended_by: userData.activeSuspension.suspended_by
            ? {
                full_name: userData.activeSuspension.suspended_by.full_name,
              }
            : undefined,
        }
      : null,
    enabled: !!userData, // Only enable after initial data is loaded
  });

  // Map real-time suspension to component format
  const activeSuspension: Suspension | null = realtimeSuspension
    ? {
        id: realtimeSuspension.id,
        type: realtimeSuspension.suspension_type,
        reason: realtimeSuspension.reason,
        suspended_at: realtimeSuspension.suspended_at,
        expires_at: realtimeSuspension.expires_at,
        suspended_by: {
          id: "", // Not available from real-time payload
          full_name: realtimeSuspension.suspended_by?.full_name || null,
        },
      }
    : null;

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`);
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
  }, [id]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Admin action handlers
  const handleVerifyProfessional = useCallback(() => {
    setShowVerificationModal(true);
  }, []);

  const handleSendMessage = useCallback(() => {
    setShowMessageModal(true);
  }, []);

  const handleExportData = useCallback(async () => {
    try {
      // TODO: Implement full data export API endpoint
      const response = await fetch(`/api/admin/users/${id}/export`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to export user data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `user-${id}-export.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting user data:", error);
      alert("Failed to export user data. Please try again.");
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-neutral-500 text-sm">Loading user data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-neutral-500 text-sm">User not found</p>
      </div>
    );
  }

  const { user } = userData;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header with back button */}
      <div className="mb-8">
        <button
          className="mb-4 flex items-center gap-2 font-medium text-neutral-500 text-sm transition-colors hover:text-neutral-900"
          onClick={() => router.back()}
          type="button"
        >
          ← Back to Users
        </button>
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-3xl text-neutral-900 tracking-tight">User Details</h1>
          {/* Real-time connection status */}
          {isConnected ? (
            <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 font-medium text-green-700 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 font-medium text-neutral-500 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              Offline
            </span>
          )}
        </div>
      </div>

      {/* User Profile Header - Always visible */}
      <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <UserProfileHeader
          activeSuspension={activeSuspension}
          onExportData={handleExportData}
          onManageSuspension={() => setShowModerationModal(true)}
          onSendMessage={handleSendMessage}
          onVerify={handleVerifyProfessional}
          user={user}
        />

        {activeSuspension && <SuspensionAlert suspension={activeSuspension} />}
      </div>

      {/* Tab-based Content - Lazy loaded */}
      <UserDetailsTabs user={user} />

      {/* Moderation Modal */}
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

      {/* Professional Verification Modal */}
      {showVerificationModal && user.role === "professional" && (
        <ProfessionalVerificationModal
          onClose={() => setShowVerificationModal(false)}
          onComplete={() => {
            setShowVerificationModal(false);
            loadUserData();
          }}
          userId={user.id}
          userName={user.full_name}
        />
      )}

      {/* Direct Message Modal */}
      {showMessageModal && (
        <DirectMessageModal
          onClose={() => setShowMessageModal(false)}
          onComplete={() => {
            setShowMessageModal(false);
          }}
          userEmail={user.email}
          userId={user.id}
          userName={user.full_name}
        />
      )}
    </div>
  );
}
