/**
 * User Details - Overview Tab
 *
 * Displays user profile information, verification status (professionals),
 * performance metrics, and services/customer metrics
 */

"use client";

import { memo } from "react";
import { formatCOP } from "@/lib/utils/format";
import {
  extractCustomerData,
  extractProfessionalData,
  formatAvgRating,
  getVerificationStatus,
} from "./helpers";
import { DataField, MetricCard, SectionCard, VerificationBadge } from "./shared-components";
import { OverviewSkeleton } from "./skeletons";
import type { BaseUser } from "./types";

type OverviewTabProps = {
  user: BaseUser;
  data?: unknown;
};

/**
 * OverviewTab - Lia Design System
 * Professional, data-focused layout with rounded corners and clear hierarchy
 * Memoized to prevent re-renders when other tabs change
 */
export const OverviewTab = memo(function OverviewTab({ user, data }: OverviewTabProps) {
  if (!data) {
    return <OverviewSkeleton />;
  }

  const isProfessional = user.role === "professional";
  const isCustomer = user.role === "customer";

  // Extract API data using helper functions
  const apiData = data as any;
  const professionalData = extractProfessionalData(apiData, isProfessional);
  const customerData = extractCustomerData(apiData, isCustomer);

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <SectionCard title="Profile Information">
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          <DataField label="Email" value={user.email || "—"} />
          <DataField label="Phone" value={user.phone || "—"} />
          <DataField label="City" value={user.city || "—"} />
          <DataField label="Address" value={user.address || "—"} />
          <DataField
            label="Member Since"
            value={new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <DataField
            label="Role"
            value={
              <span className="inline-block rounded-full border border-neutral-900 bg-neutral-900 px-2 py-1 font-medium text-white text-xs tracking-wider">
                {user.role}
              </span>
            }
          />
        </div>
      </SectionCard>

      {/* Professional-Specific Content */}
      {isProfessional && professionalData && (
        <>
          {/* Verification Status Card */}
          <SectionCard title="Verification Status">
            {professionalData.verification ? (
              <div className="grid gap-4 md:grid-cols-3">
                <VerificationBadge
                  label="Identity Verification"
                  status={getVerificationStatus(professionalData.verification, "identity")}
                />
                <VerificationBadge
                  label="Background Check"
                  status={professionalData.verification.background_check_status || "pending"}
                />
                <VerificationBadge
                  label="Documents"
                  status={getVerificationStatus(professionalData.verification, "documents")}
                />
              </div>
            ) : (
              <p className="text-neutral-600 text-sm">No verification data available</p>
            )}
          </SectionCard>

          {/* Performance Metrics */}
          <SectionCard title="Performance Metrics">
            <div className="grid gap-6 md:grid-cols-5">
              <MetricCard
                label="Total Bookings"
                value={professionalData.metrics.totalBookings.toString()}
              />
              <MetricCard
                label="Completed"
                value={professionalData.metrics.completedBookings.toString()}
              />
              <MetricCard
                label="Completion Rate"
                value={`${professionalData.metrics.completionRate}%`}
              />
              <MetricCard
                label="Avg Rating"
                value={formatAvgRating(professionalData.metrics.avgRating)}
              />
              <MetricCard
                label="Total Reviews"
                value={professionalData.metrics.totalReviews.toString()}
              />
            </div>
          </SectionCard>

          {/* Services Offered */}
          <SectionCard title="Services Offered">
            <div className="flex flex-wrap gap-2">
              {professionalData.services.length > 0 ? (
                professionalData.services.map((service: any, idx: number) => (
                  <span
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 font-medium text-neutral-900 text-sm"
                    key={service.id || idx}
                  >
                    {service.service_name || service.name || "Service"}
                  </span>
                ))
              ) : (
                <p className="text-neutral-600 text-sm">No services listed</p>
              )}
            </div>
          </SectionCard>

          {/* Bio/Description */}
          {professionalData.profile?.bio && (
            <SectionCard title="Bio">
              <p className="text-neutral-700 leading-relaxed">{professionalData.profile.bio}</p>
            </SectionCard>
          )}
        </>
      )}

      {/* Customer-Specific Content */}
      {isCustomer && customerData && (
        <SectionCard title="Account Metrics">
          <div className="grid gap-6 md:grid-cols-5">
            <MetricCard
              label="Total Bookings"
              value={customerData.metrics.totalBookings.toString()}
            />
            <MetricCard
              label="Completed"
              value={customerData.metrics.completedBookings.toString()}
            />
            <MetricCard label="Total Spent" value={formatCOP(customerData.metrics.totalSpent)} />
            <MetricCard
              label="Saved Addresses"
              value={customerData.metrics.addressCount.toString()}
            />
            <MetricCard
              label="Favorite Pros"
              value={customerData.metrics.favoritesCount.toString()}
            />
          </div>
        </SectionCard>
      )}
    </div>
  );
});
