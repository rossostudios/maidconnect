import { Suspense } from "react";
import { geistSans } from "@/app/fonts";
import { BookingManagementDashboard } from "@/components/admin/booking-management-dashboard";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Admin Bookings Management Page - Lia Design System
 *
 * Features:
 * - View all bookings with country filtering (via AdminCountryFilterContext)
 * - Filter by status (pending, confirmed, completed, cancelled)
 * - Search by service name or address
 * - Real-time updates when country selector changes
 * - Click booking ID to view details
 * - Anthropic-inspired design (rounded corners, warm neutrals, orange accents)
 */
export default async function AdminBookingsPage() {
  await requireUser({ allowedRoles: ["admin"] });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1
          className={cn(
            "font-medium text-2xl text-neutral-900 tracking-tight",
            geistSans.className
          )}
        >
          Booking Management
        </h1>
        <p className={cn("mt-1 text-neutral-600 text-sm", geistSans.className)}>
          View and manage all platform bookings. Use the country filter in the header to narrow
          results.
        </p>
      </div>

      {/* Booking Management Dashboard */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-12">
            <p className={cn("text-neutral-600 text-sm", geistSans.className)}>
              Loading bookings...
            </p>
          </div>
        }
      >
        <BookingManagementDashboard />
      </Suspense>
    </div>
  );
}
