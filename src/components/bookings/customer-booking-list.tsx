"use client";

export type CustomerBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  duration_minutes: number | null;
  service_name: string | null;
  amount_authorized: number | null;
  amount_captured: number | null;
  currency: string | null;
  created_at: string;
  professional: { full_name: string | null; profile_id: string } | null;
};

type Props = {
  bookings: CustomerBooking[];
};

export function CustomerBookingList({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-8 text-center">
        <p className="text-sm text-[#7a6d62]">No bookings yet.</p>
        <p className="mt-2 text-sm text-[#7a6d62]">
          Browse our{" "}
          <a href="/professionals" className="font-semibold text-[#fd857f] hover:text-[#eb6c65]">
            professional directory
          </a>{" "}
          to book your first service.
        </p>
      </div>
    );
  }

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    if (!b.scheduled_start) return false;
    return new Date(b.scheduled_start) > now && !["declined", "canceled", "completed"].includes(b.status);
  });
  const pastBookings = bookings.filter(b => {
    if (!b.scheduled_start) return true;
    return new Date(b.scheduled_start) <= now || ["declined", "canceled", "completed"].includes(b.status);
  });

  return (
    <div className="space-y-8">
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[#211f1a]">Upcoming Services</h3>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isUpcoming />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-[#211f1a]">Past Services</h3>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isUpcoming={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, isUpcoming }: { booking: CustomerBooking; isUpcoming: boolean }) {
  const scheduled = booking.scheduled_start
    ? new Date(booking.scheduled_start).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not scheduled";

  const amount = booking.amount_captured || booking.amount_authorized;
  const amountDisplay = amount
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: booking.currency || "COP",
        maximumFractionDigits: 0,
      }).format(amount / 100)
    : "—";

  const statusColor = {
    pending_payment: "bg-gray-100 text-gray-800",
    authorized: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-800",
    completed: "bg-blue-100 text-blue-800",
  }[booking.status] || "bg-gray-100 text-gray-800";

  return (
    <div className="rounded-xl border border-[#f0ece5] bg-white/90 p-5 shadow-sm transition hover:border-[#fd857f40]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-[#211f1a]">{booking.service_name || "Service"}</h4>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
              {booking.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="mt-2 space-y-1 text-sm text-[#7a6d62]">
            <p>
              <span className="font-medium">Professional:</span>{" "}
              {booking.professional?.full_name || "Not assigned"}
            </p>
            <p>
              <span className="font-medium">Scheduled:</span> {scheduled}
            </p>
            {booking.duration_minutes && (
              <p>
                <span className="font-medium">Duration:</span> {booking.duration_minutes} minutes
              </p>
            )}
            <p>
              <span className="font-medium">Amount:</span> {amountDisplay}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {booking.status === "confirmed" && isUpcoming && (
            <>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#f0e1dc] px-3 py-1.5 text-xs font-semibold text-[#7a6d62] transition hover:border-[#fd857f] hover:text-[#fd857f]"
              >
                Reschedule
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
              >
                Cancel
              </button>
            </>
          )}
          {booking.status === "completed" && !isUpcoming && (
            <>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-[#fd857f] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#eb6c65]"
              >
                Leave Review
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-[#f0e1dc] px-3 py-1.5 text-xs font-semibold text-[#7a6d62] transition hover:border-[#fd857f] hover:text-[#fd857f]"
              >
                Book Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
