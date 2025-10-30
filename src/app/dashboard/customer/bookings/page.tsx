import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { CustomerBookingList } from "@/components/bookings/customer-booking-list";

export default async function CustomerBookingsPage() {
  const user = await requireUser({ allowedRoles: ["customer"] });
  const supabase = await createSupabaseServerClient();

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      scheduled_start,
      duration_minutes,
      service_name,
      amount_authorized,
      amount_captured,
      currency,
      created_at,
      professional:professional_profiles!professional_id(full_name, profile_id)
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData as Array<{
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
  }> | null) ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#211f1a]">My Bookings</h1>
        <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
          View and manage your upcoming and past service appointments.
        </p>
      </div>

      <div className="rounded-[28px] border border-[#ebe5d8] bg-white p-8 shadow-[0_10px_40px_rgba(18,17,15,0.04)]">
        <CustomerBookingList bookings={bookings} />
      </div>
    </section>
  );
}
